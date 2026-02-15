"use client";

import { useState, useEffect } from "react";
import { UserPlus, Copy, Link as LinkIcon, Trash2, Check } from "lucide-react";
import type { Invitation } from "@/lib/types";
import { PageHeader, Card, CardHeader, CardContent, EmptyState, LoadingSpinner, StatusBadge } from "@/components/ui";

export default function InvitePage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchInvitations = async () => {
    const response = await fetch("/api/invitations");
    if (response.ok) {
      const data = await response.json();
      setInvitations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

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

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyCode = (code: string) => handleCopy(code, `code-${code}`);

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/dashboard/signup?code=${code}`;
    handleCopy(link, `link-${code}`);
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

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement des invitations..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inviter un collaborateur"
        subtitle="Partagez un code pour que vos collègues rejoignent votre société"
      />

      {/* Bouton créer invitation */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-neutral-900">Générer un code d&apos;invitation</h2>
              <p className="text-sm text-neutral-500">Le code sera valide pendant 7 jours</p>
            </div>
            <button
              onClick={handleCreateInvitation}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {creating ? "Génération..." : "Générer un code"}
            </button>
          </div>

          {/* Nouveau code généré */}
          {newCode && (
            <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm text-success-700 mb-3">Code généré avec succès !</p>
              <div className="flex items-center gap-4 flex-wrap">
                <code className="text-2xl font-mono font-bold text-success-800 tracking-widest">
                  {newCode}
                </code>
                <button
                  onClick={() => handleCopyCode(newCode)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                >
                  {copied === `code-${newCode}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === `code-${newCode}` ? "Copié !" : "Copier le code"}
                </button>
                <button
                  onClick={() => handleCopyLink(newCode)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors"
                >
                  {copied === `link-${newCode}` ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  {copied === `link-${newCode}` ? "Copié !" : "Copier le lien"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des invitations */}
      <Card>
        <CardHeader title="Invitations créées" />

        {invitations.length === 0 ? (
          <CardContent>
            <EmptyState description="Aucune invitation créée" />
          </CardContent>
        ) : (
          <div className="divide-y divide-card-border">
            {invitations.map((invitation) => {
              const expired = isExpired(invitation.expiresAt);
              const used = !!invitation.usedAt;

              return (
                <div
                  key={invitation.id}
                  className={`p-4 flex items-center justify-between ${
                    expired || used ? "bg-neutral-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <code
                      className={`text-lg font-mono font-bold tracking-widest ${
                        expired || used ? "text-neutral-400" : "text-neutral-900"
                      }`}
                    >
                      {invitation.code}
                    </code>
                    <div className="flex items-center gap-2">
                      {used ? (
                        <StatusBadge variant="completed" label="Utilisé" size="sm" />
                      ) : expired ? (
                        <StatusBadge variant="neutral" label="Expiré" size="sm" />
                      ) : (
                        <StatusBadge variant="success" label="Actif" size="sm" />
                      )}
                      <span className="text-xs text-neutral-500">
                        Expire le {formatDate(invitation.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!used && !expired && (
                      <>
                        <button
                          onClick={() => handleCopyCode(invitation.code)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Copier le code"
                        >
                          {copied === `code-${invitation.code}` ? (
                            <Check className="h-4 w-4 text-success-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyLink(invitation.code)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Copier le lien"
                        >
                          {copied === `link-${invitation.code}` ? (
                            <Check className="h-4 w-4 text-success-600" />
                          ) : (
                            <LinkIcon className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteInvitation(invitation.code)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
