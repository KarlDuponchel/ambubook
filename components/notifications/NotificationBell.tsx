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
      ? "relative grid place-items-center w-10 h-10 text-ink-2 hover:text-brand border border-line bg-surface hover:border-brand rounded-[10px] transition-colors"
      : "relative p-2 text-ink-2 hover:text-ink hover:bg-surface-2 rounded-lg transition-colors";

  const badgeClasses =
    "absolute top-1.5 right-1.5 h-4.5 min-w-4.5 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-rouge rounded-full border-2 border-surface";

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
