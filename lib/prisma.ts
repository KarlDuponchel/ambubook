import "dotenv/config";
import fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { decryptField } from "./crypto";

const connectionString = process.env.DATABASE_URL!;

/**
 * Construit l'adapter Postgres avec la bonne configuration SSL.
 *
 * Les bases managées (Scaleway, etc.) exposent souvent un certificat
 * auto-signé. Le moteur de migration Prisma (Rust) se contente de `sslmode`
 * dans l'URL, mais le client node-postgres exige une config SSL explicite —
 * sinon il rejette le certificat auto-signé ("self-signed certificate").
 *
 * - Si `DATABASE_CA_CERT_PATH` pointe vers la CA de l'hébergeur : chaîne
 *   vérifiée (recommandé en production / HDS).
 * - Sinon, en présence de `sslmode` : connexion chiffrée sans vérification de
 *   la chaîne (suffisant en staging).
 * - Sans `sslmode` (dev local) : aucune config SSL (Postgres local en clair).
 */
function buildAdapter(): PrismaPg {
  const sslRequired = /sslmode=(require|prefer|verify-ca|verify-full)/.test(
    connectionString
  );
  if (!sslRequired) {
    return new PrismaPg({ connectionString });
  }

  // On retire `sslmode` de l'URL passée au client : node-postgres re-parse la
  // connection string et son interprétation de `sslmode` écrase l'objet `ssl`
  // explicite. On pilote donc le TLS uniquement via l'objet `ssl` ci-dessous.
  // (Le moteur de migration Prisma, lui, lit l'URL brute avec `sslmode`.)
  let cleanConnectionString = connectionString;
  try {
    const u = new URL(connectionString);
    u.searchParams.delete("sslmode");
    cleanConnectionString = u.toString();
  } catch {
    cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]*/i, "");
  }

  const caPath = process.env.DATABASE_CA_CERT_PATH;
  if (caPath && fs.existsSync(caPath)) {
    return new PrismaPg({
      connectionString: cleanConnectionString,
      ssl: { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true },
    });
  }

  return new PrismaPg({
    connectionString: cleanConnectionString,
    ssl: { rejectUnauthorized: false },
  });
}

const adapter = buildAdapter();

// Déchiffrement transparent du numéro de sécurité sociale à la lecture.
// Le chiffrement à l'écriture est fait explicitement aux points de création
// (via encryptField de lib/crypto).
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    transportRequest: {
      patientSocialSecurityNumber: {
        needs: { patientSocialSecurityNumber: true },
        compute(record) {
          return decryptField(record.patientSocialSecurityNumber);
        },
      },
    },
  },
});