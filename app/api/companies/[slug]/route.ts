import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/companies/[slug]
 * Récupère une company par son slug (pour le lien partagé)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Société non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Erreur récupération company:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
