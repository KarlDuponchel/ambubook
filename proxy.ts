import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Cache simple pour le mode maintenance (éviter trop d'appels)
let maintenanceCache: { value: boolean; expiry: number } | null = null;
const CACHE_TTL = 30_000; // 30 secondes

async function isMaintenanceMode(request: NextRequest): Promise<boolean> {
  // Vérifier le cache
  if (maintenanceCache && Date.now() < maintenanceCache.expiry) {
    return maintenanceCache.value;
  }

  try {
    // Appeler l'API config (interne)
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/config`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (response.ok) {
      const config = await response.json();
      maintenanceCache = {
        value: config.maintenanceMode === true,
        expiry: Date.now() + CACHE_TTL,
      };
      return maintenanceCache.value;
    }
  } catch {
    // En cas d'erreur, ne pas bloquer
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne jamais bloquer ces routes
  const bypassRoutes = [
    "/maintenance",
    "/api/",
    "/_next/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  if (bypassRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier le mode maintenance pour les pages publiques
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/dashboard")) {
    const maintenance = await isMaintenanceMode(request);
    if (maintenance) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    return NextResponse.next();
  }

  // Pages de connexion : toujours accessibles (même en maintenance)
  // Pour permettre aux admins de se connecter
  if (
    pathname === "/dashboard/connexion" ||
    pathname === "/connexion" ||
    pathname === "/admin/connexion"
  ) {
    return NextResponse.next();
  }

  // Page d'inscription : bloquée en maintenance
  if (pathname === "/dashboard/inscription" || pathname === "/inscription") {
    const maintenance = await isMaintenanceMode(request);
    if (maintenance) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
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

  // Mode maintenance : seuls les admins passent
  const maintenance = await isMaintenanceMode(request);
  if (maintenance && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
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
  matcher: [
    // Routes protégées
    "/admin/:path*",
    "/dashboard/:path*",
    // Pages publiques (pour le mode maintenance)
    "/",
    "/recherche/:path*",
    "/ambulances/:path*",
    "/connexion",
    "/inscription",
    "/contact",
    "/a-propos",
    "/reserver/:path*",
  ],
};
