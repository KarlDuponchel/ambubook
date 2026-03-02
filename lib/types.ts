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

// Congés / Fermetures exceptionnelles
export interface CompanyTimeOff {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
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
  timeOffs: CompanyTimeOff[];
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
  } | null;
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

// ============================================
// Admin
// ============================================

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  ownerId: string | null;
  // Infos pour validation ambulancier
  siret: string | null;
  licenseNumber: string | null; // N° agrément ARS
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
}

// Type enrichi pour la liste admin des entreprises
export interface AdminCompanyFull extends AdminCompany {
  isActive: boolean;
  hasAmbulance: boolean;
  hasVSL: boolean;
  createdAt: string;
  updatedAt: string;
  coverageRadius: number | null;
  description: string | null;
  logoUrl: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    users: number;
    transportRequests: number;
  };
}

export type AdminCompanyStatus = "ALL" | "ACTIVE" | "INACTIVE";
export type AdminCompanyService = "ALL" | "AMBULANCE" | "VSL";

export interface AdminCompaniesFilters {
  search: string;
  status: AdminCompanyStatus;
  service: AdminCompanyService;
}

export interface AdminCompaniesCounts {
  total: number;
  active: number;
  inactive: number;
  withAmbulance: number;
  withVSL: number;
}

export interface AdminCompaniesResponse {
  companies: AdminCompanyFull[];
  pagination: AdminPagination;
  counts: AdminCompaniesCounts;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: AdminCompany | null;
  companyId: string | null;
  isCompanyOwner?: boolean;
}

export type AdminUserRole = "ALL" | UserRole;
export type AdminUserStatus = "ALL" | "ACTIVE" | "PENDING";

export interface AdminUsersFilters {
  search: string;
  role: AdminUserRole;
  status: AdminUserStatus;
}

export interface AdminUsersCounts {
  total: number;
  admins: number;
  ambulanciers: number;
  customers: number;
  pending: number;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: AdminPagination;
  counts: AdminUsersCounts;
}

// ============================================
// Audit Logs
// ============================================

export type AuditActionType =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "USER_ROLE_CHANGED"
  | "COMPANY_CREATED"
  | "COMPANY_UPDATED"
  | "COMPANY_DELETED"
  | "COMPANY_ACTIVATED"
  | "COMPANY_DEACTIVATED"
  | "COMPANY_OWNER_CHANGED"
  | "TRANSPORT_CREATED"
  | "TRANSPORT_ACCEPTED"
  | "TRANSPORT_REFUSED"
  | "TRANSPORT_CANCELLED"
  | "TRANSPORT_COMPLETED"
  | "ADMIN_ACTION";

export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  details: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  userId: string | null;
  user: AuditLogUser | null;
  targetType: string | null;
  targetId: string | null;
}

export interface AdminLogsFilters {
  search: string;
  action: "ALL" | AuditActionType;
  targetType: "ALL" | "user" | "company" | "transport";
  userId: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminLogsResponse {
  logs: AuditLogEntry[];
  pagination: AdminPagination;
  stats: {
    total: number;
    actionCounts: { action: AuditActionType; count: number }[];
  };
}

// ============================================
// Error Logs
// ============================================

export type ErrorSeverityType = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface ErrorLogEntry {
  id: string;
  severity: ErrorSeverityType;
  message: string;
  stack: string | null;
  path: string | null;
  method: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  resolved: boolean;
  createdAt: string;
  userId: string | null;
  user: { id: string; name: string; email: string } | null;
}

export interface AdminErrorsFilters {
  search: string;
  severity: "ALL" | ErrorSeverityType;
  resolved: "ALL" | "true" | "false";
  dateFrom: string;
  dateTo: string;
}

export interface AdminErrorsResponse {
  errors: ErrorLogEntry[];
  pagination: AdminPagination;
  stats: {
    total: number;
    unresolved: number;
    severityCounts: { severity: ErrorSeverityType; count: number }[];
  };
}

// ============================================
// Feedback Admin
// ============================================

export type AdminFeedbackType = "BUG" | "IMPROVEMENT" | "QUESTION" | "OTHER";
export type AdminFeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX";
export type AdminFeedbackPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AdminFeedback {
  id: string;
  type: AdminFeedbackType;
  subject: string;
  message: string;
  screenshot: string | null;
  pageUrl: string;
  userAgent: string | null;
  status: AdminFeedbackStatus;
  priority: AdminFeedbackPriority;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    company: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export type AdminFeedbackTypeFilter = "ALL" | AdminFeedbackType;
export type AdminFeedbackStatusFilter = "ALL" | AdminFeedbackStatus;
export type AdminFeedbackPriorityFilter = "ALL" | AdminFeedbackPriority;

export interface AdminFeedbackFilters {
  search: string;
  type: AdminFeedbackTypeFilter;
  status: AdminFeedbackStatusFilter;
  priority: AdminFeedbackPriorityFilter;
}

export interface AdminFeedbackCounts {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  bugs: number;
  critical: number;
}

export interface AdminFeedbackResponse {
  feedbacks: AdminFeedback[];
  pagination: AdminPagination;
  counts: AdminFeedbackCounts;
}

export const FEEDBACK_TYPE_LABELS: Record<AdminFeedbackType, string> = {
  BUG: "Bug",
  IMPROVEMENT: "Amélioration",
  QUESTION: "Question",
  OTHER: "Autre",
};

export const FEEDBACK_STATUS_LABELS: Record<AdminFeedbackStatus, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  WONT_FIX: "Ne sera pas corrigé",
};

export const FEEDBACK_PRIORITY_LABELS: Record<AdminFeedbackPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  CRITICAL: "Critique",
};

// ============================================
// Notification Logs Admin
// ============================================

export type NotificationChannel = "EMAIL" | "SMS" | "INAPP";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "BOUNCED";

export interface AdminNotificationLog {
  id: string;
  channel: NotificationChannel;
  type: string;
  recipient: string;
  subject: string | null;
  content: string | null;
  status: NotificationStatus;
  errorMsg: string | null;
  metadata: Record<string, unknown> | null;
  sentAt: string;
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export type AdminNotificationChannelFilter = "ALL" | NotificationChannel;
export type AdminNotificationStatusFilter = "ALL" | NotificationStatus;

export interface AdminNotificationFilters {
  search: string;
  channel: AdminNotificationChannelFilter;
  status: AdminNotificationStatusFilter;
  type: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminNotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  bounced: number;
  byChannel: Record<string, number>;
  byType: { type: string; count: number }[];
}

export interface AdminNotificationResponse {
  logs: AdminNotificationLog[];
  pagination: AdminPagination;
  stats: AdminNotificationStats;
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  INAPP: "In-app",
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDING: "En attente",
  SENT: "Envoyé",
  FAILED: "Échec",
  BOUNCED: "Rejeté",
};

export const NOTIFICATION_STATUS_FILTER_LABELS: Record<AdminNotificationStatusFilter, string> = {
  ALL: "Tous les statuts",
  PENDING: "En attente",
  SENT: "Envoyé",
  FAILED: "Échec",
  BOUNCED: "Rejeté",
};

// ============================================
// Admin Transports
// ============================================

// Version liste pour l'admin
export interface AdminTransport {
  id: string;
  trackingId: string;
  status: RequestStatus;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string | null;
  transportType: TransportType;
  tripType: TripType;
  mobilityType: MobilityType;
  requestedDate: string;
  requestedTime: string;
  pickupCity: string;
  destinationCity: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    history: number;
    attachments: number;
  };
}

// Version complète pour le détail
export interface AdminTransportFull {
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
  updatedAt: string;
  company: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  history: RequestHistoryEntry[];
  attachments: RequestAttachment[];
}

export type AdminTransportStatusFilter = "ALL" | RequestStatus;
export type AdminTransportTypeFilter = "ALL" | TransportType;
export type AdminTripTypeFilter = "ALL" | TripType;

export interface AdminTransportsFilters {
  search: string;
  status: AdminTransportStatusFilter;
  transportType: AdminTransportTypeFilter;
  tripType: AdminTripTypeFilter;
  companyId: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminTransportsCounts {
  total: number;
  pending: number;
  accepted: number;
  refused: number;
  completed: number;
  cancelled: number;
  ambulance: number;
  vsl: number;
}

export interface AdminTransportsResponse {
  transports: AdminTransport[];
  pagination: AdminPagination;
  counts: AdminTransportsCounts;
}
