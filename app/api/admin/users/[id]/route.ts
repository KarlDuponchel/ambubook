import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { notifyUserAccountActivated } from "@/lib/email";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "AMBULANCIER"]).optional(),
  isActive: z.boolean().optional(),
  companyId: z.string().optional().nullable(),
});

/**
 * GET /api/admin/users/[id] - Récupère un utilisateur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json(user);
}

/**
 * PATCH /api/admin/users/[id] - Modifie un utilisateur
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const body = await request.json();

  const validation = updateUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  // Récupérer l'utilisateur avant modification pour comparer isActive
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true, name: true, email: true },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: validation.data,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Si le compte vient d'être activé, envoyer un email
  if (!existingUser.isActive && validation.data.isActive === true) {
    notifyUserAccountActivated({
      userName: existingUser.name,
      userEmail: existingUser.email,
    }).catch((err) => {
      console.error("Erreur envoi email activation:", err);
    });
  }

  return NextResponse.json(user);
}

/**
 * DELETE /api/admin/users/[id] - Supprime un utilisateur
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Empêcher la suppression de son propre compte
  if (user.id === authResult.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte" },
      { status: 400 }
    );
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
