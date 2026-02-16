import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Génère une clé unique pour logo ou cover
 */
function generateImageKey(companyId: string, type: "logo" | "cover", fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `companies/${companyId}/${type}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
}

/**
 * POST /api/companies/me/images
 * Upload logo ou cover image
 * Body: FormData avec "file" et "type" (logo ou cover)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();

  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 404 });
  }

  // Vérifier que l'utilisateur est le owner
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { ownerId: true, logoUrl: true, coverImageUrl: true },
  });

  if (!company || company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut modifier les images" },
      { status: 403 }
    );
  }

  // Récupérer les données depuis FormData
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const imageType = formData.get("type") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (!imageType || !["logo", "cover"].includes(imageType)) {
    return NextResponse.json(
      { error: "Type d'image invalide. Utilisez 'logo' ou 'cover'." },
      { status: 400 }
    );
  }

  // Validation du type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté. Utilisez JPEG, PNG ou WebP." },
      { status: 400 }
    );
  }

  // Validation de la taille
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Le fichier est trop volumineux (max 5Mo)" },
      { status: 400 }
    );
  }

  // Supprimer l'ancienne image si elle existe
  const oldKey = imageType === "logo" ? company.logoUrl : company.coverImageUrl;
  if (oldKey && oldKey.startsWith("companies/")) {
    try {
      await deleteFromS3(oldKey);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ancienne image:", error);
      // On continue quand même
    }
  }

  // Générer la nouvelle clé S3
  const fileKey = generateImageKey(user.companyId, imageType as "logo" | "cover", file.name);

  // Upload vers S3
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToS3(fileKey, buffer, file.type);

  // Mettre à jour l'entreprise
  const updateData = imageType === "logo"
    ? { logoUrl: fileKey }
    : { coverImageUrl: fileKey };

  await prisma.company.update({
    where: { id: user.companyId },
    data: updateData,
  });

  // Générer l'URL signée pour la réponse
  const signedUrl = await getSignedDownloadUrl(fileKey);

  return NextResponse.json({
    type: imageType,
    fileKey,
    url: signedUrl,
  }, { status: 201 });
}

/**
 * DELETE /api/companies/me/images?type=logo|cover
 * Supprime le logo ou la cover
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();

  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 404 });
  }

  // Vérifier que l'utilisateur est le owner
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { ownerId: true, logoUrl: true, coverImageUrl: true },
  });

  if (!company || company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut supprimer les images" },
      { status: 403 }
    );
  }

  // Récupérer le type d'image
  const { searchParams } = new URL(request.url);
  const imageType = searchParams.get("type");

  if (!imageType || !["logo", "cover"].includes(imageType)) {
    return NextResponse.json(
      { error: "Type d'image invalide. Utilisez 'logo' ou 'cover'." },
      { status: 400 }
    );
  }

  const fileKey = imageType === "logo" ? company.logoUrl : company.coverImageUrl;

  if (!fileKey) {
    return NextResponse.json({ error: "Aucune image à supprimer" }, { status: 404 });
  }

  // Supprimer de S3
  if (fileKey.startsWith("companies/")) {
    try {
      await deleteFromS3(fileKey);
    } catch (error) {
      console.error("Erreur lors de la suppression S3:", error);
    }
  }

  // Mettre à jour l'entreprise
  const updateData = imageType === "logo"
    ? { logoUrl: null }
    : { coverImageUrl: null };

  await prisma.company.update({
    where: { id: user.companyId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
