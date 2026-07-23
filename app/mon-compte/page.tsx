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
import Image from "next/image";

interface UserInfo {
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
}

export default function MonComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user/me");

        if (res.status === 401) {
          router.push("/connexion?redirect=/mon-compte");
          return;
        }

        if (!res.ok) throw new Error();

        const data = await res.json() as UserInfo;
        setUser(data);
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
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const navItems = [
    {
      href: "/mes-transports",
      icon: Calendar,
      color: "var(--bleu)",
      title: "Mes transports",
      desc: "Consultez vos demandes et leur statut",
    },
    {
      href: "/recherche",
      icon: Truck,
      color: "var(--teal)",
      title: "Réserver un transport",
      desc: "Trouvez un ambulancier près de chez vous",
    },
    {
      href: "/mon-compte/profil",
      icon: User,
      color: "var(--violet)",
      title: "Mon profil",
      desc: "Nom, téléphone et photo de profil",
    },
    {
      href: "/mon-compte/parametres",
      icon: Settings,
      color: "var(--neutre)",
      title: "Paramètres",
      desc: "Notifications et préférences",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="serif text-3xl text-ink">Mon compte</h1>
        <p className="text-ink-2 mt-1">
          Gérez vos transports et vos préférences
        </p>
      </div>

      {/* Carte profil */}
      {user && (
        <Link
          href="/mon-compte/profil"
          className="flex items-center gap-4 bg-surface border border-line rounded-2xl shadow-soft p-5 hover:border-brand transition-colors"
        >
          <div className="relative shrink-0">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Photo de profil"
                className="w-14 h-14 rounded-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-ink truncate">{user.name}</h2>
            <p className="text-sm text-ink-2 truncate">{user.email}</p>
            {user.phone && <p className="text-sm text-ink-2">{user.phone}</p>}
          </div>
          <ChevronRight className="h-5 w-5 text-ink-3 shrink-0" />
        </Link>
      )}

      {/* Navigation */}
      <div className="flex flex-col gap-2.5">
        {navItems.map(({ href, icon: Icon, color, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3.5 bg-surface border border-line rounded-2xl p-4 hover:border-brand hover:bg-surface-2 transition-colors"
          >
            <span
              className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
              style={{
                background: `color-mix(in srgb, ${color} 14%, var(--surface))`,
                color,
              }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink">{title}</p>
              <p className="text-[13px] text-ink-2">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-3 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Info */}
      <p className="text-center text-sm text-ink-3">
        Besoin d&apos;aide ?{" "}
        <Link href="/#faq" className="font-semibold text-brand hover:text-brand-ink transition-colors">
          Consultez notre FAQ
        </Link>
      </p>
    </div>
  );
}
