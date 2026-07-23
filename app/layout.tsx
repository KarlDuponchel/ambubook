import type { Metadata } from "next";
import { Public_Sans, Newsreader } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthenticatedFeedbackWidget } from "@/components/feedback";
import { Axeptio } from "@/components/common/Axeptio";
import "./globals.css";

// Script anti-FOUC : pose la classe de thème sur <html> AVANT le 1er paint,
// en lisant la préférence explicite (localStorage) sinon la préférence système.
// Doit rester synchrone et minimal. Aligné avec components/theme/ThemeProvider.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var e=document.documentElement;e.classList.toggle('dark',t==='dark');e.classList.toggle('light',t==='light');}catch(e){}})();`;

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
      className={`${publicSans.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
            <AuthenticatedFeedbackWidget />
          </ToastProvider>
        </ThemeProvider>
        <Axeptio />
      </body>
    </html>
  );
}
