# AmbuBook — Plateforme de Réservation de Transports Sanitaires

## Vision

AmbuBook est une plateforme de prise de rendez-vous en ligne pour services ambulanciers. Elle permet aux patients de demander un transport médical (ambulance ou VSL) et aux ambulanciers de gérer les demandes via un dashboard.

---

## Fonctionnalités Implémentées

### Côté Patient (Public)
- **Recherche d'ambulanciers** par nom, ville ou région
  - Recherche textuelle par nom d'entreprise
  - Recherche géographique avec rayon de couverture dynamique par entreprise
  - Recherche par région (Normandie, Bretagne, etc.) via code postal
  - Recherche par ville (match partiel)
- **Géolocalisation** avec calcul de distance (API adresse.data.gouv.fr + Haversine)
- **Inscription/Connexion** avec gestion de session
- **Réservation de transport** via modal multi-étapes :
  1. Informations patient (nom, téléphone, email)
  2. Type de transport (Ambulance/VSL, aller simple/retour, mobilité)
  3. Adresses (départ/arrivée avec autocomplétion)
  4. Planification (dates et heures)
- **Espace "Mes Transports"** (/mes-transports) :
  - Liste des demandes avec filtres par statut
  - Détail complet de chaque transport
  - Réponse aux contre-propositions (accepter/proposer autre date/annuler)
  - Upload de pièces jointes (carte vitale, mutuelle, ordonnance...)
  - Historique des modifications
- **Page entreprise publique** (/[slug]) avec :
  - Informations complètes (adresse, téléphone, services)
  - Horaires d'ouverture
  - Galerie photos
  - Modal de réservation intégré

### SEO
- **Landing page optimisée** avec schemas JSON-LD (Organization, WebSite, Service, BreadcrumbList)
- **Pages entreprises** avec metadata dynamique et schema LocalBusiness
- **Page recherche** avec metadata et JSON-LD SearchAction
- **Sitemap XML dynamique** (pages statiques + entreprises)
- **Plan du site HTML** pour les utilisateurs
- **FAQ avec schema FAQPage** pour rich snippets
- **Maillage interne** par villes et régions
- **URLs françaises** (/connexion, /inscription, /dashboard/connexion, /dashboard/inscription)

### UX/UI
- **Header flottant** style Apple (backdrop-blur, rounded, shadow)
- **Menu adaptatif** selon le rôle utilisateur (CUSTOMER vs AMBULANCIER)
- **Avatar utilisateur** avec initiales dans le header
- **Responsive mobile** : icône loupe dans header et SearchBar
- **CompanyCard optimisée** pour mobile (truncate, boutons adaptés)
- **Système de Toasts** :
  - 4 variantes (success, error, warning, info)
  - Animations slide-in/slide-out
  - Auto-dismiss configurable (5s par défaut)
  - Intégré dans tout le projet (réservations, uploads, actions...)

### Côté Ambulancier (Auth)
- **Dashboard de gestion** des demandes de transport
- **Page Mon Entreprise** avec :
  - Gestion du logo et image de couverture (upload S3)
  - Description et services proposés
  - Horaires d'ouverture (7 jours)
  - Galerie photos (upload multiple)
  - Rayon de couverture personnalisable
  - N° agrément ARS
- Système d'invitation par code pour onboarding
- Restriction des modifications au propriétaire (OWNER)

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
│   │   ├── search/         # Recherche ambulanciers (geo, region, city, text)
│   │   ├── customer/transports/ # API transports clients (liste, détail, réponses, PJ)
│   │   ├── ambulancier/demandes/ # API demandes ambulanciers
│   │   ├── companies/me/   # API Mon Entreprise (GET, PATCH, photos, hours)
│   │   ├── customer-signup/     # Inscription patients
│   │   └── address/autocomplete/
│   ├── [slug]/             # Page publique entreprise (SEO)
│   ├── (customer)/         # Pages publiques patients
│   │   ├── connexion/      # Connexion patient
│   │   └── inscription/    # Inscription patient
│   ├── dashboard/          # Espace ambulancier
│   │   ├── (auth)/         # Auth ambulancier (connexion, inscription)
│   │   └── mon-entreprise/ # Gestion entreprise (OWNER only)
│   ├── recherche/          # Page de recherche
│   ├── plan-du-site/       # Sitemap HTML
│   ├── sitemap.ts          # Sitemap XML dynamique
│   ├── robots.ts           # Robots.txt
│   └── admin/              # Administration
│
├── components/
│   ├── ui/                 # Composants réutilisables (Button, Input, Modal, Toast...)
│   ├── landing/            # Page d'accueil (Header, Hero, Footer, FAQ, Cities...)
│   ├── booking/            # Flux de réservation (BookingModal, steps/)
│   ├── demandes/           # Composants partagés (RequestHistory, RequestAttachments)
│   └── ambulancier/        # Composants dashboard
│       └── mon-entreprise/ # Cards de gestion entreprise
│
├── lib/                    # Utilitaires
│   ├── auth.ts             # Config Better Auth
│   ├── prisma.ts           # Instance Prisma
│   ├── s3.ts               # Upload S3 (Scaleway)
│   ├── geo.ts              # Géolocalisation + Haversine
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
- **Company** : entreprises ambulancières
  - Infos de base : nom, SIRET, adresse, coords GPS, téléphone, email
  - Enrichissement : description, logoUrl, coverImageUrl, licenseNumber (ARS)
  - Services : hasAmbulance, hasVSL, acceptsOnlineBooking
  - Paramètres : foundedYear, fleetSize, coverageRadius
- **CompanyPhoto** : galerie photos (fileKey S3, url, caption, order)
- **CompanyHours** : horaires d'ouverture (dayOfWeek 0-6, openTime, closeTime, isClosed)
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
- [x] Recherche ambulanciers (texte + géo + région + ville)
- [x] Rayon de couverture dynamique par entreprise
- [x] Inscription/connexion patients
- [x] Modal de réservation (4 étapes)
- [x] Persistance des demandes
- [x] Page Mon Entreprise (logo, cover, description, services, horaires, galerie)
- [x] Upload S3 (Scaleway) pour images
- [x] Page publique entreprise /[slug] avec SEO
- [x] Landing page SEO XXL (schemas JSON-LD, FAQ, maillage villes/régions)
- [x] Sitemap XML dynamique + plan du site HTML
- [x] Header flottant Apple-like avec menu adapté selon rôle
- [x] URLs françaises (/connexion, /inscription)
- [x] Responsive mobile (icône loupe, CompanyCard optimisée)
- [x] Système de Toasts (success, error, warning, info) avec animations
- [x] Page "Mes Transports" pour clients (/mes-transports)
- [x] Contre-propositions de créneau (côté client + ambulancier)
- [x] PJ sur les demandes (upload/download côté client et ambulancier)
- [x] Historique des modifications sur les demandes

### À faire
- [ ] Dashboard ambulancier complet
- [ ] Notifications SMS/Email
- [ ] Admin dashboard
