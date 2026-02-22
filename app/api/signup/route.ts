import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { notifyAdminNewSignup, notifyUserSignupPending } from "@/lib/email";
import { notifyWelcomeAmbulancier } from "@/lib/notifications";

/**
 * Schéma de validation pour l'inscription
 */
const signUpSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  phone: z.string().optional(),
  // Champs pour nouvelle société (optionnels si inviteCode fourni)
  companyName: z.string().optional(),
  companySiret: z.string().optional(),
  companyLicenseNumber: z.string().optional(), // N° agrément ARS
  // Code d'invitation (optionnel)
  inviteCode: z.string().optional(),
});

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

    const { name, email, password, phone, companyName, companySiret, companyLicenseNumber, inviteCode } = validation.data;

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

    // 3. Déterminer le mode d'inscription
    const hasInviteCode = inviteCode && inviteCode.trim().length > 0;

    if (hasInviteCode) {
      // ===== MODE INVITATION =====
      return handleInviteSignup({
        name,
        email,
        password,
        phone,
        inviteCode: inviteCode.toUpperCase(),
      });
    } else {
      // ===== MODE NOUVELLE SOCIÉTÉ =====
      if (!companyName || companyName.trim().length < 2) {
        return NextResponse.json(
          { error: "Le nom de la société est requis" },
          { status: 400 }
        );
      }

      if (!companySiret || companySiret.trim().length === 0) {
        return NextResponse.json(
          { error: "Le numéro SIRET est requis" },
          { status: 400 }
        );
      }

      // Validation format SIRET (14 chiffres)
      const siretClean = companySiret.replace(/\s/g, "");
      if (!/^\d{14}$/.test(siretClean)) {
        return NextResponse.json(
          { error: "Le SIRET doit contenir 14 chiffres" },
          { status: 400 }
        );
      }

      if (!companyLicenseNumber || companyLicenseNumber.trim().length === 0) {
        return NextResponse.json(
          { error: "Le numéro d'agrément ARS est requis" },
          { status: 400 }
        );
      }

      return handleNewCompanySignup({
        name,
        email,
        password,
        phone,
        companyName,
        companySiret: siretClean,
        companyLicenseNumber,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}

/**
 * Inscription avec code d'invitation (rejoindre une société existante)
 */
async function handleInviteSignup(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  inviteCode: string;
}) {
  const { name, email, password, phone, inviteCode } = params;

  // Vérifier le code d'invitation
  const invitation = await prisma.invitation.findUnique({
    where: { code: inviteCode },
    include: { company: true },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Code d'invitation invalide" },
      { status: 400 }
    );
  }

  if (invitation.usedAt) {
    return NextResponse.json(
      { error: "Ce code d'invitation a déjà été utilisé" },
      { status: 400 }
    );
  }

  if (new Date() > invitation.expiresAt) {
    return NextResponse.json(
      { error: "Ce code d'invitation a expiré" },
      { status: 400 }
    );
  }

  // Créer l'utilisateur et marquer l'invitation comme utilisée
  const result = await prisma.$transaction(async (tx) => {
    // Créer l'utilisateur via Better Auth
    const signUpResponse = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!signUpResponse.user) {
      throw new Error("Échec de la création du compte");
    }

    // Mettre à jour l'utilisateur avec companyId, phone, role et isActive=true
    const user = await tx.user.update({
      where: { id: signUpResponse.user.id },
      data: {
        companyId: invitation.companyId,
        phone: phone || null,
        role: "AMBULANCIER", // Rôle ambulancier explicite
        isActive: true, // Compte actif directement car invité
      },
    });

    // Si la société n'a pas encore d'owner, ce premier utilisateur devient owner
    let updatedCompany = invitation.company;
    if (!invitation.company.ownerId) {
      updatedCompany = await tx.company.update({
        where: { id: invitation.companyId },
        data: { ownerId: user.id },
      });
    }

    // Marquer l'invitation comme utilisée
    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        usedAt: new Date(),
        usedById: user.id,
      },
    });

    return { user, company: updatedCompany };
  });

  // Envoyer la notification de bienvenue (compte actif via invitation)
  notifyWelcomeAmbulancier({
    userName: name,
    userEmail: email,
    userPhone: phone || undefined,
    companyName: result.company.name,
    userId: result.user.id,
  }).catch((err) => {
    console.error("Erreur notification bienvenue ambulancier:", err);
  });

  return NextResponse.json(
    {
      success: true,
      message: "Compte créé avec succès",
      companySlug: result.company.slug,
      isActive: true,
    },
    { status: 201 }
  );
}

/**
 * Inscription avec création d'une nouvelle société
 */
async function handleNewCompanySignup(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName: string;
  companySiret: string;
  companyLicenseNumber: string;
}) {
  const { name, email, password, phone, companyName, companySiret, companyLicenseNumber } = params;

  // Générer le slug et vérifier son unicité
  let slug = generateSlug(companyName);
  let slugExists = await prisma.company.findUnique({
    where: { slug },
  });

  let counter = 1;
  const baseSlug = slug;
  while (slugExists) {
    slug = `${baseSlug}-${counter}`;
    slugExists = await prisma.company.findUnique({
      where: { slug },
    });
    counter++;
  }

  // Vérifier l'unicité du SIRET si fourni
  if (companySiret) {
    const existingSiret = await prisma.company.findUnique({
      where: { siret: companySiret },
    });
    if (existingSiret) {
      return NextResponse.json(
        { error: "Une société avec ce SIRET existe déjà" },
        { status: 400 }
      );
    }
  }

  // Créer la Company et le User
  const result = await prisma.$transaction(async (tx) => {
    // Créer l'utilisateur d'abord via Better Auth
    const signUpResponse = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!signUpResponse.user) {
      throw new Error("Échec de la création du compte");
    }

    // Créer la société avec cet utilisateur comme owner (premier utilisateur = gérant)
    const company = await tx.company.create({
      data: {
        name: companyName,
        slug,
        siret: companySiret,
        licenseNumber: companyLicenseNumber,
        ownerId: signUpResponse.user.id, // Premier utilisateur = owner
        onboardingStep: 0, // Déclenche l'onboarding à la première connexion
      },
    });

    // Mettre à jour l'utilisateur avec companyId, phone, role
    const user = await tx.user.update({
      where: { id: signUpResponse.user.id },
      data: {
        companyId: company.id,
        phone: phone || null,
        role: "AMBULANCIER",
        isActive: false, // Désactivé - en attente validation admin
      },
    });

    return { user, company };
  });

  // Envoyer les notifications par email
  Promise.all([
    notifyAdminNewSignup({
      userName: name,
      userEmail: email,
      companyName,
    }),
    notifyUserSignupPending({
      userName: name,
      userEmail: email,
      companyName,
    }),
  ]).catch((err) => {
    console.error("Erreur envoi emails de notification:", err);
  });

  return NextResponse.json(
    {
      success: true,
      message: "Compte créé avec succès - En attente de validation",
      companySlug: result.company.slug,
      isActive: false,
    },
    { status: 201 }
  );
}
