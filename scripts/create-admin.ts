import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Bootstrap du premier administrateur (production).
 *
 * Contrairement à `prisma/seed.ts` (données de démo, mot de passe faible),
 * ce script ne crée QUE l'admin, sans aucune donnée fictive.
 *
 * Utilisation :
 *   ADMIN_EMAIL=admin@exemple.fr ADMIN_PASSWORD='MotDePasseFort123' npx tsx scripts/create-admin.ts
 *
 * Si ADMIN_PASSWORD n'est pas fourni, un mot de passe fort est généré et
 * affiché une seule fois. Le script est idempotent (upsert sur l'email).
 */

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MIN_PASSWORD_LENGTH = 12;

/** Un mot de passe est considéré fort : >= 12 caractères, majuscule, minuscule, chiffre */
function isStrongPassword(pwd: string): boolean {
  return (
    pwd.length >= MIN_PASSWORD_LENGTH &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /[0-9]/.test(pwd)
  );
}

/** Génère un mot de passe aléatoire fort */
function generateStrongPassword(length = 20): string {
  const charset =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset[bytes[i] % charset.length];
  }
  // Régénère si la complexité minimale n'est pas atteinte
  return isStrongPassword(out) ? out : generateStrongPassword(length);
}

/** Hash un mot de passe avec scrypt (mêmes paramètres que Better Auth) */
async function hashPassword(password: string): Promise<string> {
  const { scrypt } = await import("@noble/hashes/scrypt.js");
  const { bytesToHex } = await import("@noble/hashes/utils.js");

  const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);
  const key = scrypt(password.normalize("NFKC"), salt, config);

  return `${salt}:${bytesToHex(key)}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email) {
    console.error("❌ ADMIN_EMAIL non défini. Abandon.");
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  let generated = false;

  if (!password) {
    password = generateStrongPassword();
    generated = true;
  } else if (!isStrongPassword(password)) {
    console.error(
      `❌ ADMIN_PASSWORD trop faible : au moins ${MIN_PASSWORD_LENGTH} caractères, avec majuscule, minuscule et chiffre.`
    );
    process.exit(1);
  }

  const name = process.env.ADMIN_NAME?.trim() || "Administrateur";

  // Créer / promouvoir l'utilisateur admin
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", emailVerified: true, isActive: true },
    create: {
      email,
      name,
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });

  // Créer / mettre à jour le compte credential (mot de passe)
  const passwordHash = await hashPassword(password);
  await prisma.account.upsert({
    where: { id: `credential-${admin.id}` },
    update: { password: passwordHash },
    create: {
      id: `credential-${admin.id}`,
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password: passwordHash,
    },
  });

  console.log(`✅ Administrateur prêt : ${email}`);
  if (generated) {
    console.log("\n⚠️  Mot de passe généré (affiché une seule fois) :");
    console.log(`    ${password}`);
    console.log(
      "    Notez-le immédiatement, puis connectez-vous pour le modifier.\n"
    );
  }
}

main()
  .catch((e) => {
    console.error("Erreur lors de la création de l'admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
