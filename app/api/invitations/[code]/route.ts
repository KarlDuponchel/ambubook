import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/invitations/[code] - Vérifie si un code d'invitation est valide (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: "Code d'invitation invalide" },
        { status: 404 }
      );
    }

    // Vérifier si déjà utilisé
    if (invitation.usedAt) {
      return NextResponse.json(
        { valid: false, error: "Ce code a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Vérifier si expiré
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "Ce code a expiré" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      companyId: invitation.company.id,
      companyName: invitation.company.name,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du code:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/invitations/[code] - Supprime une invitation (authentifié + même company)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const { code } = await params;

    // Vérifier que l'invitation existe et appartient à la même company
    const invitation = await prisma.invitation.findUnique({
      where: { code: code.toUpperCase() },
      select: { companyId: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
    }

    if (invitation.companyId !== user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    await prisma.invitation.delete({
      where: { code: code.toUpperCase() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
