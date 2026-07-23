import type { Metadata } from "next";
import { Public_Sans, Newsreader } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { AuthenticatedFeedbackWidget } from "@/components/feedback";
import { Axeptio } from "@/components/common/Axeptio";
import "./globals.css";

// Public Sans : sans institutionnel pour le corps de texte
const publicSans = Public_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

// Newsreader : serif éditoriale pour les titres et accents
const newsreader = Newsreader({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ambubook | Votre service de prise de rendez-vous en ligne",
  description: "Besoin d'un trajet domicile-hôpital ? Ambubook vous permet de prendre rendez-vous en ligne avec une ambulance ou un VSL pour vos déplacements médicaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`light ${publicSans.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <ToastProvider>
          {children}
          <AuthenticatedFeedbackWidget />
        </ToastProvider>
        <Axeptio />
      </body>
    </html>
  );
}
