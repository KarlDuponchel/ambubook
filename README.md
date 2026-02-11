# AmbuBook

Plateforme de prise de rendez-vous pour services ambulanciers. Permet aux patients de demander un transport sanitaire en ligne, et aux ambulanciers de gérer leurs demandes via un dashboard.

## Stack technique

- **Frontend/Backend** : Next.js 16 (App Router)
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma
- **Authentification** : Better Auth
- **Styling** : Tailwind CSS

## Installation

### Prérequis

- Node.js 18+
- Docker (pour PostgreSQL)

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd ambubook
npm install
```

### 2. Configuration de l'environnement

Copier le fichier d'exemple et le personnaliser :

```bash
cp .env.example .env
```

Variables importantes :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `BETTER_AUTH_SECRET` : Clé secrète pour les tokens (générer avec `openssl rand -base64 32`)

### 3. Lancer PostgreSQL

```bash
docker compose up -d
```

Cela démarre PostgreSQL sur le port **5433** (pour éviter les conflits).

### 4. Appliquer les migrations

```bash
npx prisma migrate dev
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
ambubook/
├── app/                    # Next.js App Router
│   ├── api/auth/           # Routes API Better Auth
│   ├── globals.css         # Styles globaux
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Page d'accueil
├── lib/                    # Utilitaires et configurations
│   ├── auth.ts             # Configuration Better Auth (serveur)
│   ├── auth-client.ts      # Client Better Auth (frontend)
│   └── prisma.ts           # Instance Prisma singleton
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   └── migrations/         # Migrations SQL
├── tasks/                  # Documentation de développement
│   ├── sprint.md           # Planning des sprints
│   └── lessons.md          # Erreurs et solutions
└── docker-compose.yml      # PostgreSQL local
```

## Base de données

### Modèles principaux

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (ambulanciers, admins) |
| `companies` | Sociétés d'ambulance |
| `transport_requests` | Demandes de transport des patients |
| `sessions` | Sessions de connexion |
| `accounts` | Comptes liés (auth) |
| `verifications` | Tokens de vérification |

### Commandes Prisma utiles

```bash
# Voir la BDD dans le navigateur
npx prisma studio

# Générer le client après modification du schéma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name nom_migration

# Réinitialiser la BDD (attention: perte de données)
npx prisma migrate reset
```

## Authentification

L'authentification utilise Better Auth avec email/password.

### Endpoints API

- `POST /api/auth/sign-up` : Inscription
- `POST /api/auth/sign-in/email` : Connexion
- `POST /api/auth/sign-out` : Déconnexion
- `GET /api/auth/session` : Session courante

### Utilisation côté client

```tsx
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";

// Dans un composant React
const { data: session } = useSession();

// Connexion
await signIn.email({ email: "...", password: "..." });

// Inscription
await signUp.email({ email: "...", password: "...", name: "..." });

// Déconnexion
await signOut();
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run lint` | Vérification ESLint |

## Roadmap

Voir [tasks/sprint.md](./tasks/sprint.md) pour le planning détaillé.

### MVP (6 semaines)
- [x] Setup BDD + Auth
- [ ] Formulaire patient
- [ ] Dashboard ambulancier
- [ ] Notifications SMS/Email

### Post-MVP
- [ ] Marketplace multi-ambulanciers
- [ ] Géolocalisation et carte
- [ ] Paiement en ligne
