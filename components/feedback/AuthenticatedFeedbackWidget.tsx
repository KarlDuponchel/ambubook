"use client";

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

  // Ne rien afficher si la session est en cours de chargement ou si non connecté
  if (isPending || !session?.user) {
    return null;
  }

  return <FeedbackWidget position={position} />;
}
