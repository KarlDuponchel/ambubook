"use client";

import { useState } from "react";
import { Bell, Shield, Globe, Moon, Mail, MessageSquare } from "lucide-react";
import { PageHeader, Card, CardHeader, CardContent } from "@/components/ui";

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const [preferences, setPreferences] = useState({
    autoAccept: false,
    darkMode: false,
    language: "fr",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        subtitle="Configurez vos préférences et notifications"
      />

      {/* Notifications */}
      <Card>
        <CardHeader icon={Bell} title="Notifications" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Notifications par email</p>
                  <p className="text-sm text-neutral-500">
                    Recevez les nouvelles demandes par email
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications({ ...notifications, email: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Notifications push</p>
                  <p className="text-sm text-neutral-500">
                    Recevez des alertes en temps réel
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) =>
                    setNotifications({ ...notifications, push: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Notifications SMS</p>
                  <p className="text-sm text-neutral-500">
                    Recevez des SMS pour les urgences
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) =>
                    setNotifications({ ...notifications, sms: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
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
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5" />
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
