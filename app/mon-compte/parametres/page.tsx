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
  Settings,
  Download,
  Trash2,
  Shield,
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
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/mon-compte"
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Paramètres</h1>
          <p className="text-neutral-600">Gérez vos préférences de notification</p>
        </div>
      </div>

      {/* Canaux de notification */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <Settings className="h-5 w-5 text-neutral-400" />
          <h2 className="font-semibold text-neutral-900">Canaux de notification</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Notifications par email</p>
                <p className="text-sm text-neutral-500">
                  Recevez les notifications par email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailEnabled}
                onChange={(e) => updateNotification("emailEnabled", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Notifications SMS</p>
                <p className="text-sm text-neutral-500">
                  Recevez les notifications par SMS
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.smsEnabled}
                onChange={(e) => updateNotification("smsEnabled", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
            </label>
          </div>
        </div>
      </div>

      {/* Types de notifications */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <Bell className="h-5 w-5 text-neutral-400" />
          <h2 className="font-semibold text-neutral-900">Types de notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Mises à jour des transports</p>
                <p className="text-sm text-neutral-500">
                  Confirmations, refus, contre-propositions
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.transportUpdates}
                onChange={(e) => updateNotification("transportUpdates", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Rappels de transport</p>
                <p className="text-sm text-neutral-500">
                  Rappels la veille de vos transports
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.transportReminders}
                onChange={(e) => updateNotification("transportReminders", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">Newsletter AmbuBook</p>
                <p className="text-sm text-neutral-500">
                  Actualités et conseils santé
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.marketing}
                onChange={(e) => updateNotification("marketing", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
            </label>
          </div>
        </div>
      </div>

      {/* Donnees personnelles (RGPD) */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <Shield className="h-5 w-5 text-neutral-400" />
          <h2 className="font-semibold text-neutral-900">Vos donnees personnelles</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Export des donnees */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">Exporter mes donnees</p>
                <p className="text-sm text-neutral-500">
                  Telechargez une copie de toutes vos donnees personnelles (profil, adresses, transports) au format JSON.
                </p>
              </div>
            </div>
            <button
              onClick={exportData}
              disabled={exporting}
              className="shrink-0 px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export...
                </span>
              ) : (
                "Exporter"
              )}
            </button>
          </div>

          {/* Suppression du compte */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">Supprimer mon compte</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Vos données personnelles seront définitivement anonymisées. L&apos;historique
                  des transports est conservé sous forme anonymisée pour les obligations légales
                  de l&apos;ambulancier. Cette action est irréversible.
                </p>

                {!confirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer mon compte
                  </button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-red-600">
                      Confirmer la suppression définitive ?
                    </span>
                    <button
                      type="button"
                      onClick={deleteAccount}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Oui, supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
