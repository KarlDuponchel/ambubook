import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { AuditHelpers, extractRequestInfo } from "@/lib/audit-log";

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  hasAmbulance: z.boolean().optional(),
  hasVSL: z.boolean().optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  coverageRadius: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
});

/**
 * GET /api/admin/companies/[companyId] - Détail d'une entreprise
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          users: true,
          transportRequests: true,
        },
      },
    },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Entreprise non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json(company);
}

/**
 * PATCH /api/admin/companies/[companyId] - Modifier une entreprise
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

  // Vérifier que l'entreprise existe
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Entreprise non trouvée" },
      { status: 404 }
    );
  }

  // Valider les données
  const body = await request.json();
  const validation = updateCompanySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  // Mettre à jour l'entreprise
  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: validation.data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          users: true,
          transportRequests: true,
        },
      },
    },
  });

  // Logger l'action
  const reqHeaders = await headers();
  const { ipAddress } = extractRequestInfo(reqHeaders);

  if (!company.isActive && validation.data.isActive === true) {
    AuditHelpers.companyActivated(authResult.user.id, companyId, company.name, ipAddress);
  } else if (company.isActive && validation.data.isActive === false) {
    AuditHelpers.companyDeactivated(authResult.user.id, companyId, company.name, ipAddress);
  } else {
    AuditHelpers.companyUpdated(authResult.user.id, companyId, validation.data);
  }

  return NextResponse.json({
    success: true,
    company: updatedCompany,
  });
}

/**
 * DELETE /api/admin/companies/[companyId] - Supprimer une entreprise
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

  // Vérifier que l'entreprise existe
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: {
          users: true,
          transportRequests: true,
        },
      },
    },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Entreprise non trouvée" },
      { status: 404 }
    );
  }

  // Dissocier les utilisateurs de l'entreprise avant suppression
  await prisma.user.updateMany({
    where: { companyId },
    data: { companyId: null },
  });

  // Supprimer l'entreprise (les transports seront supprimés en cascade si configuré)
  await prisma.company.delete({
    where: { id: companyId },
  });

  // Logger la suppression
  const reqHeaders = await headers();
  const { ipAddress } = extractRequestInfo(reqHeaders);
  AuditHelpers.companyDeleted(authResult.user.id, companyId, company.name, ipAddress);

  return NextResponse.json({
    success: true,
    message: `L'entreprise "${company.name}" a été supprimée`,
  });
}
