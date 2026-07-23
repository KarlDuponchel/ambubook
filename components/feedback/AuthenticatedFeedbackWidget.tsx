"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { FeedbackWidget } from "./FeedbackWidget";

interface AuthenticatedFeedbackWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

/**
 * Wrapper qui affiche le FeedbackWidget uniquement si l'utilisateur est connecté.
 * À utiliser dans les layouts où la session n'est pas déjà vérifiée.
 */
export function AuthenticatedFeedbackWidget({ position }: AuthenticatedFeedbackWidgetProps) {
  const { data: session, isPending } = useSession();
  // Rendu strictement client : évite un mismatch d'hydratation, car l'état de
  // session peut différer entre le HTML serveur (aucune session) et le 1er
  // rendu client (session déjà en cache). Serveur + 1er rendu client = null.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ne rien afficher tant que non monté, en chargement, ou si non connecté
  if (!mounted || isPending || !session?.user) {
    return null;
  }

  return <FeedbackWidget position={position} />;
}
