/**
 * Rate limiting pour les routes API custom
 * Réutilise la table rate_limit de Better Auth
 */

import { prisma } from "./prisma";
import { headers } from "next/headers";

interface RateLimitConfig {
  /** Identifiant unique pour cette limite (ex: "create-transport") */
  identifier: string;
  /** Fenêtre de temps en secondes */
  window: number;
  /** Nombre max de requêtes dans la fenêtre */
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Timestamp de reset
}

/**
 * Récupère l'IP du client
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  // Essayer différents headers selon le proxy/load balancer
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = headersList.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Vérifie et met à jour le rate limit
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { identifier, window, max } = config;
  const ip = await getClientIP();
  const key = `custom:${identifier}:${ip}`;
  const now = Date.now();
  const windowMs = window * 1000;

  try {
    // Chercher l'entrée existante
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!existing) {
      // Première requête - créer l'entrée
      await prisma.rateLimit.create({
        data: {
          key,
          count: 1,
          lastRequest: BigInt(now),
        },
      });
      return { success: true, remaining: max - 1, reset: now + windowMs };
    }

    const lastRequest = Number(existing.lastRequest);
    const windowExpired = now - lastRequest >= windowMs;

    if (windowExpired) {
      // Fenêtre expirée - reset le compteur
      await prisma.rateLimit.update({
        where: { key },
        data: {
          count: 1,
          lastRequest: BigInt(now),
        },
      });
      return { success: true, remaining: max - 1, reset: now + windowMs };
    }

    // Dans la fenêtre active
    if (existing.count >= max) {
      // Limite atteinte
      const reset = lastRequest + windowMs;
      return { success: false, remaining: 0, reset };
    }

    // Incrémenter le compteur
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: existing.count + 1,
        lastRequest: BigInt(now),
      },
    });

    return {
      success: true,
      remaining: max - existing.count - 1,
      reset: lastRequest + windowMs,
    };
  } catch (error) {
    // En cas d'erreur DB, on laisse passer (fail open)
    console.error("Rate limit error:", error);
    return { success: true, remaining: max, reset: now + windowMs };
  }
}

/**
 * Réponse 429 Too Many Requests
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Trop de requêtes. Veuillez réessayer plus tard.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-Retry-After": retryAfter.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}
