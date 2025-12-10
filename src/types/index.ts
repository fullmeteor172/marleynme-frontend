// Enums
export type ProfileRole = 'pet_parent' | 'prospective_parent' | 'service_partner' | 'admin_ops' | 'admin_super';
export type PetSex = 'male' | 'female' | 'unknown';
export type PartnerType = 'individual' | 'firm';
export type ServicePartnerStatus = 'pending_review' | 'active' | 'inactive' | 'rejected';
export type DeliveryMode = 'at_home_client' | 'on_site_partner' | 'remote';
export type KycSummaryStatus = 'not_started' | 'in_progress' | 'verified' | 'rejected';
export type KycDocumentStatus = 'pending' | 'accepted' | 'rejected';
export type ServiceRequestStatus = 'pending_assignment' | 'assigned' | 'upcoming' | 'in_progress' | 'awaiting_completion' | 'completed' | 'cancelled';
export type PetAddressUsage = 'primary_home' | 'secondary_home' | 'temporary' | 'last_seen' | 'other';

// Profile
export interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city_id: string | null;
  locality: string | null;
  pincode: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
  roles: ProfileRole[];
}

export interface OnboardingStatus {
  is_complete: boolean;
  completed_at: string | null;
  missing_steps: string[];
  has_required_info: boolean;
  current_roles: ProfileRole[];
}

// City
export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  is_active: boolean;
}

// Species & Breeds
export interface Species {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Breed {
  id: string;
  species_id: string;
  name: string;
  is_active: boolean;
}

// Pet
export interface Pet {
  id: string;
  name: string;
  species_id: string;
  breed_id: string | null;
  approx_age_years: number | null;
  sex: PetSex | null;
  notes: string | null;
  profile_photo_url: string | null;
  is_primary_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetShareCode {
  id: string;
  pet_id: string;
  owner_id: string;
  code: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface PetMedicalFile {
  id: string;
  pet_id: string;
  uploaded_by_user_id: string;
  file_url: string;
  notes: string | null;
  created_at: string;
}

// Address
export interface Address {
  id: string;
  profile_id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city_id: string;
  locality: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetAddress {
  id: string;
  pet_id: string;
  address_id: string;
  usage: PetAddressUsage;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Service
export interface Service {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSpecies {
  id: string;
  service_id: string;
  species_id: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service Partner
export interface ServicePartner {
  id: string;
  profile_id: string;
  partner_type: PartnerType;
  display_name: string;
  business_name: string | null;
  city_id: string;
  locality: string | null;
  pincode: string | null;
  contact_email: string | null;
  contact_phone: string;
  is_verified: boolean;
  status: ServicePartnerStatus;
  created_at: string;
}

export interface PartnerServiceCapability {
  id: string;
  partner_id: string;
  service_id: string;
  species_id: string;
  delivery_mode: DeliveryMode;
  is_active: boolean;
  created_at: string;
}

export interface PartnerKycSummary {
  id: string;
  partner_id: string;
  status: KycSummaryStatus;
  notes: string | null;
  last_reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  created_at: string;
}

export interface PartnerKycDocument {
  id: string;
  partner_id: string;
  document_type: string;
  document_identifier: string | null;
  file_url: string | null;
  status: KycDocumentStatus;
  notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
}

// Service Request
export interface ServiceRequest {
  id: string;
  customer_id: string;
  pet_id: string;
  service_id: string;
  requested_city_id: string;
  requested_delivery_mode: DeliveryMode;
  requested_partner_id: string | null;
  assigned_partner_id: string | null;
  requested_datetime: string;
  customer_contact_phone: string;
  customer_address_id: string;
  customer_address_text: string;
  customer_notes: string | null;
  estimated_price: number;
  currency: string;
  status: ServiceRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Review
export interface Review {
  id: string;
  service_request_id: string;
  reviewer_id: string;
  target_partner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface CreatePetRequest {
  name: string;
  species_id: string;
  breed_id?: string;
  approx_age_years?: number;
  sex?: PetSex;
  notes?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city_id?: string;
  locality?: string;
  pincode?: string;
}

export interface CreateAddressRequest {
  label?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city_id: string;
  locality?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export interface CreateServiceRequestRequest {
  pet_id: string;
  service_id: string;
  requested_city_id: string;
  requested_delivery_mode: DeliveryMode;
  customer_address_id: string;
  requested_partner_id?: string;
  requested_datetime: string;
  customer_contact_phone: string;
  customer_notes?: string;
}
