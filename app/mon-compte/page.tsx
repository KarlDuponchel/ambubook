"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Settings,
  ChevronRight,
  User,
  Loader2,
  Truck,
} from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
  phone: string | null;
}

export default function MonComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check-status");
        const data = await res.json();

        if (!data.isLoggedIn) {
          router.push("/connexion?redirect=/mon-compte");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Erreur:", error);
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Mon compte</h1>
        <p className="text-neutral-600 mt-1">
          Gérez vos transports et vos préférences
        </p>
      </div>

      {/* Carte profil */}
      {user && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-semibold shadow-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{user.name}</h2>
              <p className="text-neutral-500">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-neutral-400">{user.phone}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
        <Link
          href="/mes-transports"
          className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Mes transports</p>
              <p className="text-sm text-neutral-500">
                Consultez vos demandes et leur statut
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        </Link>

        <Link
          href="/recherche"
          className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <Truck className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Réserver un transport</p>
              <p className="text-sm text-neutral-500">
                Trouvez un ambulancier près de chez vous
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        </Link>

        <Link
          href="/mon-compte/parametres"
          className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Paramètres</p>
              <p className="text-sm text-neutral-500">
                Notifications et préférences
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        </Link>
      </div>

      {/* Info */}
      <p className="text-center text-sm text-neutral-400">
        Besoin d&apos;aide ?{" "}
        <Link href="/#faq" className="text-primary-600 hover:underline">
          Consultez notre FAQ
        </Link>
      </p>
    </div>
  );
}
