import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { decryptField } from "./crypto";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

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