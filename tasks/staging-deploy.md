# Runbook — Déploiement Staging (Scaleway)

> Environnement de **pré-production sans vraies données de santé** (HDS/AIPD encore en cours).
> Approche : **Console Scaleway** pour l'infra + **Docker local** pour l'image/migrations.
> ⚠️ Aucun secret ne doit figurer dans ce fichier (versionné). Secrets stockés hors repo.

## Décisions
- Services externes : **minimal fonctionnel** (DB + S3 réels, Resend si clé, Twilio désactivé).
- Région : `fr-par` partout.
- Registry / DB / Container : namespace privé dédié staging.

---

## ⏸️ REPRISE — état au 2026-08-02 (mis en pause)

**Où on s'est arrêté** : étapes 1→6 + image terminées. On était sur le point de **créer/déployer le Serverless Container** (étape 7). **La DB managée a été SUPPRIMÉE pour ne pas payer** (voir plus bas) → il faut la **recréer** avant de reprendre.

**Ressources persistantes (conservées)**
- **Registry** : `rg.fr-par.scw.cloud/ambubook` — image `ambubook/ambubook:staging` (digest `sha256:12252d…`, avec correctif SSL). Coût stockage négligeable, on garde.
- **Compte admin** : `contact@ambubook.fr` — **disparaît avec la DB**, sera recréé par `create-admin` à la reprise.

**Ressources supprimées (à recréer)**
- **DB managée** : supprimée. L'ancien endpoint `62.210.39.33:14231` n'est plus valide. Nouvelle instance = nouveaux host/port/password.

**Secrets** : dans `.env.staging` (racine, gitignoré). `DATABASE_URL` à **remettre à jour** avec le nouvel endpoint. NE JAMAIS mettre de secret dans ce fichier versionné.

**⚠️ Sécurité à faire** : révoquer/régénérer la clé API Scaleway + choisir un nouveau mot de passe DB fort (les anciens ont transité en clair dans le chat).

### 🔄 Recréer la DB + reprendre (ordre exact)

1. **Console Scaleway** → Managed PostgreSQL → créer une instance `fr-par` (`DB-DEV-S` suffit) :
   - user `ambubook` + **nouveau** mot de passe fort
   - créer la base **`ambubook`**
   - onglet **Permissions** : accorder **« All »** au couple user `ambubook` / base `ambubook` (sinon `permission denied ... CONNECT`)
   - onglet **ACL / Allowed IPs** : autoriser votre IP publique
2. **`.env.staging`** → remplacer la ligne `DATABASE_URL` avec le nouvel endpoint :
   ```
   DATABASE_URL="postgresql://ambubook:<NOUVEAU_PWD>@<NOUVEAU_HOST>:<PORT>/ambubook?sslmode=require"
   ```
3. **Migrations + admin** (depuis la racine du projet) :
   ```bash
   set -a; . ./.env.staging; set +a
   npx prisma migrate deploy      # recrée les 21 tables
   npm run create-admin           # recrée contact@ambubook.fr (mdp affiché une fois)
   ```
4. Reprendre à l'**étape 7** ci-dessous (déployer le Serverless Container avec la nouvelle `DATABASE_URL`).

> ℹ️ L'image Docker est déjà à jour dans le registry (correctif SSL inclus) → **pas besoin de rebuild** tant que le code ne change pas.

**Correctifs code appliqués (non commités)** : `Dockerfile` (placeholders build), `lib/prisma.ts` (SSL base managée + strip `sslmode`), `scripts/create-admin.ts` (utilise `lib/prisma`), `force-dynamic` sur `sitemap.ts`/`plan-du-site`/`ambulances/[ville]`/`region/[region]`, `.gitignore` (`.env.staging`/`.env.production`). → **à committer**.

---

## Étapes

- [x] 1. Générer les secrets (`BETTER_AUTH_SECRET`, `CRON_SECRET`, `ENCRYPTION_KEY`) — faits, stockés hors repo
- [~] 2. **Managed PostgreSQL** créée puis **SUPPRIMÉE** (pause coûts) → **à recréer** à la reprise (voir section REPRISE)
- [x] 3. Créer le **Container Registry** (namespace privé `fr-par`) → `rg.fr-par.scw.cloud/ambubook`
- [x] 4a. `docker build --platform linux/amd64` → **image `ambubook:latest` OK (347 MB), smoke test `/`=200**
- [x] 4b. tag → login registry → push → **`rg.fr-par.scw.cloud/ambubook/ambubook:staging` OK** (digest sha256:b496...)
- [~] 5. `prisma migrate deploy` → 21 migrations appliquées (**à refaire** sur la nouvelle DB)
- [~] 6. Bootstrap admin `contact@ambubook.fr` (**à refaire** sur la nouvelle DB)
- [x] 4c. **Rebuild + repush image** avec correctif SSL → digest sha256:12252d…
- [ ] 7. Créer le **Serverless Container** (port 3000 + env vars en secrets) — _en cours (console)_
- [ ] 8. Fixer `BETTER_AUTH_URL` = URL du container → redeploy
- [ ] 9. Crons (`/api/cron/*` avec `Authorization: Bearer $CRON_SECRET`) + smoke test

## Variables d'env (Serverless Container staging)
| Variable | Staging |
|----------|---------|
| `DATABASE_URL` | Managed DB `fr-par`, `?sslmode=require` |
| `BETTER_AUTH_SECRET` | secret généré |
| `BETTER_AUTH_URL` | URL du container (étape 8) |
| `ENCRYPTION_KEY` | secret généré (**ne jamais changer**) |
| `CRON_SECRET` | secret généré |
| `S3_*` | Object Storage `fr-par` (bucket staging) |
| `RESEND_API_KEY` / `FROM_EMAIL` / `ADMIN_EMAIL` | si clé Resend dispo |
| `TWILIO_*` | désactivé en staging |
| `NODE_ENV` | `production` |

## Notes
- Build local Windows échoue à la copie `.next/standalone` (caractère `:` interdit sur NTFS) — **normal**, le build Docker Linux n'est pas affecté.
- Migrations : jamais au démarrage du container. Étape séparée (ici, local).
