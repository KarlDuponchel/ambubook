// Types et interfaces partagés pour l'application AmbuBook

// ============================================
// Enums / Types de statut
// ============================================

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REFUSED"
  | "COUNTER_PROPOSAL"
  | "CANCELLED"
  | "COMPLETED";

export type TransportType = "AMBULANCE" | "VSL";

export type TripType = "ONE_WAY" | "ROUND_TRIP";

export type MobilityType = "WALKING" | "WHEELCHAIR" | "STRETCHER";

export type UserRole = "ADMIN" | "AMBULANCIER" | "CUSTOMER";

// ============================================
// Transport Request
// ============================================

export interface TransportRequest {
  id: string;
  trackingId: string;
  status: RequestStatus;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string | null;
  patientBirthDate: string | null;
  transportType: TransportType;
  tripType: TripType;
  mobilityType: MobilityType;
  requestedDate: string;
  requestedTime: string;
  returnDate: string | null;
  returnTime: string | null;
  hasTransportVoucher: boolean;
  isRecurring: boolean;
  needsAccompanist: boolean;
  accompanistName: string | null;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  pickupDetails: string | null;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  destinationDetails: string | null;
  reason: string | null;
  notes: string | null;
  responseNote: string | null;
  proposedDate: string | null;
  proposedTime: string | null;
  respondedAt: string | null;
  createdAt: string;
}

// Version simplifiée pour les listes
export interface TransportRequestSummary {
  id: string;
  trackingId: string;
  status: RequestStatus;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  transportType: TransportType;
  tripType: string;
  mobilityType: string;
  requestedDate: string;
  requestedTime: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  hasTransportVoucher: boolean;
  createdAt: string;
}

// ============================================
// Company
// ============================================

export interface Company {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Photo d'entreprise
export interface CompanyPhoto {
  id: string;
  fileKey: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

// Horaires d'ouverture
export interface CompanyHour {
  id: string;
  dayOfWeek: number; // 0=Dimanche ... 6=Samedi
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

// Company enrichie avec toutes les infos
export interface CompanyFull extends Company {
  slug: string;
  siret: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  hasAmbulance: boolean;
  hasVSL: boolean;
  acceptsOnlineBooking: boolean;
  foundedYear: number | null;
  fleetSize: number | null;
  coverageRadius: number | null;
  licenseNumber: string | null;
  photos: CompanyPhoto[];
  hours: CompanyHour[];
  isOwner: boolean;
  ownerId: string | null;
}

// Labels des jours de la semaine (français)
export const DAY_LABELS: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};

// Version pour l'affichage dans les résultats de recherche
export interface CompanySearchResult {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number; // en km (optionnel, seulement pour recherche géo)
  logoUrl?: string | null;
  acceptsOnlineBooking?: boolean;
  hasAmbulance?: boolean;
  hasVSL?: boolean;
}

// Version minimale pour les adresses
export interface CompanyAddress {
  address: string | null;
  city: string | null;
  postalCode: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// ============================================
// User
// ============================================

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
  isOwner: boolean;
}

// ============================================
// Distance / Route
// ============================================

export interface RouteSegment {
  distance: string;
  duration: string;
  distanceMeters?: number;
  durationSeconds?: number;
}

export interface DistanceResult {
  companyToPickup?: RouteSegment;
  pickupToDestination?: RouteSegment;
  total?: RouteSegment;
}

// ============================================
// Address
// ============================================

export interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CustomerAddress {
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  details?: string;
}

// ============================================
// Invitation
// ============================================

export interface Invitation {
  id: string;
  code: string;
  email?: string;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
}

// ============================================
// Search
// ============================================

export interface GeoSearchResponse {
  type: "geo";
  query: string;
  coordinates: { latitude: number; longitude: number };
  radius: number;
  results: CompanySearchResult[];
}

export interface TextSearchResponse {
  type: "text";
  query: string;
  results: CompanySearchResult[];
}

export interface RegionSearchResponse {
  type: "region";
  query: string;
  results: CompanySearchResult[];
}

export interface CitySearchResponse {
  type: "city";
  query: string;
  results: CompanySearchResult[];
}

export interface NoResultsSearchResponse {
  type: "none";
  query: string;
  results: [];
}

export type SearchResponse =
  | GeoSearchResponse
  | TextSearchResponse
  | RegionSearchResponse
  | CitySearchResponse
  | NoResultsSearchResponse;

// ============================================
// Booking Form
// ============================================

export interface BookingFormData {
  // Patient
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string;
  patientBirthDate: string;
  // Transport
  transportType: TransportType | "";
  tripType: TripType | "";
  mobilityType: MobilityType | "";
  // Schedule
  requestedDate: string;
  requestedTime: string;
  returnDate: string;
  returnTime: string;
  // Options
  hasTransportVoucher: boolean;
  isRecurring: boolean;
  needsAccompanist: boolean;
  accompanistName: string;
  // Addresses
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  pickupDetails: string;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  destinationDetails: string;
  // Other
  reason: string;
  notes: string;
}

// ============================================
// Status Config (pour l'affichage)
// ============================================

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REFUSED: "Refusée",
  COUNTER_PROPOSAL: "Contre-proposition",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export const MOBILITY_LABELS: Record<MobilityType, string> = {
  WALKING: "Patient valide (peut marcher)",
  WHEELCHAIR: "Fauteuil roulant",
  STRETCHER: "Brancard",
};

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  AMBULANCE: "Ambulance",
  VSL: "VSL",
};

// ============================================
// Calendar
// ============================================

export type CalendarView = "day" | "week" | "month";

// ============================================
// History
// ============================================

export type HistoryEventType =
  | "CREATED"
  | "STATUS_CHANGED"
  | "COUNTER_PROPOSAL"
  | "CUSTOMER_RESPONSE"
  | "NOTE_ADDED"
  | "ATTACHMENT_ADDED";

export type AttachmentType =
  | "TRANSPORT_VOUCHER"
  | "INVOICE"
  | "PRESCRIPTION"
  | "ID_DOCUMENT"
  | "MUTUELLE"
  | "SOCIAL_SECURITY"
  | "OTHER";

export interface RequestHistoryEntry {
  id: string;
  eventType: HistoryEventType;
  previousStatus: RequestStatus | null;
  newStatus: RequestStatus | null;
  proposedDate: string | null;
  proposedTime: string | null;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileType: AttachmentType;
  fileUrl: string;
  fileSizeKb: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
  CREATED: "Demande créée",
  STATUS_CHANGED: "Statut modifié",
  COUNTER_PROPOSAL: "Contre-proposition",
  CUSTOMER_RESPONSE: "Réponse client",
  NOTE_ADDED: "Note ajoutée",
  ATTACHMENT_ADDED: "Pièce jointe",
};

export const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  TRANSPORT_VOUCHER: "Bon de transport",
  INVOICE: "Facture",
  PRESCRIPTION: "Ordonnance",
  ID_DOCUMENT: "Pièce d'identité",
  MUTUELLE: "Carte mutuelle",
  SOCIAL_SECURITY: "Carte vitale",
  OTHER: "Autre",
};

export interface CalendarEvent {
  id: string;
  trackingId: string;
  title: string;
  time: string;
  date: Date;
  status: RequestStatus;
  transportType: TransportType;
  tripType: TripType;
  pickupCity: string;
  destinationCity: string;
}
