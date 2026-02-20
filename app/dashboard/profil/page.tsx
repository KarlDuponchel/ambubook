"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Lock, Save, Camera, Loader2 } from "lucide-react";
import { PageHeader, Card, CardHeader, CardContent, LoadingSpinner, useToast } from "@/components/ui";
import { ChangePasswordModal } from "@/components/auth";

export default function ProfilPage() {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/ambulancier/me");
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json() as {
          name: string;
          email: string;
          phone: string | null;
          imageUrl: string | null;
        };
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setImageUrl(data.imageUrl);
      } catch {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/ambulancier/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, phone: formData.phone }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/ambulancier/me/image", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      const data = await res.json() as { imageUrl: string };
      setImageUrl(data.imageUrl);
      toast.success("Photo de profil mise à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploadingImage(false);
      // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Photo de profil"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Overlay de chargement pendant l'upload */}
              {isUploadingImage && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 p-2 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
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
                    disabled
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
                disabled={isSaving}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </>
                )}
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
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Changer le mot de passe
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => toast.success("Mot de passe modifié avec succès")}
      />
    </div>
  );
}
