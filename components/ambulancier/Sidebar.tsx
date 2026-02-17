"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  Building2,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Ambulance,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    isOwner?: boolean;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showIf?: boolean;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      showIf: true,
    },
    {
      label: "Demandes",
      href: "/dashboard/demandes",
      icon: FileText,
      showIf: true,
    },
    {
      label: "Calendrier",
      href: "/dashboard/calendrier",
      icon: Calendar,
      showIf: true,
    },
    {
      label: "Statistiques",
      href: "/dashboard/statistiques",
      icon: BarChart3,
      showIf: true,
    },
    {
      label: "Mon entreprise",
      href: "/dashboard/mon-entreprise",
      icon: Building2,
      showIf: true,
    },
    {
      label: "Inviter",
      href: "/dashboard/invite",
      icon: UserPlus,
      showIf: user.isOwner === true,
    },
    {
      label: "Paramètres",
      href: "/dashboard/parametres",
      icon: Settings,
      showIf: true,
    },
    {
      label: "Profil",
      href: "/dashboard/profil",
      icon: User,
      showIf: true,
    },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/dashboard/connexion";
  };

  const filteredNavItems = navItems.filter((item) => item.showIf);

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-sidebar-bg/90 border border-sidebar-border shadow-sm backdrop-blur lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6 text-neutral-700" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar-bg border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-xl shadow-black/5",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className="absolute inset-0 bg-linear-to-r from-primary-50 via-background to-accent-50 opacity-70" />
          <Link
            href="/dashboard"
            className={cn(
              "relative z-10 flex items-center gap-2 text-primary-700 font-semibold",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/30">
              <Ambulance className="h-5 w-5 shrink-0" />
            </div>
            {!isCollapsed && <span className="text-lg tracking-tight">AmbuBook</span>}
          </Link>
          <div className="relative z-10 flex items-center gap-1">
            {/* Notifications */}
            {!isCollapsed && <NotificationBell variant="dashboard" />}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              aria-label={isCollapsed ? "Agrandir" : "Réduire"}
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              aria-label="Fermer le menu"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative",
                      isActive
                        ? "bg-primary-50 text-primary-700 font-semibold"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary-600" />
                    )}
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-10 w-10 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 ring-2 ring-white">
              <span className="text-primary-700 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 hover:bg-danger-50 hover:text-danger-600 transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Se déconnecter" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">Se déconnecter</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
