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

# Notifications

## Admin
- Nouvel ambulancier

## Ambulancier
- Nouvelle demande de transport
- Transport mis à jour par le client
- Un trajet est sur le point de commencer

## Client
- Votre demande de transport a été + statut
- Un trajet est sur le point de commencer
