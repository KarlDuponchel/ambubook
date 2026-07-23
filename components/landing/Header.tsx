"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { LogOut, Truck, ChevronDown, Calendar, User, LayoutDashboard, Building2, Search, Settings, Plus } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((r) => r.ok ? r.json() : null);

function UserAvatar({ name, imageUrl, size = "md" }: { name: string; imageUrl?: string | null; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover`}
        width={size === "sm" ? 32 : 36}
        height={size === "sm" ? 32 : 36}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}
    >
      {initials}
    </div>
  );
}

/** Logo AmbuBook — picto « + » + wordmark serif italic teal */
function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="grid place-items-center w-9 h-9 rounded-[11px] text-white"
        style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink">
        Ambu<span className="serif italic font-semibold text-teal">Book</span>
      </span>
    </span>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Cloisonnement front / dashboard : le front office ne reconnaît comme
  // « connecté » qu'un compte CUSTOMER. Un ambulancier/admin connecté est
  // traité comme un pro (accès à son dashboard) mais pas comme un utilisateur
  // du front office (pas de menu compte patient).
  const userRole = (session?.user as { role?: string })?.role;
  const isCustomer = userRole === "CUSTOMER";
  const isPro = !!session?.user && !isCustomer;
  // Alias conservé pour les menus internes (ambulancier/admin connecté)
  const isAmbulancier = isPro;

  // Profil (avatar) chargé uniquement pour un client
  const profileEndpoint = isCustomer ? "/api/user/me" : null;

  const { data: profileData } = useSWR<{ imageUrl?: string | null }>(
    profileEndpoint,
    fetcher,
    {
      revalidateOnFocus: false,       // pas de refetch au retour sur l'onglet
      revalidateOnReconnect: false,   // pas de refetch à la reconnexion réseau
      dedupingInterval: 5 * 60 * 1000, // 5 min de cache partagé entre composants
    }
  );

  const profileImageUrl = profileData?.imageUrl ?? null;

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

  const navLink =
    "px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink hover:bg-surface-2 rounded-[9px] transition-colors";

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
      <nav className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-5 bg-surface/85 backdrop-blur-md border border-line rounded-2xl shadow-soft">

          <Link href="/" aria-label="Accueil AmbuBook" className="lg:hidden">
            <Wordmark />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" aria-label="Accueil AmbuBook">
              <Wordmark />
            </Link>
            <Link href="/recherche" className={navLink}>
              Trouver un ambulancier
            </Link>
            <Link href="/#comment-ca-marche" className={navLink}>
              Comment ça marche
            </Link>
            <Link href="/#faq" className={navLink}>
              FAQ
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {isCustomer ? (
              <>
                {/* Notifications Bell */}
                <NotificationBell variant="landing" />

                <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors ${
                    userMenuOpen
                      ? "border-brand/40 bg-surface-2"
                      : "border-line hover:bg-surface-2"
                  }`}
                >
                  <UserAvatar name={session?.user?.name || "U"} imageUrl={profileImageUrl} size="sm" />
                  <ChevronDown
                    className={`w-4 h-4 text-ink-3 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-soft border border-line overflow-hidden z-50 transform transition-all duration-200 origin-top-right ${
                    userMenuOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* User info */}
                  <div className="px-4 py-3 bg-surface-2 border-b border-line">
                    <p className="font-semibold text-ink truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-sm text-ink-3 truncate">
                      {session?.user?.email}
                    </p>
                  </div>

                  {/* Menu items - différent selon le rôle */}
                  <div className="py-1">
                    {isAmbulancier ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-ink-3" />
                          <span>Tableau de bord</span>
                        </Link>
                        <Link
                          href="/dashboard/calendrier"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-ink-3" />
                          <span>Calendrier</span>
                        </Link>
                        <Link
                          href="/dashboard/mon-entreprise"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-ink-3" />
                          <span>Mon entreprise</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/mes-transports"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-ink-3" />
                          <span>Mes transports</span>
                        </Link>
                        <Link
                          href="/recherche"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <Search className="w-4 h-4 text-ink-3" />
                          <span>Trouver un ambulancier</span>
                        </Link>
                        <Link
                          href="/mon-compte"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                        >
                          <User className="w-4 h-4 text-ink-3" />
                          <span>Mon compte</span>
                        </Link>
                      </>
                    )}
                    <Link
                      href={isAmbulancier ? "/dashboard/parametres" : "/mon-compte/parametres"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-ink-2 hover:bg-surface-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-ink-3" />
                      <span>Paramètres</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-line py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-rouge hover:bg-surface-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
              </>
            ) : (
              !isPro && (
                <>
                  {/* CTA espace pro : visible pour les visiteurs et les pros, jamais pour un client */}
                  {!isCustomer && (
                    <Link
                      href={isPro ? "/dashboard" : "/dashboard/connexion"}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink hover:bg-surface-2 rounded-[10px] transition-colors"
                    >
                      <span>{isPro ? "Mon dashboard" : "Espace Ambulancier"}</span>
                    </Link>
                  )}
                  <Link
                    href="/connexion"
                    className="px-4 py-2 text-sm font-semibold text-ink border border-line rounded-[10px] hover:bg-surface-2 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="px-4 py-2 text-sm font-bold text-white rounded-[10px] bg-brand hover:bg-brand-ink transition-colors"
                  >
                    Créer un compte
                  </Link>
                </>
              )
            )}

          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Recherche mobile */}
            <Link
              href="/recherche"
              className="p-2 text-ink-2 hover:text-ink hover:bg-surface-2 rounded-lg transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notifications mobile */}
            {isCustomer && <NotificationBell variant="landing" />}

            {/* Menu button */}
            <button
              type="button"
              className="p-2 -mr-2 text-ink-2 hover:text-ink transition-colors"
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
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "80px" }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 top-16 mt-2 bg-surface border border-line rounded-2xl shadow-soft z-50 lg:hidden transform transition-all duration-300 ease-out ${
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
                className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trouver un ambulancier
              </Link>
              <Link
                href="/#comment-ca-marche"
                className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link
                href="/#faq"
                className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
            </div>

            <hr className="my-3 border-line" />

            {/* User section */}
            {isCustomer ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserAvatar name={session?.user?.name || "U"} imageUrl={profileImageUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-sm text-ink-3 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>

                {/* Liens selon le rôle */}
                {isAmbulancier ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5 text-ink-3" />
                      Tableau de bord
                    </Link>
                    <Link
                      href="/dashboard/calendrier"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-5 h-5 text-ink-3" />
                      Calendrier
                    </Link>
                    <Link
                      href="/dashboard/mon-entreprise"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-5 h-5 text-ink-3" />
                      Mon entreprise
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/mes-transports"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-5 h-5 text-ink-3" />
                      Mes transports
                    </Link>
                    <Link
                      href="/recherche"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Search className="w-5 h-5 text-ink-3" />
                      Trouver un ambulancier
                    </Link>
                    <Link
                      href="/mon-compte"
                      className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-ink-3" />
                      Mon compte
                    </Link>
                  </>
                )}

                <Link
                  href={isAmbulancier ? "/dashboard/profil" : "/mon-compte/profil"}
                  className="flex items-center gap-3 px-4 py-3 text-ink-2 hover:bg-surface-2 font-semibold rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-ink-3" />
                  Mon profil
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-rouge hover:bg-surface-2 font-semibold rounded-xl transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            ) : (
              !isPro && (
                <div className="space-y-2">
                  <Link
                    href="/connexion"
                    className="flex items-center justify-center px-4 py-3 text-ink font-semibold rounded-xl border border-line hover:bg-surface-2 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion patient
                  </Link>
                  <Link
                    href="/inscription"
                    className="flex items-center justify-center px-4 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-ink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Créer un compte patient
                  </Link>
                </div>
              )
            )}

            {/* CTA espace pro : visiteurs et pros, jamais pour un client */}
            {!isCustomer && (
              <>
                <hr className="my-3 border-line" />
                <Link
                  href={isPro ? "/dashboard" : "/dashboard/connexion"}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-line text-ink font-semibold rounded-xl hover:bg-surface-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isPro ? "Mon dashboard" : "Espace Ambulancier"}
                </Link>
              </>
            )}
          </div>
      </div>
    </header>
  );
}
