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
