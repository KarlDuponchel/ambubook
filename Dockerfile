# ==================================================
# AmbuBook - Dockerfile Production
# ==================================================

FROM node:20-alpine AS base

# ==================================================
# 1. Install dependencies
# ==================================================
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --ignore-scripts

# ==================================================
# 2. Build the application
# ==================================================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables factices requises UNIQUEMENT au build (module-eval de Next lors de la
# collecte des routes). Elles restent dans ce stage `builder` : le stage `runner`
# repart de `base` et ne les hérite pas → aucun secret dans l'image finale.
# Au runtime, Scaleway injecte les vraies valeurs (process.env serveur lu au runtime).
#  - DATABASE_URL : exigé par prisma.config.ts (env('DATABASE_URL')) ; aucune connexion.
#  - BETTER_AUTH_SECRET : better-auth throw si absent en NODE_ENV=production.
#  - GOOGLE_CLIENT_ID/SECRET : le provider Google de better-auth valide leur présence.
#  - RESEND_API_KEY : new Resend(...) construit au chargement de lib/email.ts.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV BETTER_AUTH_SECRET="build-placeholder-not-used-at-runtime"
ENV GOOGLE_CLIENT_ID="build-placeholder"
ENV GOOGLE_CLIENT_SECRET="build-placeholder"
ENV RESEND_API_KEY="re_build_placeholder"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==================================================
# 3. Production image
# ==================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma generated client
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
