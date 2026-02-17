"use client";

import { useState, useEffect, useCallback } from "react";

interface InAppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
  readAt?: string;
}

interface UseNotificationsOptions {
  pollInterval?: number; // En millisecondes
  autoFetch?: boolean;
}

interface UseNotificationsReturn {
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  refreshCount: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { pollInterval = 30000, autoFetch = true } = options;

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Récupérer le compteur de notifications non lues
  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Erreur refresh count:", err);
    }
  }, []);

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications?limit=20&offset=0");
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
      setOffset(data.notifications.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger plus de notifications
  const fetchMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?limit=20&offset=${offset}`);
      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
      setHasMore(data.hasMore);
      setOffset((prev) => prev + data.notifications.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, offset]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur markAsRead:", err);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: "READ" as const,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur markAllAsRead:", err);
    }
  }, []);

  // Archiver une notification
  const archiveNotification = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");

      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif?.status === "UNREAD") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur archiveNotification:", err);
    }
  }, [notifications]);

  // Polling du compteur
  useEffect(() => {
    if (!autoFetch) return;

    // Fetch initial
    refreshCount();

    // Polling
    const interval = setInterval(refreshCount, pollInterval);
    return () => clearInterval(interval);
  }, [autoFetch, pollInterval, refreshCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refreshCount,
  };
}
