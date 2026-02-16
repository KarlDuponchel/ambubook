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
