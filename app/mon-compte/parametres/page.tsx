"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Megaphone,
  Loader2,
  ArrowLeft,
  Download,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { signOut } from "@/lib/auth-client";

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  transportUpdates: boolean;
  transportReminders: boolean;
  marketing: boolean;
}

/** Ligne de réglage avec interrupteur éditorial. */
function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-line last:border-b-0">
      {Icon && <Icon className="h-5 w-5 text-ink-2 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-ink">{title}</p>
        <p className="text-[13px] text-ink-2">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-12 h-7 bg-surface-3 peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all peer-checked:bg-brand peer-disabled:opacity-50 transition-colors" />
      </label>
    </div>
  );
}

const sectionLabelClass =
  "text-xs font-extrabold uppercase tracking-wider text-ink-3 mb-3";

export default function ParametresClientPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    transportUpdates: true,
    transportReminders: true,
    marketing: false,
  });

  // Charger les données au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/check-status");
        const sessionData = await sessionRes.json();

        if (!sessionData.isLoggedIn) {
          router.push("/connexion?redirect=/mon-compte/parametres");
          return;
        }

        // Charger les préférences
        const prefsRes = await fetch("/api/user/notifications");
        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setNotifications({
            emailEnabled: data.emailEnabled,
            smsEnabled: data.smsEnabled,
            transportUpdates: data.transportUpdates,
            transportReminders: data.transportReminders,
            marketing: data.marketing,
          });
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Sauvegarder une préférence
  const updateNotification = async (key: keyof NotificationPreferences, value: boolean) => {
    const previousValue = notifications[key];

    // Optimistic update
    setNotifications((prev) => ({ ...prev, [key]: value }));
    setSaving(true);

    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success("Préférences mises à jour");
    } catch {
      // Rollback
      setNotifications((prev) => ({ ...prev, [key]: previousValue }));
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Exporter les donnees personnelles (RGPD)
  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/me/export");
      if (!res.ok) {
        throw new Error("Erreur lors de l'export");
      }

      // Telecharger le fichier JSON
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ambubook-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Vos donnees ont ete exportees");
    } catch {
      toast.error("Erreur lors de l'export des donnees");
    } finally {
      setExporting(false);
    }
  };

  // Supprimer (anonymiser) le compte (RGPD)
  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/me", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      // La session est invalidée côté serveur ; on nettoie le client et on redirige
      await signOut().catch(() => {});
      toast.success("Votre compte a été supprimé.");
      router.push("/");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur lors de la suppression du compte"
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Mon compte
        </Link>
        <h1 className="serif text-3xl text-ink">Paramètres</h1>
        <p className="text-ink-2 mt-1">Gérez vos préférences et vos données</p>
      </div>

      {/* Canaux de notification */}
      <div>
        <div className={sectionLabelClass}>Canaux de notification</div>
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <ToggleRow
            icon={Mail}
            title="Notifications par email"
            description="Recevez les notifications par email"
            checked={notifications.emailEnabled}
            disabled={saving}
            onChange={(v) => updateNotification("emailEnabled", v)}
          />
          <ToggleRow
            icon={MessageSquare}
            title="Notifications SMS"
            description="Recevez les notifications par SMS"
            checked={notifications.smsEnabled}
            disabled={saving}
            onChange={(v) => updateNotification("smsEnabled", v)}
          />
        </div>
      </div>

      {/* Types de notifications */}
      <div>
        <div className={sectionLabelClass}>Types de notifications</div>
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <ToggleRow
            icon={Bell}
            title="Mises à jour des transports"
            description="Confirmations, refus, contre-propositions"
            checked={notifications.transportUpdates}
            disabled={saving}
            onChange={(v) => updateNotification("transportUpdates", v)}
          />
          <ToggleRow
            icon={Calendar}
            title="Rappels de transport"
            description="Rappels la veille de vos transports"
            checked={notifications.transportReminders}
            disabled={saving}
            onChange={(v) => updateNotification("transportReminders", v)}
          />
          <ToggleRow
            icon={Megaphone}
            title="Newsletter AmbuBook"
            description="Actualités et conseils santé"
            checked={notifications.marketing}
            disabled={saving}
            onChange={(v) => updateNotification("marketing", v)}
          />
        </div>
      </div>

      {/* Donnees personnelles (RGPD) */}
      <div>
        <div className={sectionLabelClass}>Vos données personnelles</div>
        <div className="bg-surface border border-line rounded-2xl p-5">
          {/* Export des donnees */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-line">
            <div>
              <p className="font-bold text-sm text-ink">Exporter mes données</p>
              <p className="text-[13px] text-ink-2">
                Téléchargez une copie de toutes vos données personnelles (profil, adresses, transports) au format JSON (RGPD).
              </p>
            </div>
            <button
              onClick={exportData}
              disabled={exporting}
              className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-bold text-ink bg-surface-2 border border-line rounded-xl hover:border-brand transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exporter
                </>
              )}
            </button>
          </div>

          {/* Suppression du compte */}
          <div className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-rouge">Supprimer mon compte</p>
                <p className="text-[13px] text-ink-2 mt-0.5">
                  Action définitive et irréversible. Vos données seront anonymisées.
                </p>
              </div>
              {!confirmingDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="shrink-0 px-3.5 py-2.5 text-[13px] font-bold text-rouge rounded-xl border transition-colors whitespace-nowrap bg-rouge/10 border-rouge/30 hover:bg-rouge/15"
                >
                  Supprimer
                </button>
              )}
            </div>

            {confirmingDelete && (
              <div className="mt-4 bg-rouge/8 border border-rouge/25 rounded-xl p-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5 mb-3">
                  <Trash2 className="h-5 w-5 text-rouge mt-0.5 shrink-0" />
                  <p className="text-[13px] text-ink-2 leading-relaxed">
                    <strong className="text-ink">Confirmer la suppression définitive ?</strong>{" "}
                    Vos données personnelles seront anonymisées. L&apos;historique des transports
                    est conservé sous forme anonymisée pour les obligations légales. Cette action
                    est irréversible.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-ink bg-surface border border-line rounded-xl hover:border-brand transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={deleteAccount}
                    disabled={deleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-rouge rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
