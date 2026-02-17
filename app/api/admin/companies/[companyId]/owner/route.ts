import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

const setOwnerSchema = z.object({
  ownerId: z.string().min(1, "L'ID de l'utilisateur est requis"),
});

/**
 * PATCH /api/admin/companies/[companyId]/owner - Définir le gérant d'une société
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { companyId } = await params;

  // Vérifier que la société existe
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Société non trouvée" },
      { status: 404 }
    );
  }

  // Valider les données
  const body = await request.json();
  const validation = setOwnerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const { ownerId } = validation.data;

  // Vérifier que l'utilisateur existe et appartient à cette société
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }

  if (user.companyId !== companyId) {
    return NextResponse.json(
      { error: "L'utilisateur n'appartient pas à cette société" },
      { status: 400 }
    );
  }

  // Mettre à jour le gérant de la société
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { ownerId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: `${user.name} est maintenant le gérant de ${company.name}`,
    company: updatedCompany,
  });
}

/**
 * DELETE /api/admin/companies/[companyId]/owner - Retirer le gérant d'une société
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { companyId } = await params;

  // Vérifier que la société existe
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Société non trouvée" },
      { status: 404 }
    );
  }

  // Retirer le gérant
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { ownerId: null },
  });

  return NextResponse.json({
    success: true,
    message: `Le gérant de ${company.name} a été retiré`,
    company: updatedCompany,
  });
}
