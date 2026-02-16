import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages d'auth ambulanciers : pas de protection
  if (pathname === "/dashboard/connexion" || pathname === "/dashboard/inscription") {
    return NextResponse.next();
  }

  // Vérifier la session via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Non connecté → redirection vers login ambulancier
  if (!session?.user) {
    return NextResponse.redirect(new URL("/dashboard/connexion", request.url));
  }

  const userRole = (session.user as { role?: string }).role;

  // Les CUSTOMERS ne peuvent pas accéder au dashboard/admin → redirection accueil
  if (userRole === "CUSTOMER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Routes admin : vérifier le rôle ADMIN
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
