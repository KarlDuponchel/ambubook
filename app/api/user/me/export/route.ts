import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * GET /api/user/me/export
 * Export des donnees personnelles de l'utilisateur (RGPD - droit a la portabilite)
 * Retourne un JSON avec toutes les donnees personnelles de l'utilisateur
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.user.id;

    // Recuperer toutes les donnees personnelles de l'utilisateur
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        // Adresses enregistrees
        addresses: {
          select: {
            id: true,
            label: true,
            type: true,
            address: true,
            city: true,
            postalCode: true,
            details: true,
            isDefault: true,
            createdAt: true,
          },
        },

        // Preferences de notifications
        notificationPreferences: {
          select: {
            emailEnabled: true,
            smsEnabled: true,
            inappEnabled: true,
            transportUpdates: true,
            transportReminders: true,
            marketing: true,
          },
        },

        // Demandes de transport (uniquement les donnees du patient)
        transportRequests: {
          select: {
            id: true,
            trackingId: true,
            status: true,
            patientFirstName: true,
            patientLastName: true,
            patientPhone: true,
            patientEmail: true,
            patientBirthDate: true,
            transportType: true,
            tripType: true,
            requestedDate: true,
            requestedTime: true,
            returnDate: true,
            returnTime: true,
            hasTransportVoucher: true,
            mobilityType: true,
            needsAccompanist: true,
            accompanistName: true,
            pickupAddress: true,
            pickupCity: true,
            pickupPostalCode: true,
            pickupDetails: true,
            destinationAddress: true,
            destinationCity: true,
            destinationPostalCode: true,
            destinationDetails: true,
            reason: true,
            notes: true,
            createdAt: true,
            // Nom de la societe d'ambulances (sans donnees sensibles)
            company: {
              select: {
                name: true,
                city: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },

        // Feedbacks soumis
        feedbacks: {
          select: {
            id: true,
            type: true,
            subject: true,
            message: true,
            pageUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 });
    }

    // Formater les donnees pour l'export
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportFormat: "RGPD Data Export",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        accountCreatedAt: userData.createdAt,
        lastUpdatedAt: userData.updatedAt,
      },
      addresses: userData.addresses,
      notificationPreferences: userData.notificationPreferences || {
        emailEnabled: true,
        smsEnabled: true,
        inappEnabled: true,
        transportUpdates: true,
        transportReminders: true,
        marketing: false,
      },
      transportRequests: userData.transportRequests.map((request) => ({
        ...request,
        company: request.company.name,
        companyCity: request.company.city,
      })),
      feedbacks: userData.feedbacks,
    };

    // Retourner le JSON avec headers pour telechargement
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ambubook-export-${userId}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Erreur API GET /api/user/me/export:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
