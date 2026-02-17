# Modal de Prise de Rendez-vous Transport Médical

## Phase 1 : Composants UI de base
- [x] Créer `components/ui/Select.tsx`
- [x] Créer `components/ui/Checkbox.tsx`
- [x] Créer `components/ui/Textarea.tsx`
- [x] Mettre à jour `components/ui/index.ts`

## Phase 2 : Structure du modal
- [x] Créer `components/booking/types.ts`
- [x] Créer `components/booking/BookingModal.tsx`
- [x] Créer `components/booking/BookingProgress.tsx`
- [x] Créer `components/booking/index.ts`

## Phase 3 : Étapes du formulaire
- [x] Créer `components/booking/steps/PatientInfoStep.tsx`
- [x] Créer `components/booking/steps/TransportStep.tsx`
- [x] Créer `components/booking/steps/AddressStep.tsx`
- [x] Créer `components/booking/steps/ScheduleStep.tsx`
- [x] Créer `components/booking/steps/index.ts`

## Phase 4 : API
- [x] Créer `lib/validations/transport-request.ts` (schema Zod)
- [x] Créer `app/api/transport-requests/route.ts`
- [x] Créer `app/api/address/autocomplete/route.ts`

## Phase 5 : Intégration
- [x] Modifier `components/ui/Autocomplete.tsx` (bouton Réserver + callback)
- [x] Modifier `components/landing/Hero.tsx` (intégrer BookingModal)
- [x] Créer `app/recherche/CompanyCard.tsx` (client component)
- [x] Modifier `app/recherche/SearchResults.tsx` (utiliser CompanyCard)

## Vérification finale
- [ ] Tests manuels du flux complet

---

## Fichiers créés

**Composants UI:**
- `components/ui/Select.tsx` - Select avec label, error, options
- `components/ui/Checkbox.tsx` - Checkbox stylisée avec label
- `components/ui/Textarea.tsx` - Textarea avec label, error

**Booking:**
- `components/booking/types.ts` - Types et interfaces
- `components/booking/BookingModal.tsx` - Modal principal 4 étapes
- `components/booking/BookingProgress.tsx` - Indicateur de progression
- `components/booking/steps/PatientInfoStep.tsx` - Étape 1
- `components/booking/steps/TransportStep.tsx` - Étape 2
- `components/booking/steps/AddressStep.tsx` - Étape 3 avec autocomplétion
- `components/booking/steps/ScheduleStep.tsx` - Étape 4 avec récapitulatif

**API:**
- `lib/validations/transport-request.ts` - Schema Zod
- `app/api/transport-requests/route.ts` - POST création demande
- `app/api/address/autocomplete/route.ts` - GET autocomplétion adresse

**Recherche:**
- `app/recherche/CompanyCard.tsx` - Carte company avec bouton Réserver

# Enrichissement de la page Mon Entreprise

## Phase 1 : Schema Prisma
- [x] Ajouter les nouveaux champs sur Company
- [x] Créer la table CompanyPhoto
- [x] Créer la table CompanyHours
- [x] Exécuter la migration

## Phase 2 : Types TypeScript
- [x] Ajouter interfaces (CompanyPhoto, CompanyHour, CompanyFull, DAY_LABELS)

## Phase 3 : APIs Backend
- [x] Créer /api/companies/me (GET + PATCH)
- [x] Créer /api/companies/me/photos (POST + DELETE)
- [x] Créer /api/companies/me/hours (PUT)
- [x] Créer /api/companies/me/images (POST pour logo/cover)

## Phase 4 : Mise à jour du Signup
- [x] Ajouter champ companyLicenseNumber dans le formulaire
- [x] Modifier l'API signup pour sauvegarder le licenseNumber

## Phase 5 : Page Mon Entreprise Refaite
- [x] Créer CompanyHeader.tsx
- [x] Créer CompanyInfoCard.tsx
- [x] Créer CompanyDescriptionCard.tsx
- [x] Créer CompanyServicesCard.tsx
- [x] Créer CompanyHoursCard.tsx
- [x] Créer CompanyGalleryCard.tsx
- [x] Refaire page.tsx

---

# Page Publique Entreprise /[slug]
- [x] Créer app/[slug]/page.tsx (Server Component)
- [x] Créer app/[slug]/CompanyPageClient.tsx (Client Component pour modal)
- [x] Metadata SEO dynamique (title, description, OpenGraph, Twitter)
- [x] Schema JSON-LD LocalBusiness
- [x] Affichage des infos, services, horaires, galerie photos

---

# SEO XXL - Landing Page & Sitemap
- [x] Refonte landing page avec metadata complètes
- [x] Schemas JSON-LD (Organization, WebSite, Service, BreadcrumbList)
- [x] Créer ServicesSection.tsx (détails ambulance/VSL)
- [x] Créer CitiesSection.tsx (maillage villes/régions)
- [x] Créer Accordion.tsx (FAQ avec FAQPage schema)
- [x] Créer app/sitemap.ts (sitemap XML dynamique)
- [x] Créer app/robots.ts
- [x] Créer app/plan-du-site/page.tsx (sitemap HTML)
- [x] Mettre à jour Footer avec lien plan du site

---

# Recherche Améliorée
- [x] Recherche par région (Normandie, Bretagne, etc.)
- [x] Recherche par ville (match partiel)
- [x] Utilisation du coverageRadius de chaque entreprise (au lieu de 20km fixe)
- [x] Messages adaptés selon le type de recherche (geo, region, city, text)
- [x] SEO page recherche (metadata, JSON-LD SearchAction)
- [x] CompanyCard responsive (truncate adresse, bouton adapté mobile)
- [x] SearchBar : icône loupe sur mobile, texte sur desktop

---

# Header Refonte
- [x] Design flottant Apple-like (rounded-2xl, backdrop-blur, shadow)
- [x] Avatar utilisateur avec initiales
- [x] Dropdown animé avec sections
- [x] Menu adapté selon le rôle (CUSTOMER vs AMBULANCIER)
- [x] Bouton "Espace Ambulancier" masqué pour ambulanciers connectés
- [x] Icône loupe recherche sur mobile
- [x] Menu mobile restructuré

---

# URLs Françaises
- [x] /login → /connexion
- [x] /signup → /inscription
- [x] /dashboard/login → /dashboard/connexion
- [x] /dashboard/signup → /dashboard/inscription
- [x] Mise à jour Header, Footer, plan-du-site

---

# Demandes de transport

## Ajouter des PJ bon de transport

# Notifications Email/SMS

## Vue d'ensemble

Système de notifications multi-canal (email + SMS) pour informer les utilisateurs des événements importants.

**Stack :**
- **Email** : Resend ✅
- **SMS** : Twilio ✅

---

## Phase 1 : Configuration et Infrastructure ✅

### 1.1 Configuration Email (Resend) ✅
- [x] `lib/email.ts` - Service d'envoi d'emails (déjà existant)
- [x] Variables d'environnement : `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL`

### 1.2 Configuration SMS ✅
- [x] Choisir le provider SMS (Twilio)
- [x] Créer `lib/sms.ts` - Service d'envoi de SMS
- [x] Variables d'environnement : `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- [x] Gestion des erreurs et retry (exponential backoff, 3 tentatives)

### 1.3 Service de notifications unifié ✅
- [x] Créer `lib/notifications/index.ts` - Orchestrateur avec logging
- [x] Créer `lib/notifications/types.ts` - Types des notifications
- [x] Créer `lib/notifications/templates.ts` - Templates email/SMS
- [x] Créer table `NotificationLog` dans Prisma (avec migration)
- [x] Créer `app/api/admin/notifications/route.ts` - API admin pour voir les logs

---

## Phase 2 : Templates Email/SMS ✅

> Templates intégrés dans `lib/notifications/templates.ts`

### 2.1 Templates implémentés
- [x] `TRANSPORT_REQUEST_CREATED` - Confirmation création demande (client)
- [x] `TRANSPORT_NEW_REQUEST` - Nouvelle demande (ambulancier)
- [x] `TRANSPORT_ACCEPTED` - Demande acceptée (client)
- [x] `TRANSPORT_REFUSED` - Demande refusée (client)
- [x] `TRANSPORT_COUNTER_PROPOSAL` - Contre-proposition (client)
- [x] `TRANSPORT_CUSTOMER_RESPONSE` - Réponse client (ambulancier)
- [x] `TRANSPORT_REMINDER` - Rappel J-1 (client)
- [x] `WELCOME_AMBULANCIER` - Bienvenue nouvel ambulancier
- [x] `WELCOME_CUSTOMER` - Bienvenue nouveau client
- [x] `ACCOUNT_ACTIVATED` - Compte activé
- [x] `VERIFICATION_CODE` - Code de vérification

### 2.2 Améliorations futures (optionnel)
- [ ] Créer templates React Email pour un meilleur design
- [ ] Ajouter logo AmbuBook dans les emails
- [ ] Footer avec liens (mentions légales, désinscription)

---

## Phase 3 : Triggers de notifications ✅

> Helpers disponibles dans `lib/notifications/index.ts`

### 3.1 Événements Transport ✅
- [x] `POST /api/customer/transports` → `notifyTransportRequestCreated()` + `notifyNewTransportRequest()`
- [x] `PATCH /api/ambulancier/demandes/[id]` (accepter) → `notifyTransportAccepted()`
- [x] `PATCH /api/ambulancier/demandes/[id]` (refuser) → `notifyTransportRefused()`
- [x] `PATCH /api/ambulancier/demandes/[id]` (contre-proposition) → `notifyTransportCounterProposal()`
- [x] `PATCH /api/customer/transports/[trackingId]` (réponse client) → `notifyTransportCustomerResponse()`

### 3.2 Cron Jobs / Rappels automatiques ✅
- [x] Créer `app/api/cron/reminders/route.ts` → `notifyTransportReminder()`
  - Rappel J-1 (veille du transport à 18h)
- [x] Configurer Vercel Cron (`vercel.json`)

### 3.3 Événements Compte ✅
- [x] Inscription client → `notifyWelcomeCustomer()` (`/api/customer-signup`)
- [x] Inscription ambulancier (invitation) → `notifyWelcomeAmbulancier()` (`/api/signup`)
- [x] Activation compte → `notifyAccountActivated()` (`/api/admin/users/[id]`)
- [x] Inscription nouvel ambulancier → `notifyAdminNewSignup()` (dans lib/email.ts)

---

## Phase 5 : Préférences utilisateur ✅

### 5.1 Modèle de données ✅
- [x] Modèle `NotificationPreferences` ajouté dans Prisma
- [x] Migration effectuée

### 5.2 API Préférences ✅
- [x] `GET /api/user/notifications` - Récupérer préférences
- [x] `PATCH /api/user/notifications` - Mettre à jour préférences

### 5.3 UI Préférences ✅
- [x] `app/dashboard/parametres/page.tsx` - Page ambulancier refaite avec persistance
- [x] `app/mon-compte/parametres/page.tsx` - Nouvelle page paramètres client
- [x] Lien "Paramètres" ajouté dans le Header pour les clients

### 5.4 Respect des préférences dans les notifications ✅
- [x] `lib/notifications/index.ts` - Vérifie les préférences avant envoi
- [x] Support du flag `force` pour les notifications critiques (VERIFICATION_CODE)

---

## Phase 6 : Logs et monitoring

### 6.1 Historique des notifications ✅
- [x] Créer table `NotificationLog` (avec enums NotificationChannel, NotificationStatus)
- [x] Créer API `GET /api/admin/notifications` avec filtres et statistiques

### 6.2 Dashboard admin
- [ ] Page admin pour voir les notifications envoyées
- [ ] Statistiques (taux d'envoi, erreurs)

---

## Checklist finale

- [ ] Tests manuels email (création transport, acceptation, etc.)
- [ ] Tests manuels SMS
- [ ] Vérifier le respect RGPD (désinscription, consentement)
- [ ] Monitoring des erreurs (Sentry ou logs)
- [ ] Documentation des templates

---

## Notes techniques

### Resend - Exemple d'utilisation
```typescript
import { Resend } from 'resend';
import { TransportAcceptedEmail } from '@/lib/emails/templates/transport-accepted';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AmbuBook <noreply@ambubook.fr>',
  to: customer.email,
  subject: 'Votre transport a été confirmé',
  react: TransportAcceptedEmail({
    customerName: customer.name,
    date: transport.requestedDate,
    company: transport.company.name,
  }),
});
```

### Service unifié - Exemple d'utilisation ✅
```typescript
import {
  notifyTransportAccepted,
  notifyTransportRefused,
  notifyTransportCounterProposal,
  sendNotification
} from "@/lib/notifications";

// Helpers prêts à l'emploi
await notifyTransportAccepted({
  patientName: "Jean Dupont",
  patientEmail: "jean@email.fr",
  patientPhone: "0612345678",
  companyName: "Ambulances Dupont",
  date: "15/03/2026",
  time: "09:30",
});
// → Envoie email + SMS avec logging automatique

// Ou envoi générique
await sendNotification({
  type: "TRANSPORT_REMINDER",
  recipient: { email: "jean@email.fr", phone: "0612345678" },
  channels: ["email", "sms"],
  data: { patientName: "Jean", date: "15/03", time: "09:30", ... },
});
```

### Variables d'environnement ✅
```env
# Email (Resend)
RESEND_API_KEY=re_xxx
FROM_EMAIL=AmbuBook <noreply@ambubook.fr>
ADMIN_EMAIL=admin@ambubook.fr

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+33xxxxxxxxx

# Cron secret (sécurité)
CRON_SECRET=xxx
```

---

# Notifications In-App (Centre de notifications)

## Vue d'ensemble

Système de notifications intégré à l'application avec icône cloche, badge de compteur et centre de notifications déroulant.

**Fonctionnalités :**
- Icône cloche dans le header avec badge (nombre de non-lues)
- Dropdown/panel avec liste des notifications
- Marquage lu/non-lu
- Actions rapides depuis les notifications
- Temps réel optionnel (polling ou WebSocket)

---

## Phase 1 : Modèle de données

### 1.1 Schema Prisma
- [x] Ajouter le modèle `InAppNotification` :
  ```prisma
  model Notification {
    id          String   @id @default(cuid())
    userId      String
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    type        String   // 'TRANSPORT_NEW' | 'TRANSPORT_ACCEPTED' | 'COUNTER_PROPOSAL' | etc.
    title       String
    message     String
    link        String?  // URL vers la ressource concernée
    metadata    Json?    // Données additionnelles (transportId, companyId, etc.)

    isRead      Boolean  @default(false)
    readAt      DateTime?

    createdAt   DateTime @default(now())

    @@index([userId, isRead])
    @@index([userId, createdAt])
  }
  ```

### 1.2 Types TypeScript
- [x] Utiliser les types existants dans `lib/notifications/types.ts` + inapp.ts :
  ```typescript
  export type NotificationType =
    | 'TRANSPORT_NEW'           // Nouvelle demande (ambulancier)
    | 'TRANSPORT_ACCEPTED'      // Demande acceptée (client)
    | 'TRANSPORT_REFUSED'       // Demande refusée (client)
    | 'COUNTER_PROPOSAL'        // Contre-proposition (client)
    | 'COUNTER_RESPONSE'        // Réponse à contre-proposition (ambulancier)
    | 'TRANSPORT_REMINDER'      // Rappel transport (tous)
    | 'TRANSPORT_CANCELLED'     // Annulation (tous)
    | 'ATTACHMENT_ADDED'        // Nouvelle PJ (ambulancier)
    | 'WELCOME'                 // Bienvenue (tous)
    | 'SYSTEM';                 // Message système

  export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
  }
  ```

---

## Phase 2 : API Backend

### 2.1 Endpoints
- [x] `GET /api/notifications` - Liste des notifications de l'utilisateur
  - Query params : `limit`, `offset`, `status`
  - Retourne : `{ notifications: [], unreadCount: number, total: number, hasMore: boolean }`

- [x] `GET /api/notifications/count` - Compteur non-lues uniquement
  - Retourne : `{ count: number }`

- [x] `PATCH /api/notifications/[id]` - Marquer comme lue

- [x] `POST /api/notifications/read-all` - Tout marquer comme lu

- [x] `DELETE /api/notifications/[id]` - Archiver une notification

### 2.2 Service de création
- [x] Créer `lib/notifications/inapp.ts` :
  ```typescript
  export async function createInAppNotification({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  }: CreateNotificationParams): Promise<Notification>

  // Helper pour créer depuis un événement transport
  export async function notifyTransportEvent(
    transportId: string,
    event: 'ACCEPTED' | 'REFUSED' | 'COUNTER_PROPOSAL' | ...
  ): Promise<void>
  ```

---

## Phase 3 : Composants UI

### 3.1 Composant NotificationBell
- [x] Créer `components/notifications/NotificationBell.tsx` :
  - Icône cloche avec badge rouge compteur
  - Props : variant "landing" | "dashboard"
  - Polling 30s du compteur
  - Toggle dropdown au clic

### 3.2 Composant NotificationDropdown
- [x] Créer `components/notifications/NotificationDropdown.tsx` :
  - Header avec "Tout marquer comme lu"
  - Liste scrollable (max-h-400px)
  - Empty state si aucune notification
  - Bouton "Charger plus" si hasMore
  - Click outside + Escape pour fermer

### 3.3 Composant NotificationItem
- [x] Créer `components/notifications/NotificationItem.tsx` :
  - Icône/couleur selon le type
  - Indicateur non-lu (barre bleue gauche)
  - Temps relatif
  - Bouton supprimer au hover
  - Clic → navigation + marquer comme lu

### 3.4 Hook useNotifications
- [x] Créer `hooks/useNotifications.ts` :
  - State : notifications, unreadCount, isLoading, error, hasMore
  - Actions : fetchNotifications, markAsRead, markAllAsRead, archiveNotification, fetchMore
  - Polling automatique du compteur (30s)

### 3.5 Page Centre de notifications (optionnel)
- [ ] Créer `app/notifications/page.tsx` - Page complète (à faire plus tard)

---

## Phase 4 : Intégration Header

### 4.1 Header Landing (clients)
- [x] Ajouter `NotificationBell` dans `components/landing/Header.tsx`
  - Visible uniquement si connecté
  - Desktop : avant le dropdown utilisateur
  - Mobile : avant le bouton menu

### 4.2 Header Dashboard (ambulanciers)
- [x] Ajouter `NotificationBell` dans `components/ambulancier/Sidebar.tsx`
  - Dans le header (quand non collapsed)
  - Variant "dashboard"

---

## Phase 5 : Polling / Temps réel

### 5.1 Option A : Polling simple (implémenté)
- [x] Hook `useNotifications()` avec polling :
  ```typescript
  export function useNotifications(pollInterval = 30000) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
      const fetchCount = async () => {
        const res = await fetch('/api/notifications/count');
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      };

      fetchCount();
      const interval = setInterval(fetchCount, pollInterval);
      return () => clearInterval(interval);
    }, [pollInterval]);

    return { unreadCount, notifications, refetch };
  }
  ```

### 5.2 Option B : Server-Sent Events (SSE) - Plus avancé
- [ ] Créer `app/api/notifications/stream/route.ts` - Endpoint SSE
- [ ] Hook `useNotificationStream()` avec EventSource

### 5.3 Option C : WebSocket (si besoin temps réel strict)
- [ ] Intégrer Pusher, Ably ou Socket.io

---

## Phase 6 : Triggers (création des notifications)

### 6.1 Intégration automatique via lib/notifications/index.ts
Les notifications in-app sont automatiquement créées via le canal "inapp" ajouté à tous les helpers :
- [x] `notifyTransportRequestCreated()` → notif client
- [x] `notifyNewTransportRequest()` → notif ambulancier
- [x] `notifyTransportAccepted()` → notif client
- [x] `notifyTransportRefused()` → notif client
- [x] `notifyTransportCounterProposal()` → notif client
- [x] `notifyTransportCustomerResponse()` → notif ambulancier
- [x] `notifyTransportReminder()` → notif client
- [x] `notifyTransportAttachmentAdded()` → notif destinataire
- [x] `notifyWelcomeCustomer()` → notif client
- [x] `notifyWelcomeAmbulancier()` → notif ambulancier
- [x] `notifyAccountActivated()` → notif utilisateur

---

## Phase 7 : Nettoyage automatique

### 7.1 Cron de purge
- [ ] Créer `app/api/cron/cleanup-notifications/route.ts` :
  - Supprimer les notifications lues de plus de 30 jours
  - Supprimer les notifications non-lues de plus de 90 jours

---

## Checklist finale

- [x] Notifications créées à chaque événement (via canal "inapp" intégré)
- [x] Badge mis à jour en polling (30s)
- [x] Clic sur notification → navigation + marquage lu
- [x] Design cohérent mobile/desktop
- [x] Performance : index DB (userId, status, createdAt), pagination
- [ ] Tests manuels complets

---

## Exemple d'implémentation NotificationBell

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-danger-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onMarkAllRead={() => setUnreadCount(0)}
        />
      )}
    </div>
  );
}
```

---

# Global

## Alerts / Toasts ✅
- [x] Créer composant `Toast.tsx` avec 4 variantes (success, error, warning, info)
- [x] `ToastProvider` avec contexte global
- [x] Hook `useToast()` pour déclencher les notifications
- [x] Animations slide-in/slide-out
- [x] Auto-dismiss configurable (5s par défaut)
- [x] Intégration dans :
  - `BookingModal.tsx` (succès/erreur réservation)
  - `app/mes-transports/page.tsx` (erreur chargement)
  - `app/mes-transports/[trackingId]/page.tsx` (réponses contre-propositions)
  - `app/dashboard/demandes/page.tsx` (erreur chargement)
  - `app/dashboard/demandes/[id]/page.tsx` (actions accepter/refuser/contre-proposition)
  - `app/dashboard/profil/page.tsx` (erreur chargement)
  - `app/dashboard/mon-entreprise/page.tsx` (succès mise à jour)
  - `components/demandes/RequestHistory.tsx` (ajout note)
  - `components/demandes/RequestAttachments.tsx` (upload/suppression fichiers)
  - `components/ambulancier/mon-entreprise/CompanyHeader.tsx` (upload logo/cover)
  - `components/ambulancier/mon-entreprise/CompanyGalleryCard.tsx` (photos)

---

# Page /mes-transports (Clients) ✅

## API
- [x] `app/api/customer/transports/route.ts` (GET liste + POST création)
- [x] `app/api/customer/transports/[trackingId]/route.ts` (GET détail + PATCH réponse)
- [x] `app/api/customer/transports/[trackingId]/attachments/route.ts` (pièces jointes)

## Pages
- [x] `app/mes-transports/page.tsx` - Liste avec filtres par statut (boutons flex)
- [x] `app/mes-transports/[trackingId]/page.tsx` - Détail avec :
  - Réponse aux contre-propositions (accepter/proposer/annuler)
  - Historique des modifications
  - Pièces jointes
- [x] `app/mes-transports/layout.tsx` - Metadata noindex

## Composants mis à jour
- [x] `RequestHistory.tsx` - Ajout prop `readOnly` pour clients
- [x] `RequestAttachments.tsx` - Support `trackingId` pour clients
- [x] `BookingModal.tsx` - Utilise `/api/customer/transports` avec userId

---

# Dashboard Admin

## Vue d'ensemble

Interface d'administration complète pour gérer la plateforme AmbuBook : utilisateurs, entreprises, transports, notifications, feedback et monitoring.

---

## Phase 1 : Layout et navigation admin

### 1.1 Structure
- [ ] Créer layout `app/admin/layout.tsx` avec sidebar admin
- [ ] Composant `AdminSidebar.tsx` avec navigation :
  - Dashboard (vue d'ensemble)
  - Utilisateurs
  - Entreprises
  - Transports
  - Notifications
  - Feedback
  - Logs système
  - Configuration
- [ ] Protection : middleware vérifiant `role === ADMIN`
- [ ] Breadcrumbs pour navigation

### 1.2 Dashboard principal
- [ ] `app/admin/page.tsx` - Vue d'ensemble avec :
  - KPIs temps réel (users, entreprises, transports actifs)
  - Graphiques d'activité (inscriptions, réservations)
  - Alertes (comptes en attente, erreurs notifs, feedback urgent)
  - Activité récente (dernières actions)

---

## Phase 2 : Gestion des utilisateurs

### 2.1 Liste utilisateurs
- [ ] `app/admin/utilisateurs/page.tsx`
  - Tableau paginé avec recherche
  - Filtres : rôle (ADMIN/AMBULANCIER/CUSTOMER), statut (actif/inactif), date inscription
  - Colonnes : nom, email, rôle, entreprise, statut, date inscription, dernière connexion
  - Actions rapides : activer/désactiver, voir détail

### 2.2 Détail utilisateur
- [ ] `app/admin/utilisateurs/[id]/page.tsx`
  - Informations complètes
  - Historique des connexions
  - Transports associés (si client)
  - Entreprise associée (si ambulancier)
  - Notifications envoyées
  - Actions : modifier rôle, activer/désactiver, supprimer, réinitialiser MDP

### 2.3 Ambulanciers en attente
- [ ] Section ou filtre dédié aux comptes AMBULANCIER `isActive=false`
  - Liste avec infos entreprise
  - Actions : valider, refuser avec motif
  - Notification automatique à la validation

### 2.4 API utilisateurs
- [ ] `GET /api/admin/users` - Liste paginée avec filtres
- [ ] `GET /api/admin/users/[id]` - Détail complet
- [ ] `PATCH /api/admin/users/[id]` - Modifier (rôle, statut)
- [ ] `DELETE /api/admin/users/[id]` - Supprimer (soft delete)
- [ ] `POST /api/admin/users/[id]/reset-password` - Envoyer lien reset

---

## Phase 3 : Gestion des entreprises

### 3.1 Liste entreprises
- [ ] `app/admin/entreprises/page.tsx`
  - Tableau paginé avec recherche (nom, ville, SIRET)
  - Filtres : statut (active/inactive), services (ambulance/VSL), région
  - Colonnes : nom, ville, gérant, nb employés, nb transports, statut
  - Actions rapides : activer/désactiver, voir page publique

### 3.2 Détail entreprise
- [ ] `app/admin/entreprises/[id]/page.tsx`
  - Toutes les infos (contact, services, horaires, description)
  - Liste des employés avec rôles
  - Statistiques transports (acceptés, refusés, taux)
  - Galerie photos
  - Actions : modifier, activer/désactiver, supprimer

### 3.3 API entreprises
- [ ] `GET /api/admin/companies` - Liste paginée
- [ ] `GET /api/admin/companies/[id]` - Détail complet
- [ ] `PATCH /api/admin/companies/[id]` - Modifier
- [ ] `DELETE /api/admin/companies/[id]` - Supprimer (soft delete)

---

## Phase 4 : Gestion des transports

### 4.1 Liste transports
- [ ] `app/admin/transports/page.tsx`
  - Tableau paginé avec recherche (patient, trackingId)
  - Filtres : statut, entreprise, date, type (ambulance/VSL)
  - Colonnes : ID, patient, entreprise, date, trajet, statut, créé le
  - Actions : voir détail

### 4.2 Détail transport
- [ ] `app/admin/transports/[id]/page.tsx`
  - Infos complètes (patient, adresses, horaires, options)
  - Historique complet des événements
  - Pièces jointes
  - Notifications envoyées pour ce transport
  - Actions : modifier statut (cas exceptionnel), ajouter note admin

### 4.3 Statistiques transports
- [ ] Dashboard stats transports :
  - Volume par jour/semaine/mois
  - Répartition par statut
  - Taux d'acceptation/refus
  - Top entreprises par volume
  - Temps moyen de réponse

### 4.4 API transports
- [ ] `GET /api/admin/transports` - Liste paginée
- [ ] `GET /api/admin/transports/[id]` - Détail complet
- [ ] `GET /api/admin/transports/stats` - Statistiques

---

## Phase 5 : Notifications (logs et monitoring)

### 5.1 Logs notifications
- [ ] `app/admin/notifications/page.tsx`
  - Liste paginée des notifications envoyées
  - Filtres : canal (email/sms/inapp), type, statut, date
  - Recherche par destinataire
  - Colonnes : date, canal, type, destinataire, statut, actions

### 5.2 Détail notification
- [ ] Modal ou page détail :
  - Contenu complet (sujet, body)
  - Métadonnées (transportId, etc.)
  - Erreur si échec

### 5.3 Statistiques notifications
- [ ] Dashboard stats :
  - Compteurs : envoyées, échouées, taux succès
  - Graphique évolution 7/30 jours
  - Répartition par canal et par type

### 5.4 Actions
- [ ] Retry notifications FAILED
- [ ] Export CSV des logs

### 5.5 API notifications
- [ ] `GET /api/admin/notifications` - Liste paginée
- [ ] `GET /api/admin/notifications/stats` - Statistiques
- [ ] `POST /api/admin/notifications/[id]/retry` - Renvoyer
- [ ] `GET /api/admin/notifications/export` - Export CSV

---

## Phase 6 : Feedback et support

### 6.1 Liste feedback
- [ ] `app/admin/feedback/page.tsx`
  - Liste paginée des retours utilisateurs
  - Filtres : type (bug/amélioration/autre), statut (nouveau/en cours/résolu), priorité
  - Colonnes : date, utilisateur, type, sujet, statut, priorité

### 6.2 Détail feedback
- [ ] `app/admin/feedback/[id]/page.tsx`
  - Message complet
  - Infos utilisateur (rôle, entreprise)
  - Captures d'écran si jointes
  - Métadonnées (URL, navigateur, OS)
  - Historique des réponses/actions
  - Actions : changer statut, assigner, répondre, archiver

### 6.3 API feedback
- [ ] `GET /api/admin/feedback` - Liste paginée
- [ ] `GET /api/admin/feedback/[id]` - Détail
- [ ] `PATCH /api/admin/feedback/[id]` - Modifier statut/priorité
- [ ] `POST /api/admin/feedback/[id]/reply` - Répondre (notifie l'utilisateur)

---

## Phase 7 : Logs système

### 7.1 Logs d'activité
- [ ] `app/admin/logs/page.tsx`
  - Actions importantes : connexions, modifications, suppressions
  - Filtres : type d'action, utilisateur, date
  - Recherche

### 7.2 Logs d'erreurs
- [ ] Section erreurs applicatives
  - Intégration Sentry ou logs custom
  - Erreurs API, erreurs client
  - Stack traces

---

## Phase 8 : Configuration plateforme

### 8.1 Paramètres généraux
- [ ] `app/admin/configuration/page.tsx`
  - Nom de la plateforme, logo
  - Emails de contact/support
  - Maintenance mode (toggle)

### 8.2 Templates notifications
- [ ] Édition des templates email/SMS (optionnel, avancé)
  - Prévisualisation
  - Variables disponibles

### 8.3 Feature flags
- [ ] Activer/désactiver des fonctionnalités
  - Inscriptions ouvertes
  - Réservations en ligne
  - Notifications SMS

---

## Checklist Admin

- [ ] Toutes les pages protégées (ADMIN only)
- [ ] Design cohérent (sidebar, tables, filtres)
- [ ] Pagination performante
- [ ] Filtres persistés dans URL
- [ ] Export CSV sur les listes principales
- [ ] Actions confirmées (suppression, etc.)
- [ ] Logs des actions admin
- [ ] Tests manuels complets

---

# Widget Feedback (Bug Report / Suggestions)

## Vue d'ensemble

Widget flottant (infobulle) présent sur toutes les pages client et dashboard permettant aux utilisateurs de remonter des bugs ou suggestions à l'admin.

---

## Phase 1 : Modèle de données

### 1.1 Schema Prisma
- [ ] Créer modèle `Feedback` :
  ```prisma
  enum FeedbackType {
    BUG
    IMPROVEMENT
    QUESTION
    OTHER
  }

  enum FeedbackStatus {
    NEW
    IN_PROGRESS
    RESOLVED
    WONT_FIX
  }

  enum FeedbackPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  model Feedback {
    id          String           @id @default(cuid())
    type        FeedbackType
    subject     String
    message     String           @db.Text
    screenshot  String?          // URL image uploadée
    pageUrl     String           // URL où le feedback a été soumis
    userAgent   String?          // Navigateur/OS
    status      FeedbackStatus   @default(NEW)
    priority    FeedbackPriority @default(MEDIUM)
    adminNotes  String?          @db.Text
    resolvedAt  DateTime?
    createdAt   DateTime         @default(now())
    updatedAt   DateTime         @updatedAt

    user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
    userId String?

    @@index([status])
    @@index([type])
    @@index([createdAt])
    @@map("feedbacks")
  }
  ```
- [ ] Migration Prisma
- [ ] Ajouter relation sur User

---

## Phase 2 : API Feedback

### 2.1 Endpoints utilisateur
- [ ] `POST /api/feedback` - Soumettre un feedback
  - Body : type, subject, message, screenshot (base64 optionnel), pageUrl
  - Récupérer userAgent automatiquement
  - Upload screenshot vers S3 si fourni

### 2.2 Notification admin
- [ ] Envoyer email à l'admin lors d'un nouveau feedback
- [ ] Notification in-app si implémenté côté admin

---

## Phase 3 : Widget UI

### 3.1 Composant FeedbackWidget
- [ ] `components/feedback/FeedbackWidget.tsx`
  - Bouton flottant (coin bas-droite) avec icône (MessageSquare ou Bug)
  - Badge si feedback précédent non résolu (optionnel)
  - Hover : tooltip "Signaler un bug / Suggestion"

### 3.2 Modal FeedbackForm
- [ ] `components/feedback/FeedbackModal.tsx`
  - Select type : Bug, Amélioration, Question, Autre
  - Input sujet (obligatoire)
  - Textarea message (obligatoire)
  - Bouton capture d'écran (optionnel) - utiliser html2canvas ou upload manuel
  - Checkbox "Inclure les infos de debug" (URL, navigateur)
  - Bouton Envoyer

### 3.3 États du widget
- [ ] État fermé : juste le bouton flottant
- [ ] État ouvert : modal par-dessus
- [ ] État envoyé : message de confirmation + fermeture auto

---

## Phase 4 : Intégration

### 4.1 Ajout global
- [ ] Ajouter `<FeedbackWidget />` dans :
  - `app/layout.tsx` (pages publiques) - si connecté
  - `app/dashboard/layout.tsx` (ambulanciers)
  - `app/admin/layout.tsx` (admins - optionnel)

### 4.2 Contexte automatique
- [ ] Capturer automatiquement :
  - URL courante (`usePathname`)
  - User-Agent
  - Timestamp
  - User ID si connecté

---

## Phase 5 : Capture d'écran (optionnel avancé)

### 5.1 Capture automatique
- [ ] Intégrer `html2canvas` pour capture d'écran en un clic
- [ ] Prévisualisation avant envoi
- [ ] Compression image avant upload

### 5.2 Annotation (optionnel++)
- [ ] Permettre d'annoter la capture (cercles, flèches)
- [ ] Lib : `react-image-annotation` ou custom canvas

---

## Checklist Widget Feedback

- [ ] Widget non intrusif (petit, coin de l'écran)
- [ ] Accessible au clavier
- [ ] Responsive (adaptation mobile)
- [ ] Validation formulaire
- [ ] Feedback visuel à l'envoi (toast succès)
- [ ] Rate limiting (éviter spam)
- [ ] Tests manuels

---

# Onboarding Ambulancier (Owner)

## Vue d'ensemble

Lors de la première connexion d'un ambulancier Owner (gérant), afficher un wizard d'onboarding pour l'accompagner dans la configuration de sa page entreprise.

---

## Phase 1 : Détection et stockage

### 1.1 Modèle de données
- [ ] Ajouter champ `onboardingCompleted Boolean @default(false)` sur `User` ou `Company`
- [ ] Migration Prisma

### 1.2 Logique de détection
- [ ] Vérifier si `user.isOwner && !company.onboardingCompleted` à la connexion
- [ ] Rediriger vers `/dashboard/onboarding` ou afficher modal

---

## Phase 2 : Wizard d'onboarding

### 2.1 Structure du wizard
- [ ] Créer `app/dashboard/onboarding/page.tsx`
- [ ] Composant `OnboardingWizard.tsx` avec étapes :

### 2.2 Étape 1 : Informations de base
- [ ] Nom de l'entreprise (pré-rempli)
- [ ] Adresse complète
- [ ] Téléphone de contact
- [ ] Email de contact
- [ ] N° SIRET (vérification)
- [ ] N° agrément ARS

### 2.3 Étape 2 : Services proposés
- [ ] Types de véhicules : Ambulance, VSL (checkboxes)
- [ ] Rayon de couverture (km)
- [ ] Accepte réservations en ligne (toggle)

### 2.4 Étape 3 : Identité visuelle
- [ ] Upload logo entreprise
- [ ] Upload photo de couverture
- [ ] Aperçu en temps réel

### 2.5 Étape 4 : Description
- [ ] Textarea description entreprise
- [ ] Conseils/exemples pour une bonne description
- [ ] Compteur de caractères

### 2.6 Étape 5 : Horaires d'ouverture
- [ ] Grille horaires par jour
- [ ] Option "Fermé" par jour
- [ ] Copier horaires d'un jour à l'autre

### 2.7 Étape 6 : Galerie photos (optionnel)
- [ ] Upload multiple photos
- [ ] Drag & drop pour réorganiser
- [ ] Possibilité de skip cette étape

### 2.8 Étape finale : Récapitulatif
- [ ] Aperçu de la page entreprise
- [ ] Bouton "Terminer la configuration"
- [ ] Marquer `onboardingCompleted = true`

---

## Phase 3 : Composants UI

### 3.1 Composants wizard
- [ ] `OnboardingProgress.tsx` - Barre de progression avec étapes
- [ ] `OnboardingStep.tsx` - Container générique pour chaque étape
- [ ] `OnboardingNavigation.tsx` - Boutons Précédent/Suivant/Passer

### 3.2 Composants spécifiques
- [ ] `LogoUploader.tsx` - Upload avec crop/preview
- [ ] `HoursEditor.tsx` - Éditeur d'horaires (réutiliser existant si possible)
- [ ] `CompanyPreview.tsx` - Aperçu carte entreprise

---

## Phase 4 : API

### 4.1 Endpoints
- [ ] `GET /api/onboarding/status` - Vérifier si onboarding nécessaire
- [ ] `PATCH /api/onboarding/step/[step]` - Sauvegarder une étape
- [ ] `POST /api/onboarding/complete` - Marquer comme terminé

### 4.2 Sauvegarde progressive
- [ ] Sauvegarder chaque étape au clic "Suivant"
- [ ] Permettre de reprendre où on s'est arrêté

---

## Phase 5 : Intégration

### 5.1 Redirection automatique
- [ ] Middleware ou check dans layout dashboard
- [ ] Si onboarding non complété → redirect `/dashboard/onboarding`
- [ ] Permettre d'accéder aux autres pages après skip explicite

### 5.2 Rappel si non terminé
- [ ] Banner dans le dashboard "Terminez la configuration de votre entreprise"
- [ ] Lien vers `/dashboard/onboarding`

### 5.3 Accès ultérieur
- [ ] Permettre de relancer l'onboarding depuis Paramètres
- [ ] Ou simplement éditer via "Mon entreprise"

---

## Checklist Onboarding

- [ ] Wizard responsive (mobile-friendly)
- [ ] Validation à chaque étape
- [ ] Sauvegarde progressive (pas de perte de données)
- [ ] Skip possible pour étapes optionnelles
- [ ] Animations fluides entre étapes
- [ ] Message de bienvenue personnalisé
- [ ] Confettis ou animation à la fin
- [ ] Tests manuels du flow complet

# Sécurité

## Vue d'ensemble

Audit et renforcement de la sécurité de la plateforme AmbuBook : authentification, autorisation, protection des données, conformité RGPD.

---

## Phase 1 : Authentification et sessions

### 1.1 Audit Better Auth
- [ ] Vérifier la configuration des sessions (durée, refresh)
- [ ] Vérifier le hashage des mots de passe (bcrypt/argon2)
- [ ] Forcer HTTPS en production
- [ ] Configurer les cookies sécurisés (HttpOnly, Secure, SameSite)

### 1.2 Renforcement connexion
- [ ] Rate limiting sur /api/auth/login (ex: 5 tentatives/15min)
- [ ] Détection de connexions suspectes (nouvel appareil, nouvelle IP)
- [ ] Option 2FA pour les admins (TOTP avec authenticator)
- [ ] Logs des connexions (IP, user-agent, timestamp)

### 1.3 Mots de passe
- [ ] Politique de mot de passe (min 8 chars, complexité)
- [ ] Vérification contre liste de mots de passe compromis (haveibeenpwned API)
- [ ] Expiration des liens de reset password (1h max)
- [ ] Mise en place du "forgot password"

---

## Phase 2 : Autorisation et contrôle d'accès

### 2.1 Audit des routes API
- [ ] Vérifier que toutes les routes protégées vérifient la session
- [ ] Vérifier les contrôles de rôle (ADMIN, AMBULANCIER, CUSTOMER)
- [ ] Vérifier l'ownership (un user ne peut modifier que ses propres données)
- [ ] Documenter les permissions par route

### 2.2 Middleware de sécurité
- [ ] Middleware centralisé pour vérification auth + rôle
- [ ] Logs des accès refusés (403)
- [ ] Protection CSRF sur les mutations

### 2.3 Isolation des données
- [ ] Un ambulancier ne voit que les demandes de son entreprise
- [ ] Un client ne voit que ses propres transports
- [ ] Les admins voient tout (avec logs)

---

## Phase 3 : Protection des données

### 3.1 Données sensibles
- [ ] Chiffrement des données sensibles en base (N° sécu, etc.) - optionnel
- [ ] Masquage des données sensibles dans les logs
- [ ] Ne jamais exposer les IDs internes dans les URLs publiques (utiliser trackingId)

### 3.2 Upload de fichiers
- [ ] Validation des types MIME (images, PDF uniquement)
- [ ] Limite de taille (ex: 10MB max)
- [ ] Scan antivirus (optionnel, via ClamAV ou service cloud)
- [ ] Stockage sur S3 avec URLs signées (expiration)

### 3.3 Sanitization
- [ ] Sanitizer les inputs HTML (éviter XSS)
- [ ] Échapper les données dans les emails/SMS
- [ ] Validation Zod sur toutes les entrées API

---

## Phase 4 : Protection contre les attaques

### 4.1 Rate limiting global
- [ ] Configurer rate limiting sur l'API (ex: Vercel Edge, Upstash)
- [ ] Rate limiting spécifique sur :
  - Création de compte
  - Envoi de notifications
  - Upload de fichiers
  - Soumission de feedback

### 4.2 Headers de sécurité
- [ ] Content-Security-Policy (CSP)
- [ ] X-Frame-Options (DENY)
- [ ] X-Content-Type-Options (nosniff)
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] Configurer dans `next.config.js` ou middleware

### 4.3 Protection DDOS
- [ ] Cloudflare ou équivalent en frontal
- [ ] Challenge sur les requêtes suspectes

---

## Phase 5 : Conformité RGPD

### 5.1 Consentement
- [ ] Banner cookies avec choix (nécessaires, analytics, marketing)
- [ ] Stockage du consentement
- [ ] Respect du choix (pas de tracking sans consentement)

### 5.2 Droits des utilisateurs
- [ ] Page "Mes données" pour les utilisateurs
- [ ] Export des données personnelles (JSON/PDF)
- [ ] Suppression du compte (avec confirmation)
- [ ] Anonymisation plutôt que suppression pour l'historique

### 5.3 Documentation légale
- [ ] Politique de confidentialité complète
- [ ] Mentions légales
- [ ] CGU / CGV
- [ ] Registre des traitements (interne)

### 5.4 Rétention des données
- [ ] Définir durées de conservation :
  - Comptes inactifs : 3 ans
  - Transports terminés : 5 ans (obligations légales)
  - Logs : 1 an
  - Notifications : 30-90 jours ✅ (cron créé)
- [ ] Cron de purge automatique

---

## Phase 6 : Monitoring et alertes

### 6.1 Logs de sécurité
- [ ] Logger les événements de sécurité :
  - Connexions réussies/échouées
  - Changements de mot de passe
  - Modifications de rôle
  - Accès admin
  - Suppressions de données

### 6.2 Alertes
- [ ] Alerte sur connexions multiples échouées
- [ ] Alerte sur activité admin inhabituelle
- [ ] Intégration Sentry pour les erreurs

### 6.3 Audit trail
- [ ] Table `AuditLog` pour tracer les actions sensibles
- [ ] Qui, quoi, quand, IP, user-agent

---

## Checklist Sécurité

- [ ] Audit des dépendances (npm audit, Snyk)
- [ ] Variables d'environnement sécurisées (pas de secrets dans le code)
- [ ] Backup base de données automatisé
- [ ] Plan de réponse aux incidents
- [ ] Tests de pénétration (pentest) - optionnel
- [ ] Revue de code sécurité

---

# SEO et Référencement

## Vue d'ensemble

Optimisation du référencement naturel (SEO) pour maximiser la visibilité d'AmbuBook sur les moteurs de recherche.

---

## Phase 1 : Fondations SEO (déjà fait)

### 1.1 Structure technique ✅
- [x] Sitemap XML dynamique (`app/sitemap.ts`)
- [x] Robots.txt (`app/robots.ts`)
- [x] Plan du site HTML (`app/plan-du-site/page.tsx`)
- [x] Métadonnées dynamiques par page

### 1.2 Schemas JSON-LD ✅
- [x] Organization (page d'accueil)
- [x] LocalBusiness (pages entreprises)
- [x] Service (services ambulance/VSL)
- [x] FAQPage (FAQ)
- [x] BreadcrumbList

---

## Phase 2 : Optimisation des pages existantes

### 2.1 Page d'accueil
- [ ] Audit du contenu (densité mots-clés, H1/H2)
- [ ] Optimiser le Hero (texte accrocheur avec mots-clés)
- [ ] Ajouter plus de contenu textuel (éviter page trop "design")
- [ ] Section témoignages/avis (preuve sociale)

### 2.2 Pages entreprises /[slug]
- [ ] Title optimisé : "Ambulances [Nom] à [Ville] - Réservation en ligne"
- [ ] Meta description unique et attractive
- [ ] Contenu structuré (H2 pour services, horaires, etc.)
- [ ] Ajouter section FAQ spécifique à l'entreprise
- [ ] Images avec alt text descriptif

### 2.3 Page recherche /recherche
- [ ] URLs propres avec query params lisibles
- [ ] Contenu dynamique selon la recherche
- [ ] Pages de résultats indexables (si pertinent)

---

## Phase 3 : Pages de contenu SEO

### 3.1 Pages villes/régions
- [ ] Créer pages dédiées : `/ambulances-[ville]`
  - Ex: `/ambulances-paris`, `/ambulances-lyon`
  - Contenu unique par ville
  - Liste des entreprises de la zone
  - Infos pratiques locales
- [ ] Créer pages régions : `/ambulances-[region]`
  - Ex: `/ambulances-ile-de-france`

### 3.2 Pages services
- [ ] `/services/ambulance` - Page dédiée ambulance
- [ ] `/services/vsl` - Page dédiée VSL
- [ ] `/services/transport-medical` - Page générique
- [ ] Contenu détaillé, FAQ, tarifs indicatifs

### 3.3 Blog / Articles (optionnel)
- [ ] Section blog `/blog`
- [ ] Articles informatifs :
  - "Comment réserver un transport médical ?"
  - "Ambulance ou VSL : comment choisir ?"
  - "Remboursement transport sanitaire : guide complet"
  - "Bon de transport : tout savoir"
- [ ] Optimisation SEO de chaque article

---

## Phase 4 : SEO technique avancé

### 4.1 Performance (Core Web Vitals)
- [ ] Audit Lighthouse (viser score > 90)
- [ ] Optimisation images (WebP, lazy loading, srcset)
- [ ] Minification CSS/JS
- [ ] Preload fonts critiques
- [ ] Réduire le JavaScript non essentiel

### 4.2 Mobile-first
- [ ] Vérifier le rendu mobile sur toutes les pages
- [ ] Test Mobile-Friendly de Google
- [ ] Optimiser les interactions tactiles

### 4.3 Indexation
- [ ] Vérifier l'indexation dans Google Search Console
- [ ] Corriger les erreurs d'exploration
- [ ] Soumettre le sitemap
- [ ] Surveiller les pages exclues

### 4.4 Liens internes
- [ ] Maillage interne cohérent
- [ ] Breadcrumbs sur toutes les pages
- [ ] Liens contextuels dans le contenu
- [ ] Footer avec liens vers pages importantes

---

## Phase 5 : SEO off-page

### 5.1 Google Business Profile
- [ ] Créer/revendiquer la fiche AmbuBook
- [ ] Infos complètes (horaires, contact, description)
- [ ] Photos de qualité
- [ ] Répondre aux avis

### 5.2 Backlinks
- [ ] Annuaires professionnels santé/transport
- [ ] Partenariats avec sites médicaux
- [ ] Articles invités (guest posting)
- [ ] Relations presse locale

### 5.3 Réseaux sociaux
- [ ] Présence sur LinkedIn (B2B ambulanciers)
- [ ] Page Facebook (B2C patients)
- [ ] Partage des articles de blog

### 5.4 Newsletter
- [ ] Formulaire d'inscription

---

## Phase 6 : Monitoring SEO

### 6.1 Outils
- [ ] Google Search Console configuré
- [ ] Google Analytics 4 configuré
- [ ] Suivi des positions (SEMrush, Ahrefs, ou gratuit)

### 6.2 KPIs à suivre
- [ ] Impressions et clics organiques
- [ ] Positions sur mots-clés cibles
- [ ] Pages les plus visitées
- [ ] Taux de rebond par page
- [ ] Conversions (réservations) depuis organique

### 6.3 Rapports
- [ ] Rapport mensuel SEO
- [ ] Alertes sur chutes de trafic
- [ ] Suivi des Core Web Vitals

---

## Mots-clés cibles

### Principaux
- ambulance [ville]
- VSL [ville]
- transport médical [ville]
- réserver ambulance
- ambulance en ligne

### Longue traîne
- réserver une ambulance pour rendez-vous médical
- transport médical assis [ville]
- ambulance pour dialyse
- comment obtenir un bon de transport
- remboursement transport sanitaire

---

## Checklist SEO

- [ ] Toutes les pages ont un title unique (< 60 chars)
- [ ] Toutes les pages ont une meta description (< 160 chars)
- [ ] Toutes les images ont un alt text
- [ ] URLs propres et descriptives
- [ ] Pas de contenu dupliqué
- [ ] Sitemap à jour et soumis
- [ ] Robots.txt correct
- [ ] HTTPS partout
- [ ] Temps de chargement < 3s
- [ ] Mobile-friendly validé