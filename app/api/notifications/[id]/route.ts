/**
 * API Notification individuelle
 * PATCH /api/notifications/[id] - Marquer comme lue
 * DELETE /api/notifications/[id] - Archiver la notification
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markAsRead, archiveNotification } from "@/lib/notifications/inapp";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await markAsRead(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /api/notifications/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await archiveNotification(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/notifications/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
