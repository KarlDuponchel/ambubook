// Types pour l'onboarding ambulancier

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const ONBOARDING_STEP_TITLES: Record<OnboardingStep, string> = {
  1: "Informations",
  2: "Services",
  3: "Identité visuelle",
  4: "Description",
  5: "Horaires",
  6: "Finalisation",
};

// Données du formulaire d'onboarding
export interface OnboardingFormData {
  // Étape 1 : Informations de base
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  siret: string;
  licenseNumber: string;

  // Étape 2 : Services
  hasAmbulance: boolean;
  hasVSL: boolean;
  acceptsOnlineBooking: boolean;
  coverageRadius: number | null;
  fleetSize: number | null;
  foundedYear: number | null;

  // Étape 3 : Identité visuelle
  logoUrl: string | null;
  coverImageUrl: string | null;

  // Étape 4 : Description
  description: string;

  // Étape 5 : Horaires
  hours: OnboardingHour[];

  // Étape 6 : Galerie (optionnel)
  photos: OnboardingPhoto[];
}

export interface OnboardingHour {
  dayOfWeek: number; // 0=Dimanche, 1=Lundi ... 6=Samedi
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface OnboardingPhoto {
  id?: string;
  fileKey: string;
  url: string;
  caption: string | null;
  order: number;
}

// Valeurs par défaut pour le formulaire
export const DEFAULT_HOURS: OnboardingHour[] = [
  { dayOfWeek: 1, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Lundi
  { dayOfWeek: 2, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Mardi
  { dayOfWeek: 3, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Mercredi
  { dayOfWeek: 4, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Jeudi
  { dayOfWeek: 5, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Vendredi
  { dayOfWeek: 6, openTime: "08:00", closeTime: "12:00", isClosed: false }, // Samedi
  { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true }, // Dimanche
];

export const DEFAULT_ONBOARDING_DATA: OnboardingFormData = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  email: "",
  siret: "",
  licenseNumber: "",
  hasAmbulance: true,
  hasVSL: true,
  acceptsOnlineBooking: true,
  coverageRadius: 30,
  fleetSize: null,
  foundedYear: null,
  logoUrl: null,
  coverImageUrl: null,
  description: "",
  hours: DEFAULT_HOURS,
  photos: [],
};

// Labels des jours pour l'affichage
export const ONBOARDING_DAY_LABELS: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};
