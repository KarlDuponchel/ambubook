# Lessons Learned - AmbuBook

Ce fichier documente les erreurs rencontrées et les solutions apportées durant le développement.

---

## Format d'entrée

```
### [Date] - Titre du problème
**Contexte** : Description de la situation
**Erreur** : Message d'erreur ou comportement inattendu
**Cause** : Raison du problème
**Solution** : Comment le problème a été résolu
**Prévention** : Comment éviter ce problème à l'avenir
```

---

## Entrées

### [2026-02-11] - PrismaClient requires adapter in Prisma 7
**Contexte** : Configuration du seed avec Prisma 7 et PostgreSQL
**Erreur** : `PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`
**Cause** : Prisma 7 avec `provider = "prisma-client"` nécessite l'utilisation d'un adapter (ex: `@prisma/adapter-pg`)
**Solution** :
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```
**Prévention** : Toujours suivre le quickstart officiel : https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

---

### [2026-02-11] - Hash mot de passe incompatible avec Better Auth
**Contexte** : Seed créant des utilisateurs avec mots de passe
**Erreur** : "Invalid email or password" à la connexion
**Cause** : Le hash scrypt utilisé dans le seed n'avait pas les mêmes paramètres que Better Auth (N=16384, r=16, p=1, dkLen=64)
**Solution** :
```typescript
import { scrypt } from "@noble/hashes/scrypt.js";
import { bytesToHex } from "@noble/hashes/utils.js";

const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
const saltBytes = crypto.getRandomValues(new Uint8Array(16));
const salt = bytesToHex(saltBytes);
const key = scrypt(password.normalize("NFKC"), salt, config);
return `${salt}:${bytesToHex(key)}`;
```
**Prévention** : Utiliser `@noble/hashes/scrypt.js` avec les paramètres exacts de Better Auth

---

### [2026-02-16] - SEO obligatoire sur les pages front office
**Contexte** : Création de pages publiques (landing, recherche, page entreprise)
**Règle** : Toujours penser référencement SEO sur les pages front office (non dashboard/admin)
**Checklist SEO** :
1. **Metadata dynamiques** : Utiliser `generateMetadata()` pour title, description, OpenGraph, Twitter Cards
2. **Balises sémantiques** : Utiliser h1, h2, article, section, nav correctement
3. **Schema.org** : Ajouter le balisage JSON-LD approprié (FAQPage, LocalBusiness, Organization...)
4. **Images** : Alt text descriptif, next/image avec priority pour LCP
5. **URLs propres** : Slugs lisibles, pas d'IDs cryptiques
6. **Performance** : Server Components quand possible, lazy loading
**Structure recommandée** :
```typescript
// Page Server Component avec metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params);
  return {
    title: `${data.name} | MonSite`,
    description: data.description,
    openGraph: { ... },
  };
}

// Composant client séparé pour l'interactivité
export default async function Page({ params }) {
  const data = await fetchData(params);
  return <ClientComponent data={data} />;
}
```
**Prévention** : Avant de créer une page publique, toujours se poser la question "Comment Google va-t-il indexer cette page ?"

---

### [2026-07-19] - Rate limit de connexion trop restrictif (UX)
**Contexte** : Configuration du rate limiting Better Auth sur `/sign-in/email` dans `lib/auth.ts`
**Erreur** : "Too many requests. Please try again later." après quelques échecs de connexion, blocage ressenti dès la 3e tentative
**Cause** : Fenêtre trop longue (`window: 300` = 5 min) avec `max: 5`. Le compteur est par IP et ne se réinitialise pas après une connexion réussie, donc les tentatives s'accumulent et le blocage dure jusqu'à 5 minutes. En dev local, tous les comptes de test partagent la même IP, ce qui aggrave le ressenti.
**Solution** : Réduire la fenêtre pour un déblocage rapide tout en gardant la protection anti-brute-force :
```typescript
"/sign-in/email": {
  window: 60, // 1 minute (déblocage rapide)
  max: 10,
},
```
Et traduire le message d'erreur 429 (Better Auth le renvoie en anglais) côté client en testant `result.error.status === 429`.
**Prévention** : Pour un rate limit orienté anti-brute-force, préférer une fenêtre COURTE (déblocage rapide) plutôt qu'un `max` bas sur une fenêtre longue. Toujours traduire les messages 429 de Better Auth. Se souvenir que la limite est par IP (attention au partage d'IP : réseau d'entreprise, hôpital, NAT).

---

### [2026-07-19] - `autoSignInAfterVerification` contourne le contrôle `isActive`
**Contexte** : Activation de `requireEmailVerification` + `autoSignInAfterVerification` dans `lib/auth.ts`
**Erreur** : Un ambulancier « nouvelle société » (créé avec `isActive=false`, en attente de validation admin) accédait à l'onboarding juste après avoir validé son email.
**Cause** : Le seul garde-fou `isActive` était côté client sur la page de connexion (`check-status` → `signOut`). Le middleware `proxy.ts` ne vérifiait QUE session + rôle, pas `isActive`. Avec l'auto-connexion après vérification email, l'utilisateur obtenait une session sans passer par la page de connexion, contournant le garde-fou.
**Solution** : Contrôle `isActive` déplacé/ajouté dans le middleware (barrière serveur) : `AMBULANCIER` + `isActive === false` → redirection vers `/dashboard/connexion?pending=1` (+ bannière et `signOut` de la session résiduelle).
**Prévention** : Les contrôles d'accès (auth, rôle, statut de compte) doivent être appliqués côté SERVEUR (middleware/route), jamais uniquement côté client. Un check client-side sur la page de connexion ne protège pas la navigation directe ni les sessions obtenues autrement (auto sign-in, OAuth, etc.).

### [2026-07-23] - Carrousels mobiles trop larges, collés aux bords (refonte landing)
**Contexte** : Refonte visuelle des sections « Nos services » (ServicesSection) et « Pourquoi nous choisir » (Reassurance) : carrousel horizontal `flex overflow-x-auto snap` sur mobile, grille/liste sur desktop.
**Erreur** : En mobile, les cartes débordaient largement de l'écran (~1131px sur 390px, texte non wrappé) et la première carte était collée au bord gauche sans padding. Le titre/paragraphe de Reassurance étaient aussi coupés à droite.
**Cause** : Trois pièges CSS distincts :
1. `min-w-[82%]` sur des items `shrink-0` ne fixe qu'un MINIMUM. Sans largeur/`flex-basis` définie, l'item prend sa taille `max-content` (le texte ne peut pas wrapper) → carte géante.
2. Le carrousel de Reassurance est imbriqué dans un `grid`. Un item de grille a `min-width: auto` par défaut → la piste s'élargit à la taille `min-content` du contenu, étirant la colonne au-delà du viewport (masqué par `overflow-hidden` de la section).
3. `snap-mandatory` aligne le bord du premier item sur le bord du scrollport, en défilant PAR-DESSUS le `padding-left` → première carte collée au bord.
**Solution** :
1. Remplacer `min-w-[X%]` par une largeur définie `w-[X%]` (+ reset `md:w-auto`/`lg:w-auto`), qui agit comme flex-basis et donne une boîte finie où le texte wrappe.
2. Ajouter `min-w-0` sur la cellule de grille contenant le carrousel.
3. Ajouter `scroll-pl-4` (= au `px-4` du carrousel, + reset `md:scroll-pl-0`) pour que le snap respecte le padding.
**Prévention** : Pour un carrousel flex : utiliser `w-[X%]` et non `min-w-[X%]` sur les items `shrink-0`. Ajouter `min-w-0` à tout parent flex/grid d'un scroller pour éviter l'expansion `min-content`. Toujours accompagner `snap-mandatory` + padding interne d'un `scroll-p*` correspondant. Vérifier visuellement en viewport réel (Playwright + mesure `scrollWidth` vs `clientWidth`), pas seulement à l'analyse statique.

### [2026-07-23] - Refonte visuelle espace patient/auth + mode sombre
**Contexte** : Migration de l'espace patient (mon-compte, profil, paramètres, mes-transports liste+détail), du suivi public et de l'auth patient depuis l'ancien système "Medical Trust Blue" (primary-*/neutral-*) vers le système éditorial de la landing (tokens ink/brand/teal/surface/line + .serif), avec ajout d'un mode sombre complet.
**Points clés / pièges** :
- **Composants ui partagés** : `components/ui/*` (Button, Card, Modal, StatusBadge…) sont utilisés par le dashboard pro ET l'admin. Ne PAS les migrer globalement (régressions hors périmètre). À la place, restyler les pages front-office en markup éditorial inline (comme la landing) et n'adapter que les composants réellement front-facing (`notifications/*`, `demandes/*`) en préservant leurs variantes/contextes.
- **Mode sombre FOUC** : la classe `.dark`/`.light` doit être posée sur `<html>` AVANT le 1er paint via un script inline synchrone dans `<head>` (app/layout.tsx), aligné avec le `ThemeProvider` (localStorage + prefers-color-scheme). Sans ça, flash de thème au chargement. `<html>` ne doit plus figer `light`.
- **Tokens theme-aware = dark gratuit** : en utilisant systématiquement les utilitaires sémantiques (text-ink, bg-surface, border-line, bg-brand, text-vert/ambre/rouge/violet…), les deux thèmes fonctionnent sans styles dédiés. Pour les teintes de statut avec fond léger : `color-mix(in srgb, var(--token) 13%, var(--surface))` (inline style) ou opacité `/10`.
- **Vérification** : pages publiques (auth, suivi) testées via Playwright en clair ET sombre, viewports 390/900/1280, `scrollWidth == clientWidth`. Pages authentifiées (redirigées 307 sans session, pas de compte CUSTOMER dans le seed) validées par compilation (pas de 500), diagnostics TS vides, et réutilisation des mêmes primitives éditoriales déjà validées. Prévoir un compte de test CUSTOMER vérifié pour un futur passage visuel complet.
**Prévention** : Pour toute refonte transverse, cartographier d'abord quels composants sont partagés entre espaces (front/dashboard/admin) avant de décider migration vs restylage inline. Toujours livrer le mode sombre via tokens sémantiques + script anti-FOUC.

### [2026-07-23] - Extension refonte : recherche, page ambulance, module de réservation
**Contexte** : Suite de la refonte éditoriale — /recherche (+ ses composants + `components/ui/Autocomplete`), page publique `/[slug]` (CompanyPageClient), et module de réservation `components/booking/*` (modale + 4 étapes).
**Points clés** :
- **Champs de formulaire partagés (Input/Checkbox/Textarea)** : plutôt que de les migrer (utilisés partout), créer un petit kit local `components/booking/fields.tsx` (`Field`, `FieldArea`, `CheckRow`) en tokens éditoriaux, et l'utiliser dans les étapes. Zéro impact sur les autres espaces.
- **Autocomplete** : composant `ui/` mais front-facing uniquement (Hero + SearchBar) → OK de le restyler (vérifier le périmètre d'usage avec un grep avant).
- **Backdrop de modale theme-safe** : utiliser `bg-black/50` (et non `bg-ink/40`, qui devient un voile clair en mode sombre car `--ink` s'inverse). Vaut pour BookingModal et ChangePasswordModal.
- **Case à cocher peer** : le SVG de coche n'est pas frère de l'input → utiliser la variante arbitraire `peer-checked:[&>svg]:opacity-100` sur la boîte (sibling de l'input) pour révéler la coche.
- **Parallélisation** : /recherche et /[slug] délégués à des forks (héritant du contexte : cheatsheet tokens + patterns), pendant le traitement du booking en direct. Vérif Playwright clair+sombre 390/1280 → overflow=0 partout.

### [2026-08-02] - Build Docker : découpler build et secrets/DB (mise en prod)
**Contexte** : Premier build de l'image Docker de prod (`docker build --platform linux/amd64`). Le build local Windows marchait (avec `.env` complet) mais le build Docker, lui, n'a **aucune** variable d'env.
**Erreurs successives** :
1. `prisma generate` → `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL` : `prisma.config.ts` fait `env('DATABASE_URL')` qui **throw si absent** au chargement.
2. `next build` → `Failed to collect page data for /api/ambulancier/demandes` : à la collecte des routes, Next évalue les modules. `betterAuth({...})` (lib/auth.ts) s'exécute au chargement et, en `NODE_ENV=production` (mis par `next build`), **throw si `BETTER_AUTH_SECRET` absent** ; le provider Google valide `GOOGLE_CLIENT_ID/SECRET` ; `new Resend(...)` (lib/email.ts) se construit au chargement.
3. (potentiel) pages statiques interrogeant la DB au build : `sitemap.ts`, `plan-du-site`, `ambulances/[ville]`, `region/[region]` (via `generateStaticParams` → prerender → `prisma.company.findMany`).
**Cause racine** : des clients (auth, Resend) sont instanciés **au chargement des modules**, et des pages lisent la DB **au build**. Le build devient impossible sans tous les secrets + une DB joignable → non CI-friendly.
**Solution** :
- `Dockerfile` (stage `builder` uniquement) : placeholders `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `RESEND_API_KEY`. Le stage `runner` repart de `base` → **ne les hérite pas** → aucun secret dans l'image. Côté serveur, `process.env` est lu **au runtime** (jamais inliné, sauf `NEXT_PUBLIC_*`) → Scaleway injecte les vraies valeurs.
- `export const dynamic = "force-dynamic"` sur les 4 fichiers qui lisent la DB → rendus à la requête, plus au build (bonus : sitemap/plan reflètent les entreprises en temps réel).
**Vérif** : build exit 0, image 347 MB, smoke test `docker run` → landing `/` = **200**, dégradation propre si DB injoignable (`siteConfig` catché).
**Prévention** : ne jamais instancier de client tiers (auth, SDK email/SMS/S3) au top-level d'un module sans placeholder de build OU instanciation paresseuse. Toute page publique lisant la DB doit être `force-dynamic` (ou ISR avec DB dispo au build). Un build d'image ne doit exiger **ni secret réel ni DB**.

### [2026-08-02] - TLS base managée : le moteur de migration passe, le client Prisma échoue
**Contexte** : Connexion à une **Managed PostgreSQL Scaleway** (certificat **auto-signé**) via `@prisma/adapter-pg` (Prisma 7). URL en `?sslmode=require`.
**Erreurs** :
1. `permission denied for database "ambubook" — User does not have CONNECT privilege` : créer un user Scaleway ne donne PAS accès aux bases → assigner les permissions (console → Permissions → All) au couple user/base.
2. `prisma migrate deploy` **passe** mais le **client** au runtime → `Error opening a TLS connection: self-signed certificate` (`P1011 / TlsConnectionError`).
**Cause** : deux chemins TLS distincts. Le moteur de migration (Rust) lit `sslmode=require` et chiffre sans vérifier la chaîne. Le **client node-postgres**, lui, re-parse `sslmode` depuis la connection string et son interprétation **écrase** tout objet `ssl` passé explicitement → il tente de vérifier le certificat auto-signé et le rejette.
**Solution** (dans `lib/prisma.ts`, source unique de connexion) :
- Si `sslmode` présent : **retirer `sslmode` de l'URL** passée au client (`new URL(...).searchParams.delete('sslmode')`) et piloter le TLS **uniquement** via l'objet `ssl`.
- `ssl: { ca: <CA>, rejectUnauthorized: true }` si `DATABASE_CA_CERT_PATH` fourni (prod/HDS) ; sinon `ssl: { rejectUnauthorized: false }` (staging).
- Faire pointer **tous** les scripts (`scripts/create-admin.ts`, etc.) sur `lib/prisma` au lieu de reconstruire un `PrismaPg` local, sinon le correctif est contourné.
**Prévention** : une base managée à certificat auto-signé impose une config SSL **côté client** distincte de `sslmode` dans l'URL. Le succès de `migrate deploy` ne garantit **pas** que le client runtime se connectera. Centraliser la construction du client Prisma (une seule instance partagée) pour que tout correctif de connexion s'applique partout. Pour l'HDS, préférer la vérification de chaîne via la CA de l'hébergeur (`rejectUnauthorized: true` + `ca`).
