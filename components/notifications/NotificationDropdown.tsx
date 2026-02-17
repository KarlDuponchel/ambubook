"use client";

import { useEffect, useRef } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { NotificationItem } from "./NotificationItem";

interface InAppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: InAppNotification[];
  isLoading: boolean;
  hasMore: boolean;
  unreadCount: number;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onLoadMore: () => void;
  position?: "left" | "right";
}

export function NotificationDropdown({
  notifications,
  isLoading,
  hasMore,
  unreadCount,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onLoadMore,
  position = "right",
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer avec Escape ou clic extérieur
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const positionClasses = position === "left" ? "left-0" : "right-0";

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute ${positionClasses} top-full mt-2 w-80 sm:w-96
        bg-white rounded-xl shadow-lg border border-neutral-200
        z-50 overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-200
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <h3 className="font-semibold text-neutral-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="
              flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700
              transition-colors
            "
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Bell className="h-12 w-12 mb-3" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                id={notif.id}
                type={notif.type}
                title={notif.title}
                message={notif.message}
                link={notif.link}
                status={notif.status}
                createdAt={notif.createdAt}
                onMarkAsRead={onMarkAsRead}
                onArchive={onArchive}
              />
            ))}

            {/* Loader */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            )}

            {/* Charger plus */}
            {hasMore && !isLoading && (
              <button
                onClick={onLoadMore}
                className="
                  w-full py-3 text-sm text-primary-600 hover:bg-neutral-50
                  transition-colors
                "
              >
                Charger plus
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
