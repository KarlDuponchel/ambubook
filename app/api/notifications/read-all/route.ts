/**
 * API Marquer toutes les notifications comme lues
 * POST /api/notifications/read-all
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markAllAsRead } from "@/lib/notifications/inapp";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur POST /api/notifications/read-all:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
