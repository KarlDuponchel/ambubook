# TODO - AmbuBook

> **~150 tâches restantes** (après dédoublonnage)

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
- [ ] `app/admin/page.tsx` - Vue d'ensemble avec KPIs, graphiques, alertes
- [ ] Dashboard stats transports (volume, taux acceptation/refus, top entreprises)
- [ ] Graphique évolution 7/30 jours

### Utilisateurs
- [ ] `app/admin/utilisateurs/[id]/page.tsx` - Page détail dédiée
- [ ] `GET /api/admin/users/[id]` - Détail complet
- [ ] `POST /api/admin/users/[id]/reset-password` - Envoyer lien reset
- [ ] Notification automatique à la validation ambulancier

### Entreprises
- [ ] `app/admin/entreprises/[id]/page.tsx` - Page détail avec employés, stats, galerie

### Transports
- [ ] `GET /api/admin/transports/stats` - Statistiques globales

### Notifications
- [ ] Page admin pour voir les notifications envoyées (déjà fait via logs)
- [ ] `POST /api/admin/notifications/[id]/retry` - Renvoyer (optionnel)
- [ ] `GET /api/admin/notifications/export` - Export CSV (optionnel)

### Configuration
- [ ] `app/admin/configuration/page.tsx` - Paramètres généraux, maintenance mode
- [ ] Édition des templates email/SMS (optionnel, avancé)
- [ ] Feature flags (inscriptions, réservations, SMS)

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
