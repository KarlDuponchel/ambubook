import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Génère une clé unique pour un fichier photo
 */
function generatePhotoKey(companyId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `companies/${companyId}/photos/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
}

/**
 * POST /api/companies/me/photos
 * Upload une nouvelle photo pour la galerie
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
    select: { ownerId: true },
  });

  if (!company || company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut ajouter des photos" },
      { status: 403 }
    );
  }

  // Récupérer le fichier depuis FormData
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
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

  // Générer la clé S3
  const fileKey = generatePhotoKey(user.companyId, file.name);

  // Upload vers S3
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToS3(fileKey, buffer, file.type);

  // Obtenir l'ordre max actuel
  const maxOrder = await prisma.companyPhoto.aggregate({
    where: { companyId: user.companyId },
    _max: { order: true },
  });

  const newOrder = (maxOrder._max.order ?? -1) + 1;

  // Créer l'entrée en BDD
  const photo = await prisma.companyPhoto.create({
    data: {
      companyId: user.companyId,
      fileKey,
      url: fileKey, // On stocke la clé, l'URL signée sera générée à la lecture
      caption: caption || null,
      order: newOrder,
    },
  });

  // Générer l'URL signée pour la réponse
  const signedUrl = await getSignedDownloadUrl(fileKey);

  return NextResponse.json({
    ...photo,
    url: signedUrl,
  }, { status: 201 });
}

/**
 * DELETE /api/companies/me/photos?id=xxx
 * Supprime une photo de la galerie
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
    select: { ownerId: true },
  });

  if (!company || company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut supprimer des photos" },
      { status: 403 }
    );
  }

  // Récupérer l'ID de la photo
  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("id");

  if (!photoId) {
    return NextResponse.json({ error: "ID de photo requis" }, { status: 400 });
  }

  // Vérifier que la photo appartient à cette entreprise
  const photo = await prisma.companyPhoto.findFirst({
    where: {
      id: photoId,
      companyId: user.companyId,
    },
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo non trouvée" }, { status: 404 });
  }

  // Supprimer de S3
  try {
    await deleteFromS3(photo.fileKey);
  } catch (error) {
    console.error("Erreur lors de la suppression S3:", error);
    // On continue quand même pour supprimer l'entrée BDD
  }

  // Supprimer de la BDD
  await prisma.companyPhoto.delete({
    where: { id: photoId },
  });

  return NextResponse.json({ success: true });
}
