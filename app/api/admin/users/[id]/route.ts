import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { notifyAccountActivated } from "@/lib/notifications";
import { anonymizeUser } from "@/lib/user-anonymization";
import { AuditHelpers, extractRequestInfo } from "@/lib/audit-log";

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
    select: { isActive: true, name: true, email: true, phone: true, role: true },
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

  const reqHeaders = await headers();
  const { ipAddress } = extractRequestInfo(reqHeaders);

  // Logger les actions
  if (!existingUser.isActive && validation.data.isActive === true) {
    // Compte activé
    AuditHelpers.userActivated(authResult.user.id, id, existingUser.name, ipAddress);
    notifyAccountActivated({
      userName: existingUser.name,
      userEmail: existingUser.email,
      userPhone: existingUser.phone || undefined,
      userId: id,
    }).catch((err) => {
      console.error("Erreur notification activation compte:", err);
    });
  } else if (existingUser.isActive && validation.data.isActive === false) {
    // Compte désactivé
    AuditHelpers.userDeactivated(authResult.user.id, id, existingUser.name, ipAddress);
  } else if (validation.data.role && validation.data.role !== existingUser.role) {
    // Rôle modifié
    AuditHelpers.userRoleChanged(authResult.user.id, id, existingUser.role, validation.data.role, ipAddress);
  } else {
    // Modification générale
    AuditHelpers.userUpdated(authResult.user.id, id, validation.data, ipAddress);
  }

  return NextResponse.json(user);
}

/**
 * DELETE /api/admin/users/[id] - Supprime (anonymise) un utilisateur
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

  // Utiliser l'anonymisation au lieu de la suppression complète
  const result = await anonymizeUser(id);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  // Logger la suppression/anonymisation
  const reqHeaders = await headers();
  const { ipAddress } = extractRequestInfo(reqHeaders);
  AuditHelpers.userDeleted(authResult.user.id, id, user.name, ipAddress);

  return NextResponse.json({ success: true, message: result.message });
}
