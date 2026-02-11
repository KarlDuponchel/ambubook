import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Seed de la base de données
 *
 * Crée :
 * - 1 société d'ambulance (Ambulances Dupont)
 * - 1 utilisateur admin
 * - 1 utilisateur ambulancier rattaché à la société
 *
 * Les mots de passe sont hashés avec bcrypt (format Better Auth)
 */
async function main() {
  console.log("Seeding database...");

  // 1. Créer la société d'ambulance
  const company = await prisma.company.upsert({
    where: { slug: "ambulances-dupont" },
    update: {},
    create: {
      name: "Ambulances Dupont",
      slug: "ambulances-dupont",
      address: "12 rue de la Santé",
      city: "Paris",
      postalCode: "75013",
      phone: "01 23 45 67 89",
      email: "contact@ambulances-dupont.fr",
      siret: "12345678901234",
      isActive: true,
    },
  });
  console.log(`✓ Société créée: ${company.name} (slug: ${company.slug})`);

  // 2. Créer l'utilisateur admin
  // Note: Le mot de passe sera géré par Better Auth lors de la connexion
  const admin = await prisma.user.upsert({
    where: { email: "admin@ambubook.fr" },
    update: {},
    create: {
      email: "admin@ambubook.fr",
      name: "Administrateur",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`✓ Admin créé: ${admin.email}`);

  // Créer le compte avec mot de passe pour l'admin
  // Le hash est généré avec bcrypt (compatible Better Auth)
  // Mot de passe: "admin123"
  const adminPasswordHash = await hashPassword("admin123");
  await prisma.account.upsert({
    where: {
      id: `credential-${admin.id}`,
    },
    update: {
      password: adminPasswordHash,
    },
    create: {
      id: `credential-${admin.id}`,
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password: adminPasswordHash,
    },
  });
  console.log(`✓ Compte admin configuré (mot de passe: admin123)`);

  // 3. Créer l'utilisateur ambulancier
  const ambulancier = await prisma.user.upsert({
    where: { email: "ambulancier@ambulances-dupont.fr" },
    update: {},
    create: {
      email: "ambulancier@ambulances-dupont.fr",
      name: "Jean Dupont",
      phone: "06 12 34 56 78",
      role: "AMBULANCIER",
      emailVerified: true,
      companyId: company.id,
    },
  });
  console.log(`✓ Ambulancier créé: ${ambulancier.email}`);

  // Créer le compte avec mot de passe pour l'ambulancier
  // Mot de passe: "ambulancier123"
  const ambulancierPasswordHash = await hashPassword("ambulancier123");
  await prisma.account.upsert({
    where: {
      id: `credential-${ambulancier.id}`,
    },
    update: {
      password: ambulancierPasswordHash,
    },
    create: {
      id: `credential-${ambulancier.id}`,
      userId: ambulancier.id,
      accountId: ambulancier.id,
      providerId: "credential",
      password: ambulancierPasswordHash,
    },
  });
  console.log(`✓ Compte ambulancier configuré (mot de passe: ambulancier123)`);

  console.log("\n✅ Seed terminé !");
  console.log("\nComptes de test :");
  console.log("  Admin:       admin@ambubook.fr / admin123");
  console.log("  Ambulancier: ambulancier@ambulances-dupont.fr / ambulancier123");
}

/**
 * Hash un mot de passe avec scrypt (compatible Better Auth)
 * Utilise exactement les mêmes paramètres que Better Auth
 */
async function hashPassword(password: string): Promise<string> {
  const { scrypt } = await import("@noble/hashes/scrypt.js");
  const { bytesToHex } = await import("@noble/hashes/utils.js");

  // Paramètres identiques à Better Auth
  const config = { N: 16384, r: 16, p: 1, dkLen: 64 };

  // Générer un salt aléatoire de 16 bytes
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);

  // Hasher le mot de passe
  const key = scrypt(password.normalize("NFKC"), salt, config);

  return `${salt}:${bytesToHex(key)}`;
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
