import { z } from "zod";

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

// Schéma de base sans companyId (pour réutilisation)
const baseTransportRequestSchema = z.object({
  // Patient
  patientFirstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  patientLastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  patientPhone: z
    .string()
    .min(1, "Le téléphone est requis")
    .refine(
      (val) => phoneRegex.test(val.replace(/\s/g, "")),
      "Format de téléphone invalide"
    ),
  patientEmail: z
    .string()
    .email("Format d'email invalide")
    .optional()
    .or(z.literal("")),
  patientSocialSecurityNumber: z.string().optional().or(z.literal("")),

  // Transport
  transportType: z.enum(["AMBULANCE", "VSL"], {
    message: "Type de transport invalide",
  }),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"], {
    message: "Type de trajet invalide",
  }),
  mobilityType: z.enum(["WALKING", "WHEELCHAIR", "STRETCHER"], {
    message: "Type de mobilité invalide",
  }),
  needsAccompanist: z.boolean().default(false),
  accompanistName: z.string().optional().or(z.literal("")),

  // Adresses
  pickupAddress: z.string().min(1, "L'adresse de départ est requise"),
  pickupCity: z.string().min(1, "La ville de départ est requise"),
  pickupPostalCode: z.string().min(1, "Le code postal de départ est requis"),
  pickupDetails: z.string().optional().or(z.literal("")),

  destinationAddress: z.string().min(1, "L'adresse d'arrivée est requise"),
  destinationCity: z.string().min(1, "La ville d'arrivée est requise"),
  destinationPostalCode: z
    .string()
    .min(1, "Le code postal d'arrivée est requis"),
  destinationDetails: z.string().optional().or(z.literal("")),

  // Planning
  requestedDate: z.string().min(1, "La date est requise"),
  requestedTime: z.string().min(1, "L'heure est requise"),
  returnDate: z.string().optional().or(z.literal("")),
  returnTime: z.string().optional().or(z.literal("")),
  hasTransportVoucher: z.boolean().default(false),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// Schéma complet avec companyId (pour création par client)
export const transportRequestSchema = baseTransportRequestSchema
  .extend({
    companyId: z.string().min(1, "L'identifiant de l'ambulancier est requis"),
  })
  .refine(
    (data) => {
      if (data.tripType === "ROUND_TRIP") {
        return !!data.returnDate && !!data.returnTime;
      }
      return true;
    },
    {
      message: "La date et l'heure de retour sont requises pour un aller-retour",
      path: ["returnDate"],
    }
  );

export type TransportRequestInput = z.infer<typeof transportRequestSchema>;

// Schéma pour création par ambulancier (companyId auto-inféré)
export const ambulancierTransportRequestSchema = baseTransportRequestSchema.refine(
  (data) => {
    if (data.tripType === "ROUND_TRIP") {
      return !!data.returnDate && !!data.returnTime;
    }
    return true;
  },
  {
    message: "La date et l'heure de retour sont requises pour un aller-retour",
    path: ["returnDate"],
  }
);

export type AmbulancierTransportRequestInput = z.infer<typeof ambulancierTransportRequestSchema>;
