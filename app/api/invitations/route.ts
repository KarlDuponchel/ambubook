import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { requireAuth, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/invitations - Liste les invitations de la company de l'utilisateur
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

    if (!user.companyId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas associé à une société" },
        { status: 400 }
      );
    }

    const invitations = await prisma.invitation.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/invitations - Crée une nouvelle invitation
 */
export async function POST() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

    if (!user.companyId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas associé à une société" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true },
    });

    // Générer un code unique
    let code = generateInviteCode();
    let codeExists = await prisma.invitation.findUnique({ where: { code } });

    while (codeExists) {
      code = generateInviteCode();
      codeExists = await prisma.invitation.findUnique({ where: { code } });
    }

    // Créer l'invitation (valide 7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        code,
        companyId: user.companyId,
        createdById: user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      ...invitation,
      companyName: company?.name,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'invitation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
