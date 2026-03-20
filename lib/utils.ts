import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne les classes Tailwind de manière intelligente
 * Utilise clsx pour la composition et tailwind-merge pour résoudre les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un slug URL-friendly à partir d'un nom
 * Ex: "Ambulances Dupont & Fils" → "ambulances-dupont-fils"
 */
export function generateSlug(name: string): string {
  return name
    // Supprime les accents (NFD décompose, puis on retire les diacritiques)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Convertit en minuscules
    .toLowerCase()
    // Remplace espaces et underscores par des tirets
    .replace(/[\s_]+/g, "-")
    // Supprime tous les caractères spéciaux (garde lettres, chiffres, tirets)
    .replace(/[^a-z0-9-]/g, "")
    // Supprime les tirets multiples consécutifs
    .replace(/-+/g, "-")
    // Supprime les tirets en début et fin
    .replace(/^-|-$/g, "");
}

/**
 * Génère un code d'invitation aléatoire (6 caractères alphanumériques)
 * Ex: "A3F7K9"
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclus I, O, 0, 1 pour éviter confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Échappe les caractères HTML pour prévenir les injections XSS
 * À utiliser pour toute donnée utilisateur insérée dans du HTML (emails, etc.)
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitize un objet de données en échappant toutes les valeurs string
 * Utile pour les templates de notifications
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = escapeHtml(value);
    }
  }
  return sanitized;
}
