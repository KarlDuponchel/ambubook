"use client";

import { useState } from "react";
import { FileText, Save, X, Pencil } from "lucide-react";
import { CompanyFull } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui";

interface CompanyDescriptionCardProps {
  company: CompanyFull;
  isOwner: boolean;
  onUpdate: (data: Partial<CompanyFull>) => Promise<void>;
}

export function CompanyDescriptionCard({ company, isOwner, onUpdate }: CompanyDescriptionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState(company.description || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ description: description || null });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription(company.description || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader
        icon={FileText}
        title="Description"
        action={
          isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          )
        }
      />
      <CardContent>
        {isEditing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Décrivez votre entreprise, vos services, votre zone d'intervention..."
          />
        ) : (
          <div className="min-h-25">
            {company.description ? (
              <p className="text-neutral-700 whitespace-pre-wrap">{company.description}</p>
            ) : (
              <p className="text-neutral-400 italic">
                {isOwner
                  ? "Cliquez sur Modifier pour ajouter une description de votre entreprise."
                  : "Aucune description disponible."}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {isEditing && (
        <div className="px-6 py-4 border-t border-card-border flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}
    </Card>
  );
}
