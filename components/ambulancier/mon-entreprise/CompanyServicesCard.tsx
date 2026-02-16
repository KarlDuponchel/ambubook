"use client";

import { useState } from "react";
import { Ambulance, Calendar, MapPin, Users, Car, Save, X, Pencil } from "lucide-react";
import { CompanyFull } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui";

interface CompanyServicesCardProps {
  company: CompanyFull;
  isOwner: boolean;
  onUpdate: (data: Partial<CompanyFull>) => Promise<void>;
}

export function CompanyServicesCard({ company, isOwner, onUpdate }: CompanyServicesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hasAmbulance: company.hasAmbulance,
    hasVSL: company.hasVSL,
    acceptsOnlineBooking: company.acceptsOnlineBooking,
    foundedYear: company.foundedYear?.toString() || "",
    fleetSize: company.fleetSize?.toString() || "",
    coverageRadius: company.coverageRadius?.toString() || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        hasAmbulance: formData.hasAmbulance,
        hasVSL: formData.hasVSL,
        acceptsOnlineBooking: formData.acceptsOnlineBooking,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        fleetSize: formData.fleetSize ? parseInt(formData.fleetSize) : null,
        coverageRadius: formData.coverageRadius ? parseInt(formData.coverageRadius) : null,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      hasAmbulance: company.hasAmbulance,
      hasVSL: company.hasVSL,
      acceptsOnlineBooking: company.acceptsOnlineBooking,
      foundedYear: company.foundedYear?.toString() || "",
      fleetSize: company.fleetSize?.toString() || "",
      coverageRadius: company.coverageRadius?.toString() || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader
        icon={Ambulance}
        title="Services & Informations"
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
        {/* Services */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Services proposés
          </h3>
          <div className="flex flex-wrap gap-3">
            {/* Ambulance */}
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                formData.hasAmbulance
                  ? "bg-primary-50 border-primary-300 text-primary-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500"
              } ${!isEditing ? "cursor-default" : ""}`}
            >
              <input
                type="checkbox"
                checked={formData.hasAmbulance}
                onChange={(e) => setFormData({ ...formData, hasAmbulance: e.target.checked })}
                disabled={!isEditing}
                className="sr-only"
              />
              <Ambulance className="h-5 w-5" />
              <span className="font-medium">Ambulance</span>
            </label>

            {/* VSL */}
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                formData.hasVSL
                  ? "bg-success-50 border-success-300 text-success-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500"
              } ${!isEditing ? "cursor-default" : ""}`}
            >
              <input
                type="checkbox"
                checked={formData.hasVSL}
                onChange={(e) => setFormData({ ...formData, hasVSL: e.target.checked })}
                disabled={!isEditing}
                className="sr-only"
              />
              <Car className="h-5 w-5" />
              <span className="font-medium">VSL</span>
            </label>

            {/* Réservation en ligne */}
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                formData.acceptsOnlineBooking
                  ? "bg-info-50 border-info-300 text-info-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500"
              } ${!isEditing ? "cursor-default" : ""}`}
            >
              <input
                type="checkbox"
                checked={formData.acceptsOnlineBooking}
                onChange={(e) => setFormData({ ...formData, acceptsOnlineBooking: e.target.checked })}
                disabled={!isEditing}
                className="sr-only"
              />
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Réservation en ligne</span>
            </label>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Informations complémentaires
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Année de création */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Année de création
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                  disabled={!isEditing}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="flex-1 px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  placeholder="2010"
                />
              </div>
            </div>

            {/* Taille de la flotte */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Véhicules
              </label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  value={formData.fleetSize}
                  onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                  disabled={!isEditing}
                  min="1"
                  className="flex-1 px-3 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Rayon de couverture */}
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Rayon (km)
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  value={formData.coverageRadius}
                  onChange={(e) => setFormData({ ...formData, coverageRadius: e.target.value })}
                  disabled={!isEditing}
                  min="1"
                  className="flex-1 px-3 py-2 border w-full border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </div>
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
