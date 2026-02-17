/**
 * API Notifications In-App
 * GET /api/notifications - Liste les notifications de l'utilisateur
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getNotifications } from "@/lib/notifications/inapp";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "UNREAD" | "READ" | "ARCHIVED" | null;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getNotifications(session.user.id, {
      status: status || undefined,
      limit: Math.min(limit, 50), // Max 50 par requête
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
