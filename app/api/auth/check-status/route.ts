import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Vérifie si l'utilisateur est connecté et retourne ses informations
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        isLoggedIn: false,
        isActive: false,
        error: "Non connecté",
      });
    }

    // Récupérer l'utilisateur avec ses infos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        isActive: false,
        error: "Utilisateur non trouvé",
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      isActive: user.isActive,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error);
    return NextResponse.json({
      isLoggedIn: false,
      isActive: false,
      error: "Erreur serveur",
    }, { status: 500 });
  }
}
