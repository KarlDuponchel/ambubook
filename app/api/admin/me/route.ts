import { NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/me - Récupère les informations de l'admin connecté
 */
export async function GET() {
  const authResult = await requireAdmin();

  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return NextResponse.json({
    id: authResult.user.id,
    name: authResult.user.name,
    email: authResult.user.email,
    role: authResult.user.role,
  });
}
