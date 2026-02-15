import { User, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { UserData } from "@/lib/types";

export const UsersCompany = ({ employees }: { employees: UserData[] }) => {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl">
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">
                Équipe ({employees.length} membres)
            </h2>
            </div>
            <Link href="/dashboard/invite" className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <UserPlus className="h-4 w-4" />
            Inviter
            </Link>
        </div>
        <div className="divide-y divide-card-border">
            {employees.map((employee) => (
            <div key={employee.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                    {employee.name.charAt(0)}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-neutral-900">{employee.name}</p>
                    <p className="text-sm text-neutral-500">{employee.email}</p>
                </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full">
                {employee.role}
                </span>
            </div>
            ))}
        </div>
    </div>
)};