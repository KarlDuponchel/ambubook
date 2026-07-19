# Déploiement — AmbuBook

Guide de déploiement en production sur **Scaleway**, pour une application de prise de rendez-vous de transport sanitaire.

> ⚠️ **Données de santé (art. 9 RGPD).** Une réservation de transport sanitaire est une donnée de santé, même sans numéro de Sécu. L'hébergement doit être **certifié HDS**. Scaleway est certifié HDS depuis juillet 2024 — mais la conformité est une **responsabilité partagée** (voir la section HDS en fin de document).

---

## Architecture cible (tout en région `fr-par`, dans le périmètre HDS)

| Brique | Service Scaleway | Rôle |
|--------|------------------|------|
| Application Next.js | **Serverless Containers** | Exécute l'image Docker (déjà `output: "standalone"`) |
| Base de données | **Managed Database for PostgreSQL** | Remplace le Postgres Docker local |
| Fichiers médicaux (ordonnances, cartes vitales, bons de transport) | **Object Storage** (S3) + chiffrement au repos | Déjà pointé sur `s3.fr-par.scw.cloud` |
| Déclenchement des crons | **Scaleway Cron / Scheduler** | Appelle les endpoints `app/api/cron/*` |
| Migrations & tâches ponctuelles | **Serverless Jobs** | `prisma migrate deploy`, bootstrap admin |

Le projet est **déjà prêt** pour ce déploiement :
- `next.config.ts` → `output: "standalone"`
- `Dockerfile` multi-stage (utilisateur non-root, healthcheck, port 3000)
- S3 configuré pour `s3.fr-par.scw.cloud`

---

## Étapes de déploiement

### 1. Provisionner la base de données (une fois)
- Créer une **Managed Database for PostgreSQL** en région `fr-par`.
- Construire le `DATABASE_URL` avec **SSL obligatoire** :
  ```
  postgresql://user:password@host:port/ambubook?sslmode=require
  ```

### 2. Construire et pousser l'image Docker
- Créer un **Container Registry** Scaleway (namespace privé, `fr-par`).
- Build / tag / push :
  ```bash
  # Depuis un Mac ARM, forcer la plateforme :
  docker build --platform linux/amd64 -t rg.fr-par.scw.cloud/<namespace>/ambubook:latest .
  docker login rg.fr-par.scw.cloud -u nologin -p <SCALEWAY_SECRET_KEY>
  docker push rg.fr-par.scw.cloud/<namespace>/ambubook:latest
  ```

### 3. Créer le Serverless Container
- Image = celle du registry, **port 3000**.
- Renseigner **toutes les variables d'environnement** en secrets (voir section Variables).
- `min scale` : mettre **1** (éviter les cold starts pour une app patient), régler CPU/RAM.

### 4. ⚠️ Migrations Prisma (étape séparée, JAMAIS au démarrage du container)
Un container est éphémère et peut tourner en plusieurs instances → risque de migrations concurrentes.
Lancer `prisma migrate deploy` **avant de router le trafic**, via l'une de ces options :
- **CI/CD** : `npx prisma migrate deploy` connecté à la Managed DB, ou
- **Scaleway Serverless Job** : même image, commande `npx prisma migrate deploy`.

C'est aussi ici qu'on lance **une seule fois** le bootstrap admin (voir section dédiée).

### 5. Réseau & sécurité de la base
- Idéalement relier container ↔ base via un **Private Network (VPC)** plutôt qu'une IP publique.
- Sinon, restreindre l'accès par **ACL**.
- Toujours `sslmode=require`.

### 6. Domaine & TLS
- Mapper le domaine custom sur le container (certificat HTTPS géré par Scaleway).
- **Mettre à jour `BETTER_AUTH_URL`** avec l'URL de prod (sinon fallback `localhost:3000` → cookies/redirections cassés — `lib/auth.ts:10`).

### 7. Crons (spécifique à cette app)
Les routes `app/api/cron/*` (rappels J-1, purges) ne se déclenchent pas seules.
- Configurer un **Scaleway Cron / Scheduler** qui appelle chaque endpoint HTTP à intervalle régulier.
- Envoyer le header `Authorization` avec le `CRON_SECRET`.
- Prérequis : rendre `CRON_SECRET` **obligatoire** côté code (voir le bloquant « crons fail-open » dans `tasks/todo.md`).

---

## Bootstrap du premier admin

En base de prod vierge, **aucun chemin d'inscription ne crée un ADMIN** (le rôle est forcé côté serveur). Il faut donc un amorçage hors interface.

- **NE PAS** utiliser `prisma/seed.ts` en prod (mot de passe `admin123` codé en dur + société/ambulancier fictifs).
- Créer `scripts/create-admin.ts` : idempotent, email/mot de passe via env (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) ou mot de passe fort généré affiché une seule fois, refus des mots de passe faibles, `emailVerified: true`, **aucune donnée de démo**.
- Lancer une seule fois au déploiement (via un Serverless Job, même image) :
  ```bash
  npx tsx scripts/create-admin.ts
  ```
- Les admins suivants se créent/se promeuvent via le panneau admin (`app/api/admin/users/[id]`).

---

## Variables d'environnement (prod)

À renseigner en secrets sur le Serverless Container (et dans les Jobs qui touchent la DB) :

| Variable | Note prod |
|----------|-----------|
| `DATABASE_URL` | Managed DB `fr-par`, `?sslmode=require` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | **URL de prod** (pas localhost) |
| `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL` | Emails |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS |
| `S3_REGION`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Object Storage `fr-par` |
| `CRON_SECRET` | `openssl rand -base64 32` — obligatoire en prod |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth (redirect URI de prod à déclarer côté Google) |
| `NEXT_PUBLIC_AXEPTIO_CLIENT_ID` | Consentement cookies |
| `ADMIN_PASSWORD` | Uniquement pour le job de bootstrap admin |

---

## CI/CD (cible)

Pipeline **GitHub Actions** sur push `main` :
1. `build` de l'image Docker
2. `push` vers le Container Registry
3. `npx prisma migrate deploy` (contre la Managed DB)
4. `deploy` du Serverless Container (CLI `scw` ou action Scaleway)

Pour un **premier déploiement**, tout peut se faire manuellement (console Scaleway + Docker local) afin de valider le flux avant de l'automatiser.

---

## Conformité HDS — responsabilité partagée

La certification HDS de Scaleway ne suffit pas à elle seule :

1. **Signer l'avenant / convention HDS** avec Scaleway (contrat spécifique, distinct des CGU standard).
2. **Vérifier que chaque service utilisé est bien dans le périmètre HDS souscrit** (Serverless Containers, Managed DB, Object Storage le sont).
3. **Tout en France / `fr-par`**, aucun transfert hors France/EEE (décret du 24 mars 2026).
4. **Chiffrement au repos** activé sur Object Storage (+ chiffrement applicatif du n° de Sécu / motifs côté app — voir `tasks/todo.md`).
5. **Mettre à jour les mentions légales** : remplacer « Hostinger (Chypre) » par « Scaleway, hébergeur certifié HDS ».
6. **Emails (Resend)** : un email n'est pas un canal HDS → éviter d'y mettre du contenu médical (motif, état de santé).

> ⚠️ Je ne suis pas juriste. Pour une application de santé, faire valider l'ensemble (HDS, AIPD, consentement art. 9, registre des traitements) par un DPO / avocat spécialisé avant lancement.

---

## Références

- Certification HDS — https://esante.gouv.fr/produits-services/hds
- Scaleway sécurité & certifications — https://www.scaleway.com/en/security-and-resilience/
- Scaleway Managed PostgreSQL — https://www.scaleway.com/en/managed-postgresql-mysql/
