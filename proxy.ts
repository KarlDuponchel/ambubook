import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier la session via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Non connecté → redirection vers login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Routes admin : vérifier le rôle
  if (pathname.startsWith("/admin")) {
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
