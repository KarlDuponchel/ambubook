import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/companies - Liste toutes les sociétés
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const companies = await prisma.company.findMany({
    where: search
      ? {
          name: { contains: search, mode: "insensitive" },
        }
      : undefined,
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(companies);
}
