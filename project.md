# AmbuBook — Plateforme de Réservation de Transports Sanitaires

## Vision

AmbuBook est une plateforme de prise de rendez-vous en ligne pour services ambulanciers. Elle permet aux patients de demander un transport médical (ambulance ou VSL) et aux ambulanciers de gérer les demandes via un dashboard.

---

## Fonctionnalités Implémentées

### Côté Patient (Public)
- **Recherche d'ambulanciers** par nom ou localisation géographique
- **Géolocalisation** avec calcul de distance (API adresse.data.gouv.fr + Haversine)
- **Inscription/Connexion** avec gestion de session
- **Réservation de transport** via modal multi-étapes :
  1. Informations patient (nom, téléphone, email)
  2. Type de transport (Ambulance/VSL, aller simple/retour, mobilité)
  3. Adresses (départ/arrivée avec autocomplétion)
  4. Planification (dates et heures)
- **Suivi de demande** via tracking ID unique

### Côté Ambulancier (Auth)
- Dashboard de gestion des demandes (en cours)
- Système d'invitation par code pour onboarding

### Administration
- Gestion des utilisateurs et entreprises
- Gestion des codes d'invitation

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router, full-stack) |
| Langage | TypeScript 5 (strict mode) |
| Base de données | PostgreSQL 16 |
| ORM | Prisma 7 |
| Authentification | Better Auth 1.4 |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| Emails | Resend |
| Icônes | Lucide React |

---

## Architecture

```
ambubook/
├── app/                    # Next.js App Router
│   ├── api/                # Routes API REST
│   │   ├── auth/           # Better Auth endpoints
│   │   ├── search/         # Recherche ambulanciers
│   │   ├── transport-requests/  # Gestion demandes
│   │   ├── customer-signup/     # Inscription patients
│   │   └── address/autocomplete/
│   ├── (customer)/         # Pages publiques (signup, login)
│   ├── dashboard/          # Espace client connecté
│   ├── recherche/          # Page de recherche
│   └── admin/              # Administration
│
├── components/
│   ├── ui/                 # Composants réutilisables (Button, Input, Modal...)
│   ├── landing/            # Page d'accueil (Header, Hero, Footer...)
│   └── booking/            # Flux de réservation (BookingModal, steps/)
│
├── lib/                    # Utilitaires
│   ├── auth.ts             # Config Better Auth
│   ├── prisma.ts           # Instance Prisma
│   ├── geo.ts              # Géolocalisation
│   └── validations/        # Schémas Zod
│
├── prisma/
│   └── schema.prisma       # Modèles de données
│
└── tasks/                  # Documentation de travail
```

---

## Modèles de Données

### Principaux
- **User** : utilisateurs (ADMIN, AMBULANCIER, CUSTOMER)
- **Company** : entreprises ambulancières (nom, adresse, coords GPS)
- **TransportRequest** : demandes de transport avec statut et tracking
- **UserAddress** : adresses enregistrées des patients
- **Invitation** : codes d'invitation pour onboarding ambulanciers

### Statuts de Demande
`PENDING` → `ACCEPTED` | `REFUSED` | `COUNTER_PROPOSAL` → `COMPLETED` | `CANCELLED`

### Types de Transport
- **AMBULANCE** / **VSL**
- **ONE_WAY** / **ROUND_TRIP**
- Mobilité : **WALKING** / **WHEELCHAIR** / **STRETCHER**

---

## Variables d'Environnement

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Commandes

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npx prisma studio    # Navigateur BDD
npx prisma migrate dev  # Migrations
```

---

## Roadmap

### Fait
- [x] Setup BDD + Auth
- [x] Recherche ambulanciers (texte + géo)
- [x] Inscription/connexion patients
- [x] Modal de réservation (4 étapes)
- [x] Persistance des demandes

### À faire
- [ ] Dashboard ambulancier complet
- [ ] Notifications SMS/Email
- [ ] Contre-propositions de créneau
- [ ] Page de suivi patient
- [ ] Admin dashboard
