/**
 * Détection du type MIME réel d'un fichier via sa signature (magic bytes).
 *
 * Le type déclaré par le client (`file.type`) est falsifiable : on vérifie
 * donc le contenu réel avant tout stockage (défense contre l'upload de
 * fichiers malveillants déguisés en image/PDF).
 */

export type SniffableMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

export function sniffMimeType(buffer: Uint8Array): SniffableMime | null {
  if (buffer.length < 12) return null;

  // JPEG : FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // PDF : 25 50 44 46 2D  ("%PDF-")
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "application/pdf";
  }

  // WebP : "RIFF" (0-3) .... "WEBP" (8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Vérifie que le contenu réel du fichier correspond à l'un des types MIME
 * autorisés (par signature, pas par type déclaré).
 */
export function matchesAllowedSignature(
  buffer: Uint8Array,
  allowedMimes: readonly string[]
): boolean {
  const detected = sniffMimeType(buffer);
  return detected !== null && allowedMimes.includes(detected);
}
