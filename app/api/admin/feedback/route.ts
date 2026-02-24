import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { getSignedDownloadUrl, isS3Configured } from "@/lib/s3";

/**
 * Génère une URL signée pour un screenshot de feedback
 * Gère les anciens feedbacks avec URL complète et les nouveaux avec clé S3
 */
async function getScreenshotUrl(screenshot: string | null): Promise<string | null> {
  if (!screenshot) return null;

  // Si c'est déjà une URL complète (anciens feedbacks), la retourner telle quelle
  if (screenshot.startsWith("http")) {
    return screenshot;
  }

  // Sinon c'est une clé S3, générer une URL signée (1h)
  if (isS3Configured()) {
    try {
      return await getSignedDownloadUrl(screenshot, 3600);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * GET /api/admin/feedback - Liste paginée des feedbacks avec filtres
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const priority = searchParams.get("priority") || "ALL";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (sujet ou message)
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Filtre type
  if (type !== "ALL") {
    where.type = type;
  }

  // Filtre statut
  if (status !== "ALL") {
    where.status = status;
  }

  // Filtre priorité
  if (priority !== "ALL") {
    where.priority = priority;
  }

  // Comptages pour les filtres (sans pagination, avec recherche)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: any = search
    ? {
        OR: [
          { subject: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [total, totalFiltered, newCount, inProgress, resolved, bugs, critical] = await Promise.all([
    prisma.feedback.count({ where: baseWhere }),
    prisma.feedback.count({ where }),
    prisma.feedback.count({ where: { ...baseWhere, status: "NEW" } }),
    prisma.feedback.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
    prisma.feedback.count({ where: { ...baseWhere, status: "RESOLVED" } }),
    prisma.feedback.count({ where: { ...baseWhere, type: "BUG" } }),
    prisma.feedback.count({ where: { ...baseWhere, priority: "CRITICAL" } }),
  ]);

  // Récupération paginée
  const feedbacksRaw = await prisma.feedback.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Générer les URLs signées pour les screenshots
  const feedbacks = await Promise.all(
    feedbacksRaw.map(async (feedback) => ({
      ...feedback,
      screenshot: await getScreenshotUrl(feedback.screenshot),
    }))
  );

  return NextResponse.json({
    feedbacks,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    counts: {
      total,
      new: newCount,
      inProgress,
      resolved,
      bugs,
      critical,
    },
  });
}
