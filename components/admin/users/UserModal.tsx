"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminUser, AdminCompany, UserRole } from "@/lib/types";

interface UserModalProps {
  user: AdminUser;
  companies: AdminCompany[];
  onClose: () => void;
  onSave: (userData: Partial<AdminUser>) => void;
}

export function UserModal({ user, companies, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    isActive: user.isActive,
    companyId: user.companyId || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      role: formData.role,
      isActive: formData.isActive,
      companyId: formData.companyId || null,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">
            Modifier l&apos;utilisateur
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="CUSTOMER">Client</option>
                <option value="AMBULANCIER">Ambulancier</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Société
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyId: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">Aucune</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-neutral-900" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-neutral-700">
              Compte {formData.isActive ? "actif" : "inactif"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors font-medium text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
