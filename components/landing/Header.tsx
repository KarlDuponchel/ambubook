"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, UserCircle2 } from "lucide-react";
import { Container } from "@/components/ui";
import { useSession, signOut } from "@/lib/auth-client";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">
              Ambu<span className="text-primary-600">Book</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#comment-ca-marche"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Comment ça marche
            </Link>
            <Link
              href="#professionnels"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Professionnels
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg transition-all ease-in-out ${userMenuOpen ? "bg-primary-50 text-primary-500" : ""}`}
                >
                  <UserCircle2 className="w-6 h-6" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-neutral-500">{session.user.email}</p>
                    </div>
                    <Link href="/profil" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><User className="w-4 h-4" /> Mon profil</Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
              >
                Connexion
              </Link>
            )}
            <Link
              href="/dashboard/login"
              className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Espace Pro
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Menu principal"
          >
            <div className="relative w-6 h-6">
              {/* Hamburger icon with animation */}
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
        </nav>
      </Container>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "64px" }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 bg-white border-b border-neutral-200 shadow-lg z-50 md:hidden transform transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <Container>
          <div className="py-6 flex flex-col gap-2">
            <Link
              href="#comment-ca-marche"
              className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Comment ça marche
            </Link>
            <Link
              href="#professionnels"
              className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Professionnels
            </Link>

            <hr className="my-2 border-neutral-100" />

            {session?.user ? (
              <>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-neutral-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-neutral-500">{session.user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-xl transition-colors w-full"
                >
                  <LogOut className="w-5 h-5 text-neutral-400" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 font-medium rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-neutral-400" />
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 mx-4 mt-2 px-5 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
