import { prisma } from "@/lib/prisma";
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from "@/lib/s3";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (authResult.user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPEG, PNG ou WebP." }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Le fichier dépasse la taille maximale de 5 Mo." }, { status: 400 });
    }

    const userId = authResult.user.id;

    // Supprimer l'ancienne image si elle existe dans S3
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (existingUser?.image && existingUser.image.startsWith("users/")) {
      try {
        await deleteFromS3(existingUser.image);
      } catch {
        // Suppression silencieuse — l'upload continue même si la suppression échoue
      }
    }

    // Générer la clé S3
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `users/${userId}/avatar/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

    // Upload vers S3
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(fileKey, fileBuffer, file.type);

    // Mettre à jour la DB
    await prisma.user.update({
      where: { id: userId },
      data: { image: fileKey },
    });

    const imageUrl = await getSignedDownloadUrl(fileKey);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erreur API POST /api/ambulancier/me/image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (authResult.user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const userId = authResult.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (user?.image && user.image.startsWith("users/")) {
      try {
        await deleteFromS3(user.image);
      } catch {
        // Suppression silencieuse
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API DELETE /api/ambulancier/me/image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
