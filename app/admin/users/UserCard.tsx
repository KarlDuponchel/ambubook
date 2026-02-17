import { User } from "./page";

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onSetOwner: () => void;
}

export default function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  onSetOwner,
}: UserCardProps) {
  const isAdmin = user.role === "ADMIN";
  const isOwner = user.isCompanyOwner;
  const canBeOwner = user.companyId && !isOwner && user.role === "AMBULANCIER";

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 border-l-4 ${
        !user.isActive
          ? "border-amber-500"
          : isAdmin
            ? "border-purple-500"
            : "border-blue-500"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              isAdmin ? "bg-purple-500" : "bg-blue-500"
            }`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            !user.isActive
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {user.isActive ? "Actif" : "En attente"}
        </span>
      </div>

      {/* Infos */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <span>🏢</span>
          <span>{user.company?.name || "Aucune société"}</span>
          {isOwner && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
              Gérant
            </span>
          )}
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📱</span>
            <span>{user.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <span>{isAdmin ? "👑" : "🚑"}</span>
          <span>{isAdmin ? "Administrateur" : "Ambulancier"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onToggleActive}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            user.isActive
              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {user.isActive ? "Désactiver" : "Activer"}
        </button>
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          🗑️
        </button>
        {canBeOwner && (
          <button
            onClick={onSetOwner}
            className="w-full px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
          >
            👑 Définir comme gérant
          </button>
        )}
      </div>
    </div>
  );
}
