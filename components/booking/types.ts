export interface Company {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  hasAmbulance?: boolean;
  hasVSL?: boolean;
}

export interface BookingFormData {
  // Patient
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string;
  patientSocialSecurityNumber: string;

  // Transport
  transportType: "AMBULANCE" | "VSL";
  tripType: "ONE_WAY" | "ROUND_TRIP";
  mobilityType: "WALKING" | "WHEELCHAIR" | "STRETCHER";
  needsAccompanist: boolean;
  accompanistName: string;

  // Adresses
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  pickupDetails: string;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  destinationDetails: string;

  // Planning
  requestedDate: string;
  requestedTime: string;
  returnDate: string;
  returnTime: string;
  hasTransportVoucher: boolean;
  transportVoucherFile: File | null;
  reason: string;
  notes: string;
}

export const initialFormData: BookingFormData = {
  patientFirstName: "",
  patientLastName: "",
  patientPhone: "",
  patientEmail: "",
  patientSocialSecurityNumber: "",

  transportType: "VSL",
  tripType: "ONE_WAY",
  mobilityType: "WALKING",
  needsAccompanist: false,
  accompanistName: "",

  pickupAddress: "",
  pickupCity: "",
  pickupPostalCode: "",
  pickupDetails: "",
  destinationAddress: "",
  destinationCity: "",
  destinationPostalCode: "",
  destinationDetails: "",

  requestedDate: "",
  requestedTime: "",
  returnDate: "",
  returnTime: "",
  hasTransportVoucher: false,
  transportVoucherFile: null,
  reason: "",
  notes: "",
};

export interface StepProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  errors: Partial<Record<keyof BookingFormData, string>>;
}

export interface PatientInfoStepProps extends StepProps {
  isLoggedIn?: boolean;
  companySlug?: string;
  hideLoginSuggestion?: boolean;
}

export interface TransportStepProps extends StepProps {
  company: Company;
}

export type BookingStep = 1 | 2 | 3 | 4;

export const STEP_TITLES: Record<BookingStep, string> = {
  1: "Informations patient",
  2: "Type de transport",
  3: "Adresses",
  4: "Date et récapitulatif",
};
