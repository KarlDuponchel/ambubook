"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ChangePasswordModal } from "@/components/auth";

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
}

export default function ProfilClientPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.status === 401) {
          router.push("/connexion?redirect=/mon-compte/profil");
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json() as UserProfile;
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setImageUrl(data.imageUrl);
      } catch {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/me", {
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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/me/image", { method: "POST", body: fd });
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const initials = formData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          <h1 className="text-2xl font-bold text-neutral-900">Mon profil</h1>
          <p className="text-neutral-600">Gérez vos informations personnelles</p>
        </div>
      </div>

      {/* Photo de profil */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Photo de profil"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-semibold shadow-sm">
                {initials}
              </div>
            )}

            {isUploadingImage && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
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
              className="absolute bottom-0 right-0 p-1.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-neutral-600" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{formData.name}</p>
            <p className="text-sm text-neutral-500">{formData.email}</p>
            <p className="text-xs text-neutral-400 mt-1">
              JPEG, PNG ou WebP · max 5 Mo
            </p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-neutral-400" />
              <h2 className="font-semibold text-neutral-900">Informations personnelles</h2>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nom complet
              </label>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Adresse email
              </label>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-400 ml-7">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Téléphone
              </label>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Non renseigné"
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
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
        </div>
      </form>

      {/* Sécurité */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <Lock className="h-5 w-5 text-neutral-400" />
          <h2 className="font-semibold text-neutral-900">Sécurité</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Mot de passe</p>
              <p className="text-sm text-neutral-500">
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => toast.success("Mot de passe modifié avec succès")}
      />
    </div>
  );
}
