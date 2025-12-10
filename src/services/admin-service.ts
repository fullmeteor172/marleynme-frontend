import { api } from '@/lib/api';
import type {
  Profile,
  Pet,
  ServicePartner,
  ServiceRequest,
  City,
  Species,
  Breed,
  Service,
  ProfileRole,
  ServicePartnerStatus,
  KycDocumentStatus,
  KycSummaryStatus,
  PartnerServiceCapability,
  DeliveryMode,
} from '@/types';

export const adminService = {
  // User Management
  getUsers: (skip = 0, limit = 100) =>
    api.get<Profile[]>(`/admin/users?skip=${skip}&limit=${limit}`),

  getUser: (userId: string) => api.get<Profile>(`/admin/users/${userId}`),

  updateUser: (userId: string, data: Partial<Profile>) =>
    api.patch<Profile>(`/admin/users/${userId}`, data),

  addUserRole: (userId: string, role: ProfileRole) =>
    api.post<Profile>(`/admin/users/${userId}/roles`, { role }),

  removeUserRole: (userId: string, role: ProfileRole) =>
    api.delete<Profile>(`/admin/users/${userId}/roles/${role}`),

  // Pet Management
  getPets: (skip = 0, limit = 100) =>
    api.get<Pet[]>(`/admin/pets?skip=${skip}&limit=${limit}`),

  getPet: (petId: string) => api.get<Pet>(`/admin/pets/${petId}`),

  // Partner Management
  getPartner: (partnerId: string) =>
    api.get<ServicePartner>(`/admin/partners/${partnerId}`),

  updatePartnerStatus: (
    partnerId: string,
    status: ServicePartnerStatus,
    isVerified: boolean
  ) =>
    api.patch<ServicePartner>(`/admin/partners/${partnerId}/status`, {
      status,
      is_verified: isVerified,
    }),

  addPartnerService: (
    partnerId: string,
    serviceId: string,
    speciesId: string,
    deliveryMode: DeliveryMode
  ) =>
    api.post<PartnerServiceCapability>(`/admin/partners/${partnerId}/services`, {
      service_id: serviceId,
      species_id: speciesId,
      delivery_mode: deliveryMode,
    }),

  updateKycDocument: (
    partnerId: string,
    documentId: string,
    status: KycDocumentStatus,
    notes?: string
  ) =>
    api.patch(`/admin/partners/${partnerId}/kyc/documents/${documentId}`, {
      status,
      notes,
    }),

  updateKycSummary: (
    partnerId: string,
    status: KycSummaryStatus,
    notes?: string
  ) =>
    api.patch(`/admin/partners/${partnerId}/kyc`, { status, notes }),

  // Service Request Management
  getServiceRequests: (statusFilter?: string, skip = 0, limit = 100) => {
    let endpoint = `/admin/service-requests?skip=${skip}&limit=${limit}`;
    if (statusFilter) endpoint += `&status_filter=${statusFilter}`;
    return api.get<ServiceRequest[]>(endpoint);
  },

  updateServiceRequest: (
    requestId: string,
    data: {
      assigned_partner_id?: string;
      status?: string;
      admin_notes?: string;
    }
  ) => api.patch<ServiceRequest>(`/service-requests/${requestId}/admin`, data),

  // Reference Data Management
  createCity: (data: { name: string; state: string; country?: string; is_active?: boolean }) =>
    api.post<City>('/admin/cities', data),

  updateCity: (cityId: string, data: Partial<{ name: string; state: string; country: string; is_active: boolean }>) =>
    api.patch<City>(`/admin/cities/${cityId}`, data),

  createSpecies: (data: { name: string; is_active?: boolean }) =>
    api.post<Species>('/admin/species', data),

  updateSpecies: (speciesId: string, data: Partial<{ name: string; is_active: boolean }>) =>
    api.patch<Species>(`/admin/species/${speciesId}`, data),

  createBreed: (data: { species_id: string; name: string; is_active?: boolean }) =>
    api.post<Breed>('/admin/breeds', data),

  updateBreed: (breedId: string, data: Partial<{ name: string; is_active: boolean }>) =>
    api.patch<Breed>(`/admin/breeds/${breedId}`, data),

  createService: (data: { code: string; name: string; description?: string; is_active?: boolean }) =>
    api.post<Service>('/admin/services', data),

  updateService: (serviceId: string, data: Partial<{ code: string; name: string; description: string; is_active: boolean }>) =>
    api.patch<Service>(`/admin/services/${serviceId}`, data),
};
