"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ChangePasswordModal } from "@/components/auth";
import Image from "next/image";

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
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const initials = formData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const labelClass =
    "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";
  const fieldBase =
    "w-full px-3.5 py-3 border rounded-xl text-[15px] outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Mon compte
        </Link>
        <h1 className="serif text-3xl text-ink">Mon profil</h1>
        <p className="text-ink-2 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Photo de profil */}
      <div className="bg-surface rounded-2xl border border-line shadow-soft p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Photo de profil"
                className="h-20 w-20 rounded-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}
              >
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
              className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-8 h-8 bg-brand text-white border-[3px] border-surface rounded-full hover:bg-brand-ink transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-bold text-ink">Photo de profil</p>
            <p className="text-sm text-ink-2">{formData.email}</p>
            <p className="text-[13px] text-ink-3 mt-1">
              JPEG, PNG ou WebP · max 5 Mo
            </p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={handleSubmit}>
        <div className="bg-surface rounded-2xl border border-line shadow-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink">Informations personnelles</h2>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 bg-surface-2 border border-line rounded-lg px-3 py-1.5 text-[13px] font-bold text-ink hover:border-brand transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className={labelClass}>Nom complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={`${fieldBase} border-line text-ink bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-surface-2 disabled:text-ink-2`}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
                Adresse email{" "}
                <span className="font-medium normal-case text-ink-3">· non modifiable</span>
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className={`${fieldBase} border-line bg-surface-2 text-ink-3`}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Non renseigné"
                className={`${fieldBase} border-line text-ink bg-surface placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-surface-2 disabled:text-ink-2`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-ink bg-surface-2 border border-line rounded-xl hover:border-brand transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-brand text-white rounded-xl hover:bg-brand-ink transition-colors disabled:opacity-50"
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
      <div className="bg-surface rounded-2xl border border-line shadow-soft p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-ink">Sécurité</p>
          <p className="text-sm text-ink-2">Mot de passe et connexion</p>
        </div>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-ink bg-surface-2 border border-line rounded-xl hover:border-brand transition-colors whitespace-nowrap"
        >
          <Lock className="h-4 w-4" />
          Changer le mot de passe
        </button>
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
