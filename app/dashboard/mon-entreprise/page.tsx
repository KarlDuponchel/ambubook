"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, FileText, Save } from "lucide-react";
import { UsersCompany } from "@/components/ambulancier/mon-entreprise/UsersCompany";
import { UserData } from "@/lib/types";
import { PageHeader, Card, CardHeader, CardContent } from "@/components/ui";

export default function MonEntreprisePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Ambulances Dupont",
    address: "15 Rue de la Santé",
    city: "Paris",
    postalCode: "75013",
    phone: "01 23 45 67 89",
    email: "contact@ambulances-dupont.fr",
    siret: "123 456 789 00012",
  });

  const [employees, setEmployees] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/companies/users");
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des employés:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Sauvegarder les modifications
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon entreprise"
        subtitle="Gérez les informations de votre société d'ambulances"
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

      {/* Informations de l'entreprise */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader icon={Building2} title="Informations générales" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  SIRET
                </label>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adresse
                </label>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
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
                    className="flex-1 px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
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

      {/* Équipe */}
      <UsersCompany employees={employees} />
    </div>
  );
}
