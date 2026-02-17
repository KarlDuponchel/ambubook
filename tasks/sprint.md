# Sprint Planning - AmbuBook

## Session Actuelle - Toasts & Page Mes Transports (17/02/2026)

### Système de Toasts ✅
- [x] Composant `Toast.tsx` avec 4 variantes (success, error, warning, info)
- [x] `ToastProvider` intégré dans `app/layout.tsx`
- [x] Hook `useToast()` pour déclencher les notifications
- [x] Animations CSS (slide-in à l'entrée, slide-out à la sortie)
- [x] Auto-dismiss configurable (5s par défaut)
- [x] Remplacement des `console.error` et `alert()` par des toasts dans tout le projet

### Page /mes-transports (Espace Client) ✅
- [x] API `GET/POST /api/customer/transports` - Liste et création
- [x] API `GET/PATCH /api/customer/transports/[trackingId]` - Détail et réponses
- [x] API attachments pour clients (upload/download/delete)
- [x] Page liste avec filtres par statut (boutons flex cliquables)
- [x] Page détail avec historique, pièces jointes, infos entreprise
- [x] Système de réponse aux contre-propositions (accepter/proposer/annuler)
- [x] Composants `RequestHistory` et `RequestAttachments` adaptés pour clients

### Corrections
- [x] Fix boucle infinie sur `/dashboard/demandes` (useCallback + dépendances)
- [x] Rationalisation des routes API (`/api/customer/transports` unifié)

### Fichiers créés/modifiés
- `components/ui/Toast.tsx` - Nouveau composant
- `app/api/customer/transports/route.ts` - GET + POST
- `app/api/customer/transports/[trackingId]/route.ts` - GET + PATCH
- `app/api/customer/transports/[trackingId]/attachments/route.ts`
- `app/mes-transports/page.tsx` - Liste transports client
- `app/mes-transports/[trackingId]/page.tsx` - Détail transport
- `app/mes-transports/layout.tsx` - Metadata noindex
- Intégration toasts dans 10+ fichiers existants

---

## Session Précédente - Modal de Réservation (14/02/2026)

### Modal de Prise de Rendez-vous - ✅ Implémenté
- [x] Composants UI : `Select`, `Checkbox`, `Textarea`
- [x] Modal multi-étapes (`BookingModal`) avec progression visuelle
- [x] Étape 1 : Infos patient (prénom, nom, tél, email, n° sécu)
- [x] Étape 2 : Type transport (VSL/Ambulance, aller/retour, mobilité, accompagnant)
- [x] Étape 3 : Adresses (avec autocomplétion via api-adresse.data.gouv.fr)
- [x] Étape 4 : Planning + récapitulatif complet
- [x] API `POST /api/transport-requests` avec validation Zod
- [x] API `GET /api/address/autocomplete` pour autocomplétion adresses
- [x] Bouton "Réserver" dans l'autocomplete du Hero
- [x] Bouton "Réserver" sur chaque résultat de recherche (`/recherche`)
- [x] Affichage trackingId après soumission réussie

### Fichiers créés
- `components/ui/Select.tsx`, `Checkbox.tsx`, `Textarea.tsx`
- `components/booking/*` (BookingModal, BookingProgress, types, steps/)
- `lib/validations/transport-request.ts`
- `app/api/transport-requests/route.ts`
- `app/api/address/autocomplete/route.ts`
- `app/recherche/CompanyCard.tsx`

---

## À faire - Suite immédiate

### Tests & Vérification
- [ ] Test manuel du flux complet de réservation
- [ ] Vérifier la création en BDD (TransportRequest avec status PENDING)
- [ ] Tester l'autocomplétion d'adresse
- [ ] Corriger l'erreur build sur `/login` (useSearchParams sans Suspense)

### Améliorations potentielles
- [ ] Pré-remplissage si utilisateur connecté (Customer)
- [ ] Adresses favorites (localStorage v1)
- [ ] Notifications email à la company lors d'une nouvelle demande
- [ ] Image à prévoir pour la company, à rajouter dans les lignes d'autocomplete/recherche
- [ ] Si le client vient d'un lien direct, ouvrir le modal avec l'entreprise du code lié
- [ ] Tables adresses pour les clients plutot que localstorage

---

## Session Précédente - Inscription & Gestion Comptes

### Inscription & Gestion des Comptes
- [x] Page d'inscription (`/signup`)
- [x] Création User + Company simultanée
- [x] Génération automatique de slug pour les companies
- [x] Compte désactivé par défaut (validation admin requise)
- [x] Emails de notification (Resend) : admin + utilisateur
- [x] Email d'activation quand compte validé

### Système d'Invitation
- [x] Modèle `Invitation` (code 6 caractères, expiration 7 jours)
- [x] API création/validation/suppression d'invitations
- [x] Page `/dashboard/invite` pour générer des codes
- [x] Formulaire inscription avec 2 modes : "Rejoindre" ou "Créer"
- [x] Validation temps réel du code d'invitation
- [x] Compte actif immédiatement si invitation valide

### Dashboard Admin
- [x] Layout admin avec sidebar (`/admin`)
- [x] Page gestion utilisateurs en grille (`/admin/users`)
- [x] Recherche par nom, email, société
- [x] Activation/désactivation en 1 clic
- [x] Modal modification utilisateur (nom, email, téléphone, société, rôle)
- [x] Suppression utilisateur avec confirmation

### Sécurité
- [x] Protection routes `/admin/*` et `/dashboard/*` via `proxy.ts`
- [x] Redirection login selon rôle (admin → /admin, ambulancier → /dashboard)
- [x] Helper `requireAuth()` et `requireAdmin()` pour les APIs
- [x] Vérification authentification sur toutes les routes API sensibles
- [x] Vérification appartenance company pour suppression invitation

---

## Prochaine Session - À Faire

### Rôle Gérant de Company
- [ ] Ajouter champ `isOwner` (Boolean) sur User
- [ ] Le premier utilisateur d'une company est automatiquement gérant
- [ ] Seul le gérant peut créer des invitations
- [ ] Seul un admin peut modifier le statut gérant d'un utilisateur
- [ ] Afficher badge "Gérant" dans le dashboard admin
- [ ] Empêcher suppression du gérant (doit transférer d'abord)

### Améliorations Dashboard Admin
- [ ] Page gestion des sociétés (`/admin/companies`)
- [ ] Voir les utilisateurs d'une company
- [ ] Statistiques (nombre users, invitations actives)

---

## Sprint 1 : Setup & Fondations

### 1.1 Infrastructure Base de Données
- [x] Installation Prisma ORM
- [x] Configuration PostgreSQL
- [x] Création du schéma de données
- [x] Migration initiale

### 1.2 Authentification
- [x] Installation Better Auth
- [x] Configuration auth (email/password)
- [x] Page login ambulancier
- [x] Protection des routes (proxy.ts)

### 1.3 Modèle de Données
- [x] Table User (ambulanciers + admins)
- [x] Table Company (sociétés d'ambulance)
- [x] Table TransportRequest (demandes de transport avec infos patient)
- [x] Tables auth (Session, Account, Verification)
- [x] Table Invitation (codes d'invitation)

---

## Sprint 2 : Formulaire Patient & Dashboard (Semaines 3-4)

### 2.1 Formulaire Patient (Public)
- [ ] Page dynamique `/[companySlug]`
- [ ] Formulaire de demande de transport
- [ ] Validation des données
- [ ] Confirmation post-soumission
- [ ] Page de suivi `/suivi/[trackingId]`

### 2.2 Dashboard Ambulancier
- [ ] Liste des demandes avec filtres
- [ ] Badge "Nouvelles demandes"
- [ ] Détail d'une demande
- [ ] Actions : Accepter / Refuser / Proposer créneau

### 2.3 Lien direct
- [ ] Si le client vient d'un lien direct, page formulaire + entreprise pré rempli

---

## Sprint 3 : Notifications & Production (Semaines 5-6)

### 3.1 Notifications
- [x] Configuration Resend (email)
- [ ] Configuration Twilio (SMS)
- [ ] Templates de notification
- [ ] Envoi automatique selon statut

### 3.2 Finalisation
- [ ] Tests end-to-end
- [ ] Optimisations performance
- [ ] Déploiement Vercel
- [ ] Documentation utilisateur

---

## Backlog (Post-MVP)
- [ ] Marketplace multi-ambulanciers
- [ ] Carte avec géolocalisation
- [ ] Estimation temps de trajet
- [ ] Paiement en ligne
- [ ] Intégration CPAM
- [ ] Application mobile native