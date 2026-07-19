/**
 * Validateurs de format réutilisables (client + serveur).
 * Fonctions pures, sans dépendance — utilisables dans les composants "use client".
 */

/** Téléphone français (mobile ou fixe), tolère espaces/points/tirets */
export const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export function isValidFrenchPhone(value: string): boolean {
  return PHONE_REGEX.test(value.replace(/\s/g, ""));
}

/** SIRET : 14 chiffres (espaces tolérés) */
export function isValidSiret(value: string): boolean {
  return /^\d{14}$/.test(value.replace(/\s/g, ""));
}

/**
 * N° d'agrément ARS : il n'existe pas de format national strict (variable
 * selon les régions). On valide donc un format souple : 5 à 30 caractères,
 * lettres/chiffres et séparateurs ( - / . espace), bornes alphanumériques.
 */
export function isValidArsLicense(value: string): boolean {
  const v = value.trim();
  return /^[A-Za-z0-9][A-Za-z0-9\s\-/.]{3,28}[A-Za-z0-9]$/.test(v);
}

/**
 * NIR (numéro de sécurité sociale) : 13 chiffres, avec clé de 2 chiffres
 * optionnelle (15 au total). Espaces tolérés.
 */
export function isValidNir(value: string): boolean {
  return /^\d{13}(\d{2})?$/.test(value.replace(/\s/g, ""));
}
