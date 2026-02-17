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
- **Email** : Resend (déjà configuré dans le projet)
- **SMS** : À choisir (Twilio, OVH SMS, Vonage, ou autre)

---

## Phase 1 : Configuration et Infrastructure

### 1.1 Configuration Email (Resend)
- [ ] Vérifier la configuration Resend existante (`lib/resend.ts` ou similaire)
- [ ] Créer `lib/email.ts` - Service d'envoi d'emails
- [ ] Configurer le domaine d'envoi (noreply@ambubook.fr)
- [ ] Variables d'environnement : `RESEND_API_KEY`, `EMAIL_FROM`

### 1.2 Configuration SMS
- [ ] Choisir le provider SMS (Twilio recommandé pour la fiabilité)
- [ ] Créer `lib/sms.ts` - Service d'envoi de SMS
- [ ] Variables d'environnement : `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_FROM`
- [ ] Gestion des erreurs et retry

### 1.3 Service de notifications unifié
- [ ] Créer `lib/notifications.ts` - Orchestrateur
  ```typescript
  interface NotificationPayload {
    type: NotificationType;
    recipient: { email?: string; phone?: string; userId?: string };
    data: Record<string, unknown>;
    channels: ('email' | 'sms')[];
  }

  async function sendNotification(payload: NotificationPayload): Promise<void>
  ```
- [ ] Créer `lib/notifications/types.ts` - Types des notifications

---

## Phase 2 : Templates Email

### 2.1 Layout de base
- [ ] Créer `lib/emails/templates/layout.tsx` - Template React Email
  - Logo AmbuBook
  - Footer avec liens (mentions légales, désinscription)
  - Styles cohérents avec la charte graphique

### 2.2 Templates par événement
- [ ] `transport-request-created.tsx` - Confirmation création demande (client)
- [ ] `transport-request-new.tsx` - Nouvelle demande (ambulancier)
- [ ] `transport-request-accepted.tsx` - Demande acceptée (client)
- [ ] `transport-request-refused.tsx` - Demande refusée (client)
- [ ] `transport-request-counter-proposal.tsx` - Contre-proposition (client)
- [ ] `transport-request-updated.tsx` - Mise à jour par client (ambulancier)
- [ ] `transport-reminder.tsx` - Rappel J-1 ou H-2 (client + ambulancier)
- [ ] `welcome-ambulancier.tsx` - Bienvenue nouvel ambulancier
- [ ] `welcome-customer.tsx` - Bienvenue nouveau client

---

## Phase 3 : Templates SMS

### 3.1 Messages courts
- [ ] Créer `lib/sms/templates.ts`
  ```typescript
  const SMS_TEMPLATES = {
    TRANSPORT_ACCEPTED: "AmbuBook: Votre transport du {date} à {time} est confirmé. Suivi: {trackingUrl}",
    TRANSPORT_REMINDER: "AmbuBook: Rappel - Transport demain {date} à {time}. {companyPhone}",
    COUNTER_PROPOSAL: "AmbuBook: Nouvelle proposition pour votre transport. Voir: {trackingUrl}",
  };
  ```

---

## Phase 4 : Triggers de notifications

### 4.1 Événements Transport
- [ ] `POST /api/customer/transports` → Notifier ambulancier (email + SMS)
- [ ] `PATCH /api/ambulancier/demandes/[id]` (accepter) → Notifier client
- [ ] `PATCH /api/ambulancier/demandes/[id]` (refuser) → Notifier client
- [ ] `PATCH /api/ambulancier/demandes/[id]` (contre-proposition) → Notifier client
- [ ] `PATCH /api/customer/transports/[trackingId]` (réponse client) → Notifier ambulancier

### 4.2 Cron Jobs / Rappels automatiques
- [ ] Créer `app/api/cron/reminders/route.ts`
  - Rappel J-1 (veille du transport)
  - Rappel H-2 (2h avant le transport)
- [ ] Configurer Vercel Cron ou autre scheduler
  ```json
  // vercel.json
  {
    "crons": [
      { "path": "/api/cron/reminders", "schedule": "0 8 * * *" },
      { "path": "/api/cron/reminders", "schedule": "0 * * * *" }
    ]
  }
  ```

### 4.3 Événements Admin
- [ ] Inscription nouvel ambulancier → Notifier admin

---

## Phase 5 : Préférences utilisateur

### 5.1 Modèle de données
- [ ] Ajouter dans Prisma :
  ```prisma
  model NotificationPreferences {
    id        String   @id @default(cuid())
    userId    String   @unique
    user      User     @relation(fields: [userId], references: [id])

    // Canaux
    emailEnabled    Boolean @default(true)
    smsEnabled      Boolean @default(true)

    // Types de notifications
    transportUpdates    Boolean @default(true)
    transportReminders  Boolean @default(true)
    marketing           Boolean @default(false)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```

### 5.2 API Préférences
- [ ] `GET /api/user/notifications` - Récupérer préférences
- [ ] `PATCH /api/user/notifications` - Mettre à jour préférences

### 5.3 UI Préférences
- [ ] Ajouter section dans `app/dashboard/parametres/page.tsx`
- [ ] Ajouter section dans profil client (à créer ou dans /mes-transports)

---

## Phase 6 : Logs et monitoring

### 6.1 Historique des notifications
- [ ] Créer table `NotificationLog` :
  ```prisma
  model NotificationLog {
    id          String   @id @default(cuid())
    userId      String?
    channel     String   // 'email' | 'sms'
    type        String   // type de notification
    recipient   String   // email ou téléphone
    status      String   // 'sent' | 'failed' | 'bounced'
    metadata    Json?    // données supplémentaires
    sentAt      DateTime @default(now())

    user User? @relation(fields: [userId], references: [id])
  }
  ```

### 6.2 Dashboard admin (optionnel)
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

### Twilio SMS - Exemple
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: `AmbuBook: Votre transport du ${date} est confirmé.`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: customer.phone,
});
```

### Variables d'environnement à ajouter
```env
# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=AmbuBook <noreply@ambubook.fr>

# SMS (Twilio)
TWILIO_SID=xxx
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
- [ ] Ajouter le modèle `Notification` :
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
- [ ] Créer `lib/types/notifications.ts` :
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
- [ ] `GET /api/notifications` - Liste des notifications de l'utilisateur
  - Query params : `limit`, `offset`, `unreadOnly`
  - Retourne : `{ notifications: [], unreadCount: number, total: number }`

- [ ] `GET /api/notifications/count` - Compteur non-lues uniquement
  - Retourne : `{ unreadCount: number }`

- [ ] `PATCH /api/notifications/[id]` - Marquer comme lue
  - Body : `{ isRead: true }`

- [ ] `POST /api/notifications/mark-all-read` - Tout marquer comme lu

- [ ] `DELETE /api/notifications/[id]` - Supprimer une notification

### 2.2 Service de création
- [ ] Créer `lib/notifications/in-app.ts` :
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
- [ ] Créer `components/notifications/NotificationBell.tsx` :
  ```typescript
  // Icône cloche avec badge
  // - Badge rouge avec compteur si > 0
  // - Animation pulse sur nouvelle notification
  // - Ouvre le dropdown au clic
  ```

### 3.2 Composant NotificationDropdown
- [ ] Créer `components/notifications/NotificationDropdown.tsx` :
  ```typescript
  // Panel déroulant avec :
  // - Header "Notifications" + bouton "Tout marquer comme lu"
  // - Liste scrollable des notifications
  // - Chaque item : icône type + titre + message + temps relatif
  // - Indicateur visuel lu/non-lu
  // - Lien "Voir toutes les notifications"
  // - Empty state si aucune notification
  ```

### 3.3 Composant NotificationItem
- [ ] Créer `components/notifications/NotificationItem.tsx` :
  ```typescript
  // Item individuel :
  // - Icône selon le type (check vert, x rouge, clock, etc.)
  // - Titre en gras si non-lu
  // - Message tronqué
  // - Temps relatif (il y a 5 min, hier, etc.)
  // - Hover : bouton supprimer
  // - Clic : navigation vers link + marquer comme lu
  ```

### 3.4 Page Centre de notifications (optionnel)
- [ ] Créer `app/notifications/page.tsx` - Page complète avec :
  - Toutes les notifications paginées
  - Filtres (toutes, non-lues, par type)
  - Actions groupées

---

## Phase 4 : Intégration Header

### 4.1 Header Landing (clients)
- [ ] Ajouter `NotificationBell` dans `components/landing/Header.tsx`
  - Visible uniquement si connecté
  - Position : à gauche de l'avatar

### 4.2 Header Dashboard (ambulanciers)
- [ ] Ajouter `NotificationBell` dans `components/ambulancier/Sidebar.tsx` ou header dashboard
  - Toujours visible

---

## Phase 5 : Polling / Temps réel

### 5.1 Option A : Polling simple (recommandé pour commencer)
- [ ] Hook `useNotifications()` avec polling :
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

### 6.1 Intégration dans les APIs existantes
- [ ] `POST /api/customer/transports` :
  - Créer notif "Nouvelle demande" pour l'ambulancier

- [ ] `PATCH /api/ambulancier/demandes/[id]` (accepter) :
  - Créer notif "Transport accepté" pour le client

- [ ] `PATCH /api/ambulancier/demandes/[id]` (refuser) :
  - Créer notif "Transport refusé" pour le client

- [ ] `PATCH /api/ambulancier/demandes/[id]` (contre-proposition) :
  - Créer notif "Contre-proposition reçue" pour le client

- [ ] `PATCH /api/customer/transports/[trackingId]` (réponse) :
  - Créer notif "Réponse du client" pour l'ambulancier

- [ ] Upload PJ :
  - Créer notif "Nouvelle pièce jointe" pour l'ambulancier

---

## Phase 7 : Nettoyage automatique

### 7.1 Cron de purge
- [ ] Créer `app/api/cron/cleanup-notifications/route.ts` :
  - Supprimer les notifications lues de plus de 30 jours
  - Supprimer les notifications non-lues de plus de 90 jours

---

## Checklist finale

- [ ] Notifications créées à chaque événement
- [ ] Badge mis à jour en temps réel (ou polling)
- [ ] Clic sur notification → navigation + marquage lu
- [ ] Design cohérent mobile/desktop
- [ ] Performance : index DB, pagination
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
