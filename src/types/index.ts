// Types for the Formation Management Application

export interface Formation {
  id: string;
  slug: string;
  titre: string;
  description: string;
  session_date: string;
  max_attendees: number;
  current_attendees: number;
  mode: "presentiel" | "visio" | "both";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Detail fields (for modal)
  programme?: string[];
  objectifs?: string[];
  prerequis?: string | null;
  duree?: string;
  prix?: number;
  // Structured duration fields
  nombre_jours?: number;
  heures_par_jour?: number;
  // Location fields (for WhatsApp automation)
  location?: string;
  location_address?: string;
  location_maps_url?: string;
  visio_link?: string;
  whatsapp_group_link?: string;
}

// Form data for creating/editing formations
export interface FormationFormData {
  slug: string;
  titre: string;
  description: string;
  session_date: string;
  max_attendees: number;
  mode: "presentiel" | "visio" | "both";
  nombre_jours: number;
  heures_par_jour: number;
  prix: number;
  programme?: string[];
  objectifs?: string[];
  prerequis?: string;
  // Location fields
  location?: string;
  location_address?: string;
  location_maps_url?: string;
  visio_link?: string;
  whatsapp_group_link?: string;
}

export interface Registration {
  id: string;
  formation_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string | null;
  mode_choisi: "presentiel" | "visio";
  is_preregistration: boolean;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
  // Payment tracking
  payment_status: "pending" | "paid" | "refunded";
  payment_date?: string;
  payment_amount?: number;
  // Joined data
  formation?: Formation;
}

export interface RegistrationFormData {
  formationId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise?: string;
  mode: "presentiel" | "visio";
}

export interface CheckAndRegisterResult {
  success: boolean;
  registration_id?: string;
  is_preregistration?: boolean;
  formation_titre?: string;
  spots_remaining?: number;
  error?: string;
  message?: string;
}

// Pack selection for multi-formation registration
export interface PackSelection {
  formations: Formation[];
  discountPercent: number;
  totalOriginal: number;
  totalFinal: number;
}

// Result from check_and_register_pack RPC
export interface CheckAndRegisterPackResult {
  success: boolean;
  pack_id?: string;
  registration_ids?: string[];
  failed_formations?: string[];
  discount_percent: number;
  total_original: number;
  total_final: number;
  registrations_count: number;
  error?: string;
  message?: string;
}

// Pack registration form data
export interface PackRegistrationFormData {
  formationIds: string[];
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise?: string;
  modesChoisis: ("presentiel" | "visio")[];
}

// WhatsApp notification tracking
export type NotificationType = "payment_confirmation" | "reminder_24h" | "manual";
export type NotificationStatus = "pending" | "sent" | "delivered" | "read" | "failed" | "undelivered";

export interface Notification {
  id: string;
  registration_id?: string;
  formation_id?: string;
  recipient_phone: string;
  recipient_name?: string;
  notification_type: NotificationType;
  message_content: string;
  twilio_message_sid?: string;
  status: NotificationStatus;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  // Joined data
  registration?: Registration;
  formation?: Formation;
}

// Payment update data
export interface PaymentUpdateData {
  payment_status: "pending" | "paid" | "refunded";
  payment_amount?: number;
  send_confirmation?: boolean;
}

export interface DashboardStats {
  total_registrations: number;
  weekly_registrations: number;
  full_sessions: number;
  pending_preregistrations: number;
}

export interface AdminSession {
  isAuthenticated: boolean;
  expiresAt: number;
}

// Form validation errors
export interface FormErrors {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  mode?: string;
  general?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Formation card props
export interface FormationCardProps {
  formation: Formation;
  onRegister: (formation: Formation, mode: "presentiel" | "visio") => void;
  onShowDetails?: (formation: Formation) => void;
  onSelectForPack?: (formation: Formation, selected: boolean) => void;
  isSelectedForPack?: boolean;
}

// Stats for landing page
export interface LandingStats {
  totalLearners: number;
  formationsCount: number;
  satisfactionRate: number;
  yearsExperience: number;
}

// FAQ item
export interface FAQItem {
  question: string;
  answer: string;
}

// Feature/Trust signal item
export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Toast notification
export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

// Table sort configuration
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

// Filter configuration for registrations
export interface RegistrationFilters {
  status?: "confirmed" | "pending" | "cancelled" | "all";
  mode?: "presentiel" | "visio" | "all";
  isPreregistration?: boolean | "all";
  paymentStatus?: "pending" | "paid" | "refunded" | "all";
  searchQuery?: string;
}
