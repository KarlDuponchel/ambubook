"use client";

import { useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationBellProps {
  variant?: "landing" | "dashboard";
}

export function NotificationBell({ variant = "landing" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications({ pollInterval: 30000 });

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      // Charger les notifications à l'ouverture
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, fetchNotifications]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
      handleClose();
    },
    [markAsRead, handleClose]
  );

  const buttonClasses =
    variant === "landing"
      ? "relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      : "relative p-2 text-neutral-400 hover:text-neutral-900 hover:bg-white/10 rounded-lg transition-colors";

  const badgeClasses =
    variant === "landing"
      ? "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs font-bold text-white bg-danger-500 rounded-full"
      : "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs font-bold text-white bg-danger-500 rounded-full";

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={buttonClasses}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className={badgeClasses}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          hasMore={hasMore}
          unreadCount={unreadCount}
          onClose={handleClose}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={markAllAsRead}
          onArchive={archiveNotification}
          onLoadMore={fetchMore}
          position={variant === "dashboard" ? "left" : "right"}
        />
      )}
    </div>
  );
}
