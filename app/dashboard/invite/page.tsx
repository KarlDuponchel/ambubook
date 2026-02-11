"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface Invitation {
  id: string;
  code: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export default function InvitePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchInvitations = async () => {
    const response = await fetch("/api/invitations");
    if (response.ok) {
      const data = await response.json();
      setInvitations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchInvitations();
    }
  }, [session]);

  const handleCreateInvitation = async () => {
    setCreating(true);
    const response = await fetch("/api/invitations", {
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setNewCode(data.code);
      fetchInvitations();
    }
    setCreating(false);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async (code: string) => {
    const link = `${window.location.origin}/signup?code=${code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteInvitation = async (code: string) => {
    const response = await fetch(`/api/invitations/${code}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchInvitations();
      if (newCode === code) setNewCode(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (dateString: string) => new Date() > new Date(dateString);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inviter un collaborateur</h1>
            <p className="text-sm text-gray-500">Partagez un code pour que vos collègues rejoignent votre société</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton créer invitation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Générer un code d'invitation</h2>
              <p className="text-sm text-gray-500">Le code sera valide pendant 7 jours</p>
            </div>
            <button
              onClick={handleCreateInvitation}
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? "Génération..." : "Générer un code"}
            </button>
          </div>

          {/* Nouveau code généré */}
          {newCode && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 mb-2">Code généré avec succès !</p>
              <div className="flex items-center gap-4">
                <code className="text-2xl font-mono font-bold text-green-800 tracking-widest">
                  {newCode}
                </code>
                <button
                  onClick={() => handleCopyCode(newCode)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {copied ? "Copié !" : "Copier le code"}
                </button>
                <button
                  onClick={() => handleCopyLink(newCode)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Copier le lien
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des invitations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Invitations créées</h2>
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune invitation créée
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {invitations.map((invitation) => {
                const expired = isExpired(invitation.expiresAt);
                const used = !!invitation.usedAt;

                return (
                  <div
                    key={invitation.id}
                    className={`p-4 flex items-center justify-between ${
                      expired || used ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <code
                        className={`text-lg font-mono font-bold tracking-widest ${
                          expired || used ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {invitation.code}
                      </code>
                      <div>
                        {used ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            Utilisé
                          </span>
                        ) : expired ? (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Expiré
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Actif
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-500">
                          Expire le {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!used && !expired && (
                        <>
                          <button
                            onClick={() => handleCopyCode(invitation.code)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Copier
                          </button>
                          <button
                            onClick={() => handleCopyLink(invitation.code)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Lien
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteInvitation(invitation.code)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
