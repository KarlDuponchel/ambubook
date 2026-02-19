import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
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
    <html lang="fr" className="light" suppressHydrationWarning>
      <body
        className={`${poppins.className} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
