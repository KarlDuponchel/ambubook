import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transportRequestSchema } from "@/lib/validations/transport-request";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation avec Zod
    const validatedData = transportRequestSchema.parse(body);

    // Vérifier que la company existe et est active
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
      select: { id: true, isActive: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Ambulancier non trouvé" },
        { status: 404 }
      );
    }

    if (!company.isActive) {
      return NextResponse.json(
        { error: "Cet ambulancier n'accepte pas de nouvelles demandes" },
        { status: 400 }
      );
    }

    // Créer la demande de transport
    const transportRequest = await prisma.transportRequest.create({
      data: {
        companyId: validatedData.companyId,

        // Patient
        patientFirstName: validatedData.patientFirstName,
        patientLastName: validatedData.patientLastName,
        patientPhone: validatedData.patientPhone,
        patientEmail: validatedData.patientEmail || null,
        patientSocialSecurityNumber:
          validatedData.patientSocialSecurityNumber || null,

        // Transport
        transportType: validatedData.transportType,
        tripType: validatedData.tripType,
        mobilityType: validatedData.mobilityType,
        needsAccompanist: validatedData.needsAccompanist,
        accompanistName: validatedData.accompanistName || null,

        // Adresses
        pickupAddress: validatedData.pickupAddress,
        pickupCity: validatedData.pickupCity,
        pickupPostalCode: validatedData.pickupPostalCode,
        pickupDetails: validatedData.pickupDetails || null,

        destinationAddress: validatedData.destinationAddress,
        destinationCity: validatedData.destinationCity,
        destinationPostalCode: validatedData.destinationPostalCode,
        destinationDetails: validatedData.destinationDetails || null,

        // Planning
        requestedDate: new Date(validatedData.requestedDate),
        requestedTime: validatedData.requestedTime,
        returnDate: validatedData.returnDate
          ? new Date(validatedData.returnDate)
          : null,
        returnTime: validatedData.returnTime || null,
        hasTransportVoucher: validatedData.hasTransportVoucher,
        reason: validatedData.reason || null,
        notes: validatedData.notes || null,

        // Status
        status: "PENDING",
      },
      select: {
        id: true,
        trackingId: true,
      },
    });

    return NextResponse.json({
      success: true,
      trackingId: transportRequest.trackingId,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la demande" },
      { status: 500 }
    );
  }
}
