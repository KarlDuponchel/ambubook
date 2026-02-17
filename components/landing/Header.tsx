"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LogOut, Truck, ChevronDown, Calendar, User, LayoutDashboard, Building2, Search, Settings } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications";

function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";

  return (
    <div
      className={`${sizeClasses} rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm`}
    >
      {initials}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Vérifier le rôle de l'utilisateur
  const userRole = (session?.user as { role?: string })?.role;
  const isAmbulancier = userRole === "AMBULANCIER" || userRole === "ADMIN";

  // Fermer les menus si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (mobileMenuOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, userMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
    window.location.reload();
  };

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
      <nav className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm shadow-neutral-900/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">
              Ambu<span className="text-primary-600">Book</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/recherche"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-lg transition-all"
            >
              Trouver un ambulancier
            </Link>
            <Link
              href="/#comment-ca-marche"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-lg transition-all"
            >
              Comment ça marche
            </Link>
            <Link
              href="/#faq"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-lg transition-all"
            >
              FAQ
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <>
                {/* Notifications Bell */}
                <NotificationBell variant="landing" />

                <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all ${
                    userMenuOpen
                      ? "border-primary-200 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <UserAvatar name={session.user.name || "U"} size="sm" />
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50 transform transition-all duration-200 origin-top-right ${
                    userMenuOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* User info */}
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                    <p className="font-medium text-neutral-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {session.user.email}
                    </p>
                  </div>

                  {/* Menu items - différent selon le rôle */}
                  <div className="py-1">
                    {isAmbulancier ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                          <span>Tableau de bord</span>
                        </Link>
                        <Link
                          href="/dashboard/calendrier"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>Calendrier</span>
                        </Link>
                        <Link
                          href="/dashboard/mon-entreprise"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          <span>Mon entreprise</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/mes-transports"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>Mes transports</span>
                        </Link>
                        <Link
                          href="/recherche"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Search className="w-4 h-4 text-neutral-400" />
                          <span>Trouver un ambulancier</span>
                        </Link>
                        <Link
                          href="/mon-compte"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>Mon compte</span>
                        </Link>
                      </>
                    )}
                    <Link
                      href={isAmbulancier ? "/dashboard/parametres" : "/mon-compte/parametres"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      <span>Paramètres</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-neutral-100 py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium rounded-lg hover:bg-neutral-50 transition-all"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-all"
                >
                  Créer un compte
                </Link>
              </>
            )}

            {/* Separator + Pro CTA - seulement si non ambulancier connecté */}
            {!(session?.user && isAmbulancier) && (
              <>
                <div className="w-px h-6 bg-neutral-200" />
                <Link
                  href="/dashboard/connexion"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-all shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>Espace Ambulancier</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Recherche mobile */}
            <Link
              href="/recherche"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notifications mobile */}
            {session?.user && <NotificationBell variant="landing" />}

            {/* Menu button */}
            <button
              type="button"
              className="p-2 -mr-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu principal"
            >
            <div className="relative w-6 h-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out ${
                  mobileMenuOpen ? "top-3 rotate-45" : "top-1 rotate-0"
                }`}
              />
              <span
                className={`absolute left-0 top-3 block h-0.5 w-6 bg-current transition-all duration-200 ${
                  mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out ${
                  mobileMenuOpen ? "top-3 -rotate-45" : "top-5 rotate-0"
                }`}
              />
            </div>
            </button>
          </div>
        </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "80px" }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 top-16 mt-2 bg-white border border-neutral-200/60 rounded-2xl shadow-lg z-50 lg:hidden transform transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-4">
            {/* Navigation links */}
            <div className="space-y-1">
              <Link
                href="/recherche"
                className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trouver un ambulancier
              </Link>
              <Link
                href="/#comment-ca-marche"
                className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link
                href="/#faq"
                className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
            </div>

            <hr className="my-3 border-neutral-100" />

            {/* User section */}
            {session?.user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserAvatar name={session.user.name || "U"} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Liens selon le rôle */}
                {isAmbulancier ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5 text-neutral-400" />
                      Tableau de bord
                    </Link>
                    <Link
                      href="/dashboard/calendrier"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      Calendrier
                    </Link>
                    <Link
                      href="/dashboard/mon-entreprise"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-5 h-5 text-neutral-400" />
                      Mon entreprise
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/mes-transports"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      Mes transports
                    </Link>
                    <Link
                      href="/recherche"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Search className="w-5 h-5 text-neutral-400" />
                      Trouver un ambulancier
                    </Link>
                    <Link
                      href="/mon-compte"
                      className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-neutral-400" />
                      Mon compte
                    </Link>
                  </>
                )}

                <Link
                  href={isAmbulancier ? "/dashboard/profil" : "/profil"}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-neutral-400" />
                  Mon profil
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/connexion"
                  className="flex items-center justify-center px-4 py-3 text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl border border-neutral-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion patient
                </Link>
                <Link
                  href="/inscription"
                  className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Créer un compte patient
                </Link>
              </div>
            )}

            {/* Pro CTA - seulement si non ambulancier connecté */}
            {!(session?.user && isAmbulancier) && (
              <>
                <hr className="my-3 border-neutral-100" />
                <Link
                  href="/dashboard/connexion"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Truck className="w-5 h-5" />
                  Espace Ambulancier
                </Link>
              </>
            )}
          </div>
      </div>
    </header>
  );
}
