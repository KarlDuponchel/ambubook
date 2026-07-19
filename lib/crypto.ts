import crypto from "node:crypto";

/**
 * Chiffrement applicatif de champs sensibles (AES-256-GCM).
 *
 * Utilisé pour le numéro de sécurité sociale (identifiant national).
 * La clé provient de la variable d'environnement ENCRYPTION_KEY
 * (32 octets encodés en base64 — générer avec `openssl rand -base64 32`).
 *
 * Format stocké : "enc:v1:" + base64(iv[12] + authTag[16] + ciphertext)
 * Les valeurs sans ce préfixe sont considérées déjà en clair (rétro-compat).
 */

const PREFIX = "enc:v1:";
const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY manquante : requise pour chiffrer les données sensibles (openssl rand -base64 32)."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY invalide : 32 octets attendus (générer avec `openssl rand -base64 32`)."
    );
  }
  return key;
}

/** Indique si une valeur est déjà chiffrée par cette fonction */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

/** Chiffre une valeur. Retourne null pour une valeur vide/absente. */
export function encryptField(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  // Évite un double chiffrement si la valeur l'est déjà
  if (isEncrypted(value)) return value;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64");
  return `${PREFIX}${payload}`;
}

/**
 * Déchiffre une valeur. Retourne null pour une valeur vide/absente.
 * Une valeur non préfixée (donnée en clair antérieure au chiffrement) est
 * renvoyée telle quelle.
 */
export function decryptField(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!isEncrypted(value)) return value;

  const key = getKey();
  const payload = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
