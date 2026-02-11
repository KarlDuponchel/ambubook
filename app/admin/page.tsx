"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Utilisateurs</h2>
              <p className="text-sm text-gray-500">Gérer les comptes</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              🏢
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Sociétés</h2>
              <p className="text-sm text-gray-500">Bientôt disponible</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
              🚑
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Transports</h2>
              <p className="text-sm text-gray-500">Bientôt disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
