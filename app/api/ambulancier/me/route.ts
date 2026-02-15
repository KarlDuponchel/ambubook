import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isOwner,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Erreur API /api/ambulancier/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
