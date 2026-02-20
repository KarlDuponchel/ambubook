import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi de votre demande | AmbuBook",
  description: "Suivez le statut de votre demande de transport médical.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuiviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
