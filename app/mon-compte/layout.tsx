import { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Mon compte | AmbuBook",
  description: "Gérez votre compte AmbuBook, vos préférences et vos informations personnelles.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MonCompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
