import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            onboardingStep: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Déterminer si l'utilisateur est owner de son entreprise
    const isOwner = user.company?.ownerId === user.id;

    // Générer l'URL signée si l'image est stockée dans S3
    let imageUrl: string | null = null;
    if (user.image && user.image.startsWith("users/")) {
      imageUrl = await getSignedDownloadUrl(user.image);
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      imageUrl,
      isOwner,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            onboardingStep: user.company.onboardingStep,
          }
        : null,
    });
  } catch (error) {
    console.error("Erreur API /api/ambulancier/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json() as { name?: string; phone?: string };

    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API PATCH /api/ambulancier/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
