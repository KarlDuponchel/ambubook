# TODO - AmbuBook

> **~150 tâches restantes** (après dédoublonnage)

---

## 🚀 Audit mise en production (2026-07-19)

> Verdict : **pas prêt en l'état**. Base technique solide (auth/authz, headers, export RGPD), mais bloquants sécurité + conformité données de santé.
> Ordre d'attaque conseillé : 1) quick wins sécurité → 2) chiffrement/logs santé → 3) RGPD formulaires/rétention → 4) migration HDS (long, à lancer en parallèle).
> ⚠️ Rappel : une réservation de transport sanitaire = **donnée de santé (art. 9 RGPD)**, même sans n° de Sécu. Faire valider par un DPO/avocat.

### 🔴 Bloquants sécurité (quick wins — à faire en premier)
- [x] **Crons fail-open** : `CRON_SECRET` rendu obligatoire (fail-closed) en production dans `app/api/cron/cleanup-logs/route.ts` et `app/api/cron/cleanup-notifications/route.ts` (aligné sur `app/api/cron/reminders/route.ts`)
- [x] **XSS stocké** : contenu email assaini via `isomorphic-dompurify` (`DOMPurify.sanitize`) dans `components/admin/notifications/NotificationDetailsModal.tsx:210`
- [x] **Email non vérifié** : `requireEmailVerification: true` + bloc `emailVerification` (envoi auto à l'inscription, `autoSignInAfterVerification`) dans `lib/auth.ts`
- [x] **Invitations** : création réservée au gérant (`company.ownerId === user.id`, sinon 403) dans `app/api/invitations/route.ts`
- [x] **Validation Zod manquante** : schémas ajoutés sur les 10 routes mutantes (`user/me`, `ambulancier/me`, `user/addresses`, `ambulancier/demandes/[id]` + `/history`, `customer/transports/[trackingId]`, `admin/transports/[id]`, `admin/feedback/[id]`, `admin/logs/errors`, `public/transport/[trackingId]`) — 400 + `error.flatten()` avant mutation
- [x] **`/api/distance`** : rate-limit (100/min par IP) + validation Zod du body (`app/api/distance/route.ts`)
- [ ] **Env prod** : provisionner `BETTER_AUTH_URL` (sinon fallback `localhost:3000`, `lib/auth.ts:10`) et `CRON_SECRET` — _config de déploiement, à faire sur Scaleway (voir `deployment.md`)_
- [x] **Bootstrap admin prod** : `scripts/create-admin.ts` créé (idempotent, mot de passe via env `ADMIN_PASSWORD` ou généré/affiché une fois, refus des mots de passe faibles, `emailVerified: true`, aucune donnée de démo) + script npm `create-admin` + `.env.example`
- [x] Valider `n° sécu` au format NIR (regex 15 caractères, 2A/2B, tolérante espaces/points) dans `lib/validations/transport-request.ts`
- [x] Durcir la CSP : `'unsafe-eval'` retiré de `script-src` (`next.config.ts`). _`'unsafe-inline'` conservé (nonces = chantier à risque, reporté)_
- [ ] Convergence : utiliser partout le helper `lib/auth-guard.ts` (`requireAuth`/`requireRole`) au lieu du pattern `getSession`+`findUnique` dupliqué — _amélioration, non bloquant_
- [x] **`next build` débloqué (ESLint)** : 22 erreurs préexistantes corrigées → 11 entités JSX échappées, Axeptio `useState`→`useRef` (vraie correction), 6 `eslint-disable-next-line` justifiés (patterns idiomatiques sûrs : `set-state-in-effect` ×3, `static-components` ×3), artefact `prisma/geocode-companies.js` ignoré. Lint = 0 erreur, tsc = 0 erreur. _(Restent 31 warnings non bloquants.)_
- [x] **Message inscription** ajusté pour la vérif email (pages connexion customer + dashboard) + message dédié si connexion refusée pour email non confirmé (403)

### 🟠 Protection des données de santé
- [x] **Chiffrement au repos** : n° de Sécu chiffré applicativement (AES-256-GCM, `lib/crypto.ts`) — chiffré à l'écriture (routes de création) + déchiffré à la lecture via extension Prisma (`lib/prisma.ts`). `reason`/`notes` reposent sur le chiffrement disque Scaleway (décision). ⚠️ Requiert `ENCRYPTION_KEY` en env (`openssl rand -base64 32`, à provisionner + **ne jamais changer** une fois des données chiffrées).
- [x] **Fuite de log** : téléphone patient masqué dans les logs SMS (`lib/sms.ts`)
- [x] **Route publique `public/transport/[trackingId]`** : renforcée avec 2e identifiant (nom du patient via `?nom=`) sur GET + PATCH, + rate-limit sur GET (15/h). Page `/suivi/[trackingId]` : formulaire de saisie du nom avant affichage.
- [x] **Documents non exposés en suivi public** : `attachments` retirés de la réponse de la route publique (accessibles uniquement via l'espace connecté `/mes-transports`, scoping `userId`). Encart sur `/suivi` incitant à créer un compte pour centraliser données + documents.
- [x] Validation upload par **signature/magic bytes** (`lib/file-signature.ts`) sur les 3 routes d'upload (photos, attachments customer + ambulancier)
- [x] _Bonus_ : réconciliation validation NIR client/serveur (accepte 13 **ou** 15 chiffres, `lib/validations/transport-request.ts`)

### 🟠 RGPD / conformité légale
- [x] **Mentions RGPD dans les formulaires** : mention + liens CGU/politique de confidentialité ajoutés sur inscription client (`app/(customer)/inscription`) et pro (`app/dashboard/(auth)/inscription`)
- [x] **Consentement explicite art. 9** : case à cocher bloquante (données de santé) dans le tunnel de réservation (`ScheduleStep` + validation `BookingModal` étape 4) — masquée côté ambulancier via `showConsent={false}`. _Suivi possible : stocker une preuve de consentement en base (nécessite migration)._
- [x] **Suppression de compte self-service** : handler `DELETE` `app/api/user/me/route.ts` (réservé CUSTOMER) réutilisant `anonymizeUser` + bouton avec confirmation dans `app/mon-compte/parametres`
- [x] **Rétention appliquée** : cron `app/api/cron/retention/route.ts` (anonymise comptes clients inactifs > 3 ans, purge transports > 5 ans + fichiers S3). À planifier côté Dokploy/Scaleway (`0 5 * * 0`)
- [x] Divergence durée logs corrigée dans la politique (audit/erreurs 90j–6 mois, notifications 30/90j)
- [x] **Footer légal** : composant `components/common/LegalLinks.tsx` ajouté aux shells dashboard + admin (le tunnel a déjà le lien via le consentement)
- [x] Politique cookies alignée (aucun outil analytics déployé aujourd'hui)
- [x] `clientId` Axeptio via `NEXT_PUBLIC_AXEPTIO_CLIENT_ID` (repli sur l'ancienne valeur)
- [ ] **AIPD/DPIA** (art. 35) à rédiger pour le traitement de données de santé — _document, pas du code_
- [ ] **Registre des traitements** (art. 30) — _document, pas du code_

### 🔵 Hébergement HDS (long — lancer en parallèle)
- [ ] **Migrer vers un hébergeur certifié HDS** (Hostinger/Chypre actuel = NON conforme) : OVHcloud HDS, Scaleway, Outscale…
- [ ] Vérifier hébergement physique exclusivement UE/EEE (décret 24 mars 2026)
- [ ] Mettre à jour les mentions légales avec le nouvel hébergeur HDS

---

## Tests & Vérification

- [ ] Tests manuels du flux complet (booking, transports, notifications)
- [ ] Tests manuels email (création transport, acceptation, refus, etc.)
- [ ] Tests manuels SMS
- [ ] Tests de pénétration (pentest) - optionnel
- [ ] Test Mobile-Friendly de Google

---

## Admin

### Dashboard principal
- [x] `app/admin/page.tsx` - Vue d'ensemble avec KPIs, graphiques, alertes
- [x] Dashboard stats transports (volume, taux acceptation/refus, top entreprises)
- [x] Graphique évolution 7/30 jours
- [x] `GET /api/admin/dashboard/stats` - API statistiques globales

### Utilisateurs
- [ ] `app/admin/utilisateurs/[id]/page.tsx` - Page détail dédiée
- [ ] `GET /api/admin/users/[id]` - Détail complet
- [ ] `POST /api/admin/users/[id]/reset-password` - Envoyer lien reset
- [ ] Notification automatique à la validation ambulancier

### Entreprises
- [x] `app/admin/entreprises/[id]/page.tsx` - Page détail avec employés, stats, galerie

### Transports
- [x] `GET /api/admin/transports/stats` - Statistiques globales

### Notifications
- [x] Page admin pour voir les notifications envoyées (déjà fait via logs)
- [x] `POST /api/admin/notifications/[id]/retry` - Renvoyer (optionnel)
- [ ] `GET /api/admin/notifications/export` - Export CSV (optionnel)

### Configuration
- [x] `app/admin/configuration/page.tsx` - Paramètres généraux, maintenance mode
- [x] `GET/PATCH /api/admin/config` - API configuration admin
- [x] `GET /api/config` - API configuration publique
- [x] `lib/site-config.ts` - Helper serveur pour récupérer la config
- [x] Model `SiteConfig` en base de données
- [ ] Édition des templates email/SMS (optionnel, avancé)
- [x] Feature flags (inscriptions, réservations, SMS, emails)

### Améliorations générales
- [ ] Breadcrumbs pour navigation
- [ ] Filtres persistés dans URL
- [ ] Export CSV sur les listes principales
- [ ] Actions confirmées (suppression, etc.)
- [ ] Logs des actions admin (audit trail)

---

## Notifications

### Templates
- [ ] Créer templates React Email pour un meilleur design
- [ ] Ajouter logo AmbuBook dans les emails
- [ ] Documentation des templates

### Fonctionnalités
- [ ] `app/notifications/page.tsx` - Page centre de notifications (optionnel)
- [ ] `app/api/notifications/stream/route.ts` - Endpoint SSE (temps réel)
- [ ] Hook `useNotificationStream()` avec EventSource
- [ ] Intégrer Pusher, Ably ou Socket.io (si besoin temps réel strict)

### Maintenance
- [ ] `app/api/cron/cleanup-notifications/route.ts` - Purge auto 30/90 jours
- [ ] Retry notifications FAILED (optionnel)

---

## Sécurité

### Authentification
- [ ] Configurer les cookies sécurisés (HttpOnly, Secure, SameSite)
- [ ] Forcer HTTPS en production
- [ ] Détection de connexions suspectes (nouvel appareil, nouvelle IP)
- [ ] Logs des connexions (IP, user-agent, timestamp)
- [ ] Politique de mot de passe (min 8 chars, complexité)
- [ ] Vérification contre liste de mots de passe compromis (haveibeenpwned API)
- [ ] Option 2FA pour les admins (TOTP)
- [ ] Vérifier la configuration des sessions (durée, refresh)
- [ ] Vérifier le hashage des mots de passe (bcrypt/argon2)

### Autorisation
- [x] **Cloisonner front office / dashboard ambulancier par rôle** (Option 1, fait 2026-07-19) :
  - `components/landing/Header.tsx` : « connecté » reconnu uniquement si `role === "CUSTOMER"` (`isCustomer`/`isPro`). Un ambulancier/admin connecté = état visiteur (pas de menu compte patient) + bouton « Mon dashboard » → `/dashboard`.
  - `proxy.ts` : `/mon-compte/:path*` et `/mes-transports/:path*` protégés (non connecté → `/connexion?redirect=` ; rôle ≠ CUSTOMER → `/dashboard`) + ajoutés au `matcher`.
  - `app/api/customer/transports` POST : **création interdite aux comptes pro** (session avec `role !== CUSTOMER` → 403). Seuls les clients CUSTOMER et les visiteurs non connectés peuvent réserver ; les ambulanciers passent par leur dashboard.
  - _Note UI (optionnel plus tard)_ : le bouton « Réserver » reste visible pour un pro sur une fiche entreprise publique ; l'API renvoie 403 avec message clair. Masquage UI possible ultérieurement.
- [ ] Vérifier que toutes les routes protégées vérifient la session
- [ ] Vérifier les contrôles de rôle (ADMIN, AMBULANCIER, CUSTOMER)
- [ ] Vérifier l'ownership (un user ne peut modifier que ses propres données)
- [ ] Middleware centralisé pour vérification auth + rôle
- [ ] Documenter les permissions par route
- [ ] Protection CSRF sur les mutations
- [ ] Logs des accès refusés (403)
- [ ] Un ambulancier ne voit que les demandes de son entreprise
- [ ] Un client ne voit que ses propres transports

### Protection des données
- [ ] Chiffrement des données sensibles en base (N° sécu, etc.) - optionnel
- [ ] Masquage des données sensibles dans les logs
- [ ] Ne jamais exposer les IDs internes dans les URLs publiques
- [ ] Sanitizer les inputs HTML (éviter XSS)
- [ ] Échapper les données dans les emails/SMS
- [ ] Validation Zod sur toutes les entrées API

### Upload de fichiers
- [ ] Validation des types MIME (images, PDF uniquement)
- [ ] Limite de taille (ex: 10MB max)
- [ ] Compression image avant upload
- [ ] Scan antivirus (optionnel, via ClamAV ou service cloud)
- [ ] Stockage sur S3 avec URLs signées (expiration)

### Headers de sécurité
- [ ] Content-Security-Policy (CSP)
- [ ] X-Frame-Options (DENY)
- [ ] X-Content-Type-Options (nosniff)
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] Configurer dans `next.config.js` ou middleware

### Protection attaques
- [ ] Configurer rate limiting sur l'API (Vercel Edge, Upstash)
- [ ] Rate limiting sur : création compte, envoi notifs, upload, feedback
- [ ] Cloudflare ou équivalent en frontal
- [ ] Challenge sur les requêtes suspectes

### Monitoring
- [ ] Intégration Sentry pour les erreurs
- [ ] Alerte sur connexions multiples échouées
- [ ] Alerte sur activité admin inhabituelle
- [ ] Table `AuditLog` pour tracer les actions sensibles
- [ ] Logger les événements de sécurité

### Maintenance
- [ ] Audit des dépendances (npm audit, Snyk)
- [ ] Variables d'environnement sécurisées
- [ ] Backup base de données automatisé
- [ ] Plan de réponse aux incidents
- [ ] Revue de code sécurité

---

## RGPD & Conformité

### Consentement
- [ ] Banner cookies avec choix (nécessaires, analytics, marketing)
- [ ] Stockage du consentement
- [ ] Respect du choix (pas de tracking sans consentement)

### Droits utilisateurs
- [ ] Page "Mes données" pour les utilisateurs
- [ ] Export des données personnelles (JSON/PDF)
- [ ] Suppression du compte (avec confirmation)
- [ ] Anonymisation plutôt que suppression pour l'historique

### Documentation légale
- [ ] Politique de confidentialité complète
- [ ] Mentions légales
- [ ] CGU / CGV
- [ ] Registre des traitements (interne)
- [ ] Footer avec liens (mentions légales, désinscription)

### Rétention des données
- [ ] Définir durées de conservation (comptes 3 ans, transports 5 ans, logs 1 an)
- [ ] Cron de purge automatique

---

## SEO

### Technique
- [ ] Audit Lighthouse (viser score > 90)
- [ ] Optimisation images (WebP, lazy loading, srcset)
- [ ] Minification CSS/JS
- [ ] Preload fonts critiques
- [ ] Réduire le JavaScript non essentiel
- [ ] Vérifier le rendu mobile sur toutes les pages
- [ ] Optimiser les interactions tactiles
- [ ] Sitemap à jour et soumis
- [ ] Robots.txt correct
- [ ] HTTPS partout
- [ ] Temps de chargement < 3s

### Contenu - Optimisation
- [ ] Audit du contenu (densité mots-clés, H1/H2)
- [ ] Optimiser le Hero (texte accrocheur avec mots-clés)
- [ ] Ajouter plus de contenu textuel
- [ ] Section témoignages/avis (preuve sociale)
- [ ] Toutes les pages ont un title unique (< 60 chars)
- [ ] Toutes les pages ont une meta description (< 160 chars)
- [ ] Toutes les images ont un alt text
- [ ] URLs propres et descriptives
- [ ] Pas de contenu dupliqué

### Contenu - Pages entreprises
- [ ] Title optimisé : "Ambulances [Nom] à [Ville] - Réservation en ligne"
- [ ] Meta description unique et attractive
- [ ] Contenu structuré (H2 pour services, horaires, etc.)
- [ ] Ajouter section FAQ spécifique à l'entreprise
- [ ] Images avec alt text descriptif

### Contenu - Nouvelles pages
- [ ] Créer pages dédiées : `/ambulances-[ville]` (Paris, Lyon, etc.)
- [ ] Créer pages régions : `/ambulances-[region]`
- [ ] `/services/ambulance` - Page dédiée ambulance
- [ ] `/services/vsl` - Page dédiée VSL
- [ ] `/services/transport-medical` - Page générique
- [ ] Contenu détaillé, FAQ, tarifs indicatifs

### Blog (optionnel)
- [ ] Section blog `/blog`
- [ ] Articles informatifs (réservation, ambulance vs VSL, remboursement, etc.)
- [ ] Optimisation SEO de chaque article

### Liens internes
- [ ] Maillage interne cohérent
- [ ] Breadcrumbs sur toutes les pages
- [ ] Liens contextuels dans le contenu
- [ ] Footer avec liens vers pages importantes

### Off-page
- [ ] Créer/revendiquer la fiche Google Business Profile
- [ ] Infos complètes (horaires, contact, description)
- [ ] Photos de qualité + répondre aux avis
- [ ] Annuaires professionnels santé/transport
- [ ] Partenariats avec sites médicaux
- [ ] Articles invités (guest posting)
- [ ] Relations presse locale
- [ ] Présence sur LinkedIn (B2B ambulanciers)
- [ ] Page Facebook (B2C patients)
- [ ] Formulaire d'inscription newsletter

### Monitoring
- [ ] Google Search Console configuré
- [ ] Google Analytics 4 configuré
- [ ] Suivi des positions (SEMrush, Ahrefs, ou gratuit)
- [ ] Rapport mensuel SEO
- [ ] Alertes sur chutes de trafic
- [ ] Vérifier l'indexation dans Google Search Console
- [ ] Corriger les erreurs d'exploration
- [ ] Surveiller les pages exclues

---

## Fonctionnalités futures

### Planning
- [ ] Synchroniser le planning avec calendrier externe (Outlook, Google Calendar)

### Mobile
- [ ] Autoriser la caméra photo si téléphone (pour pièces jointes)

### Feedback avancé
- [ ] Intégrer `html2canvas` pour capture d'écran en un clic
- [ ] Prévisualisation avant envoi
- [ ] Compression image avant upload
- [ ] Permettre d'annoter la capture (cercles, flèches)
