"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Bell,
  MessageSquare,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
  };
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AdminSidebar({
  user,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = (value: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Utilisateurs",
      href: "/admin/utilisateurs",
      icon: Users,
    },
    {
      label: "Entreprises",
      href: "/admin/entreprises",
      icon: Building2,
    },
    {
      label: "Transports",
      href: "/admin/transports",
      icon: Truck,
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      label: "Feedback",
      href: "/admin/feedback",
      icon: MessageSquare,
    },
    {
      label: "Logs",
      href: "/admin/logs",
      icon: ScrollText,
    },
    {
      label: "Configuration",
      href: "/admin/configuration",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/connexion";
  };

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-neutral-900/90 border border-neutral-700 shadow-sm backdrop-blur lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6 text-neutral-200" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col transition-all duration-300 shadow-xl",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-950/50 via-neutral-900 to-purple-950/50 opacity-70" />
          <Link
            href="/admin"
            className={cn(
              "relative z-10 flex items-center gap-2 text-white font-semibold",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Shield className="h-5 w-5 shrink-0" />
            </div>
            {!isCollapsed && (
              <span className="text-lg tracking-tight">Admin</span>
            )}
          </Link>
          <div className="relative z-10 flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400"
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
              className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400"
              aria-label="Fermer le menu"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative",
                      isActive
                        ? "bg-violet-600/20 text-violet-400 font-semibold"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-violet-500" />
                    )}
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-violet-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-neutral-800 p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 ring-2 ring-neutral-800">
              <span className="text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:bg-red-950/50 hover:text-red-400 transition-colors",
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
