import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, companyId: true },
        });
        
        if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
            return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
        }

        const companyUsers = await prisma.user.findMany({
            where: { companyId: user.companyId },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json(companyUsers);
    } catch (error) {
        console.error("Erreur API /api/companies/users:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}