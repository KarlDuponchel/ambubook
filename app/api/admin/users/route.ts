import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/users - Liste tous les utilisateurs avec leur société
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          ownerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ajouter le champ isCompanyOwner pour chaque utilisateur
  const usersWithOwnerFlag = users.map((user) => ({
    ...user,
    isCompanyOwner: user.company?.ownerId === user.id,
  }));

  return NextResponse.json(usersWithOwnerFlag);
}
