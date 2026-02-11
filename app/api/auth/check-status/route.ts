import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Vérifie si le compte de l'utilisateur connecté est actif
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ isActive: false, error: "Non connecté" }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son statut et rôle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isActive: true, role: true },
    });

    return NextResponse.json({
      isActive: user?.isActive ?? false,
      role: user?.role ?? "AMBULANCIER",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error);
    return NextResponse.json({ isActive: false, error: "Erreur serveur" }, { status: 500 });
  }
}
