"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Globe, Moon, Mail, MessageSquare, Calendar, Megaphone, Loader2 } from "lucide-react";
import { PageHeader, Card, CardHeader, CardContent } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  transportUpdates: boolean;
  transportReminders: boolean;
  marketing: boolean;
}

export default function ParametresPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    transportUpdates: true,
    transportReminders: true,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: "fr",
  });

  // Charger les préférences au montage
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications({
            emailEnabled: data.emailEnabled,
            smsEnabled: data.smsEnabled,
            transportUpdates: data.transportUpdates,
            transportReminders: data.transportReminders,
            marketing: data.marketing,
          });
        }
      } catch (error) {
        console.error("Erreur chargement préférences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        subtitle="Configurez vos préférences et notifications"
      />

      {/* Canaux de notification */}
      <Card>
        <CardHeader icon={Bell} title="Canaux de notification" />
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Types de notifications */}
      <Card>
        <CardHeader icon={Bell} title="Types de notifications" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Mises à jour des transports</p>
                  <p className="text-sm text-neutral-500">
                    Nouvelles demandes, réponses des clients, etc.
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
                    Rappels la veille des transports
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
                  <p className="font-medium text-neutral-900">Communications marketing</p>
                  <p className="text-sm text-neutral-500">
                    Actualités, conseils et offres AmbuBook
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
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader icon={Shield} title="Préférences" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Langue</p>
                  <p className="text-sm text-neutral-500">
                    Choisissez la langue de l&apos;interface
                  </p>
                </div>
              </div>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
                className="px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Mode sombre</p>
                  <p className="text-sm text-neutral-500">
                    Activez le thème sombre (bientôt disponible)
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={preferences.darkMode}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions dangereuses */}
      <div className="rounded-xl border border-danger-200 bg-card-bg">
        <div className="px-6 py-4 border-b border-danger-200">
          <h2 className="text-lg font-semibold text-danger-600">Zone de danger</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-neutral-600 mb-4">
            Ces actions sont irréversibles. Procédez avec précaution.
          </p>
          <button className="px-4 py-2 text-sm font-medium text-danger-600 border border-danger-300 rounded-lg hover:bg-danger-50 transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
