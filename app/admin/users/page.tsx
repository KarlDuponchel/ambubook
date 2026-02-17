"use client";

import { useState, useEffect, useCallback } from "react";
import UserCard from "./UserCard";
import UserModal from "./UserModal";
import DeleteModal from "./DeleteModal";

interface Company {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "AMBULANCIER";
  isActive: boolean;
  createdAt: string;
  company: Company | null;
  companyId: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const response = await fetch(`/api/admin/users?${params}`);
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
    setLoading(false);
  }, [search]);

  const fetchCompanies = async () => {
    const response = await fetch("/api/admin/companies");
    if (response.ok) {
      const data = await response.json();
      setCompanies(data);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const handleToggleActive = async (user: User) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    if (response.ok) {
      fetchUsers();
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!editingUser) return;

    const response = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setDeletingUser(null);
      fetchUsers();
    }
  };

  const pendingCount = users.filter((u) => !u.isActive).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 mt-1">
            {users.length} utilisateur{users.length > 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600">
                ({pendingCount} en attente)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou société..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Grille des utilisateurs */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => setEditingUser(user)}
              onDelete={() => setDeletingUser(user)}
              onToggleActive={() => handleToggleActive(user)}
            />
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      {editingUser && (
        <UserModal
          user={editingUser}
          companies={companies}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal de suppression */}
      {deletingUser && (
        <DeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
