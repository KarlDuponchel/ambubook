"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Camera } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PageHeader, Card, CardHeader, CardContent, LoadingSpinner, useToast } from "@/components/ui";

export default function ProfilPage() {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const user = session.data.user as {
            name: string;
            email: string;
            phone?: string;
          };
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
          });
        }
      } catch {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Sauvegarder les modifications
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Chargement du profil..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        subtitle="Gérez vos informations personnelles"
        actions={
          !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Modifier
            </button>
          )
        }
      />

      {/* Photo de profil */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-neutral-50 transition-colors">
                <Camera className="h-4 w-4 text-neutral-600" />
              </button>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900">{formData.name}</p>
              <p className="text-neutral-500">Ambulancier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader icon={User} title="Informations personnelles" />
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom complet
                </label>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adresse email
                </label>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Téléphone
                </label>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-neutral-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Non renseigné"
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {isEditing && (
            <div className="px-6 py-4 border-t border-card-border flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          )}
        </Card>
      </form>

      {/* Sécurité */}
      <Card>
        <CardHeader icon={Lock} title="Sécurité" />
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Mot de passe</p>
              <p className="text-sm text-neutral-500">
                Dernière modification il y a 30 jours
              </p>
            </div>
            <button className="px-4 py-2 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              Changer le mot de passe
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
