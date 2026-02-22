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
      select: {
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            hasAmbulance: true,
            hasVSL: true,
          },
        },
      },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId || !user.company) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({
      company: user.company,
    });
  } catch (error) {
    console.error("Erreur API /api/ambulancier/company:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
