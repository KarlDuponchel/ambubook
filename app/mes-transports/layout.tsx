import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes transports | AmbuBook",
  description: "Consultez l'historique et le statut de vos demandes de transport médical.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MesTransportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
