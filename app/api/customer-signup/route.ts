import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Schéma de validation pour l'inscription customer
 */
const signUpSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  phone: z.string().optional(),
});

/**
 * POST /api/customer-signup
 * Inscription d'un nouveau customer (patient)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validation des données
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validation.data;

    // 2. Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // 3. Créer l'utilisateur via Better Auth (avec phone dans les champs additionnels)
    const signUpResponse = await auth.api.signUpEmail({
      body: { name, email, password, phone: phone || undefined },
    });

    if (!signUpResponse.user) {
      return NextResponse.json(
        { error: "Échec de la création du compte" },
        { status: 500 }
      );
    }

    // 4. S'assurer que le rôle est CUSTOMER (Better Auth ne le set pas automatiquement)
    await prisma.user.update({
      where: { id: signUpResponse.user.id },
      data: {
        role: "CUSTOMER",
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription customer:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
