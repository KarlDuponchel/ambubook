"use client";

import { useEffect, useRef } from "react";

export function Axeptio() {
  // Ref plutôt que state : la valeur ne sert qu'à garder le suivi du
  // chargement, elle n'influence pas le rendu (le composant retourne null)
  const isLoaded = useRef(false);

  useEffect(() => {
    // Éviter le double chargement
    if (isLoaded.current || typeof window === "undefined") return;
    if (document.getElementById("axeptio-sdk")) return;

    // Configurer Axeptio
    window.axeptioSettings = {
      clientId:
        process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID || "69a8c2595c331f2959aa7747",
      cookiesVersion: "247e5117-b76e-4595-bc66-d5ccc1849420",
      googleConsentMode: {
        default: {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          wait_for_update: 500,
        },
      },
    };

    // Charger le script Axeptio
    const script = document.createElement("script");
    script.id = "axeptio-sdk";
    script.src = "https://static.axept.io/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    isLoaded.current = true;
  }, []);

  return null;
}

// Type declaration for window.axeptioSettings
declare global {
  interface Window {
    axeptioSettings?: {
      clientId: string;
      cookiesVersion: string;
      googleConsentMode?: {
        default: {
          analytics_storage: string;
          ad_storage: string;
          ad_user_data: string;
          ad_personalization: string;
          wait_for_update?: number;
        };
      };
    };
  }
}
