import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/companies/me/time-off/[id]
 * Supprimer un congé (owner seulement)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  if (company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut gérer les congés" },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Vérifier que le congé existe et appartient à cette entreprise
  const timeOff = await prisma.companyTimeOff.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
  });

  if (!timeOff) {
    return NextResponse.json({ error: "Congé non trouvé" }, { status: 404 });
  }

  // Supprimer le congé
  await prisma.companyTimeOff.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
