/**
 * API Compteur de notifications
 * GET /api/notifications/count - Retourne le nombre de notifications non lues
 * Optimisé pour le polling (léger)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUnreadCount } from "@/lib/notifications/inapp";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getUnreadCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erreur GET /api/notifications/count:", error);
    return NextResponse.json({ count: 0 });
  }
}
