"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Globe,
  Bell,
  Shield,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteConfig {
  id: string;
  siteName: string;
  siteLogoUrl: string | null;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  registrationEnabled: boolean;
  bookingEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  updatedAt: string;
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Charger la configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/admin/config");
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Sauvegarder la configuration
  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || "Erreur lors de la sauvegarde");
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setErrorMessage("Erreur de connexion");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour un champ
  const updateField = <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setSaveStatus("idle");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement de la configuration...</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-500">Impossible de charger la configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Paramètres généraux et feature flags de la plateforme
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            saveStatus === "success"
              ? "bg-green-600 text-white"
              : saveStatus === "error"
              ? "bg-red-600 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveStatus === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : saveStatus === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Sauvegarde..." : saveStatus === "success" ? "Sauvegardé" : "Sauvegarder"}
        </button>
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode Maintenance - Alert prominente */}
      {config.maintenanceMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Mode maintenance actif</h3>
            <p className="text-sm text-amber-700 mt-1">
              Le site est actuellement inaccessible aux visiteurs. Seuls les administrateurs peuvent y accéder.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres généraux */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-neutral-600" />
            <h2 className="font-semibold text-neutral-900">Paramètres généraux (non fonctionnel)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nom de la plateforme
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                URL du logo
              </label>
              <input
                type="text"
                value={config.siteLogoUrl || ""}
                onChange={(e) => updateField("siteLogoUrl", e.target.value || null)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Emails de contact */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-5 w-5 text-neutral-600" />
            <h2 className="font-semibold text-neutral-900">Emails de contact (non fonctionnel)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Affiché sur la page de contact et dans les emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email de support
              </label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => updateField("supportEmail", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Pour les demandes de support technique
              </p>
            </div>
          </div>
        </div>

        {/* Mode Maintenance */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-neutral-600" />
            <h2 className="font-semibold text-neutral-900">Mode maintenance</h2>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              label="Activer le mode maintenance"
              description="Bloque l'accès au site pour les non-administrateurs"
              checked={config.maintenanceMode}
              onChange={(checked) => updateField("maintenanceMode", checked)}
              variant={config.maintenanceMode ? "warning" : "default"}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Message de maintenance
              </label>
              <textarea
                value={config.maintenanceMessage || ""}
                onChange={(e) => updateField("maintenanceMessage", e.target.value || null)}
                placeholder="Le site est actuellement en maintenance. Veuillez réessayer plus tard."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-neutral-600" />
            <h2 className="font-semibold text-neutral-900">Feature flags (non fonctionnel)</h2>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              label="Inscriptions ouvertes"
              description="Permettre aux nouveaux utilisateurs de créer un compte"
              checked={config.registrationEnabled}
              onChange={(checked) => updateField("registrationEnabled", checked)}
            />

            <ToggleSwitch
              label="Réservations en ligne"
              description="Permettre aux visiteurs de réserver un transport"
              checked={config.bookingEnabled}
              onChange={(checked) => updateField("bookingEnabled", checked)}
            />

            <div className="border-t border-neutral-100 pt-4 mt-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Notifications
              </p>

              <div className="space-y-4">
                <ToggleSwitch
                  label="Notifications Email"
                  description="Envoyer des emails de notification"
                  checked={config.emailEnabled}
                  onChange={(checked) => updateField("emailEnabled", checked)}
                />

                <ToggleSwitch
                  label="Notifications SMS"
                  description="Envoyer des SMS de notification (Twilio)"
                  checked={config.smsEnabled}
                  onChange={(checked) => updateField("smsEnabled", checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dernière mise à jour */}
      <div className="text-center text-sm text-neutral-400">
        Dernière mise à jour : {new Date(config.updatedAt).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

// Composant Toggle Switch
function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  variant = "default",
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: "default" | "warning";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked
            ? variant === "warning"
              ? "bg-amber-500"
              : "bg-neutral-900"
            : "bg-neutral-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
        <span className="sr-only">{label}</span>
        {checked ? (
          <ToggleRight className="absolute right-0.5 h-3 w-3 text-white opacity-0" />
        ) : (
          <ToggleLeft className="absolute left-0.5 h-3 w-3 text-neutral-400 opacity-0" />
        )}
      </button>
    </div>
  );
}
