import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { HistoryEventType } from "@/generated/prisma/client";
import { z } from "zod";

// Schéma de validation pour l'ajout d'une note à l'historique
const addNoteSchema = z.object({
  comment: z.string().trim().min(1),
});

// GET - Historique d'une demande
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que la demande appartient à la compagnie
    const demande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const history = await prisma.requestHistory.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Erreur API GET /api/ambulancier/demandes/[id]/history:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une note à l'historique
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que la demande appartient à la compagnie
    const demande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const parsed = addNoteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { comment } = parsed.data;

    const historyEntry = await prisma.requestHistory.create({
      data: {
        eventType: HistoryEventType.NOTE_ADDED,
        comment: comment.trim(),
        request: { connect: { id } },
        user: { connect: { id: user.id } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(historyEntry, { status: 201 });
  } catch (error) {
    console.error("Erreur API POST /api/ambulancier/demandes/[id]/history:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
