import { api } from '@/lib/api';
import type {
  ServicePartner,
  PartnerKycSummary,
  PartnerKycDocument,
  PartnerServiceCapability,
  ServiceRequest,
} from '@/types';

export const partnerService = {
  getMyPartner: () => api.get<ServicePartner>('/partners/me'),

  createPartner: (data: {
    partner_type: 'individual' | 'firm';
    display_name: string;
    business_name?: string;
    city_id: string;
    locality?: string;
    pincode?: string;
    contact_email?: string;
    contact_phone: string;
  }) => api.post<ServicePartner>('/partners/me', data),

  updatePartner: (data: Partial<{
    display_name: string;
    business_name: string;
    city_id: string;
    locality: string;
    pincode: string;
    contact_email: string;
    contact_phone: string;
  }>) => api.patch<ServicePartner>('/partners/me', data),

  getMyInterests: () => api.get<{ service_id: string }[]>('/partners/me/interests'),

  addInterest: (serviceId: string) =>
    api.post('/partners/me/interests', { service_id: serviceId }),

  removeInterest: (serviceId: string) =>
    api.delete(`/partners/me/interests/${serviceId}`),

  getMyServices: () => api.get<PartnerServiceCapability[]>('/partners/me/services'),

  getMyKyc: () => api.get<PartnerKycSummary>('/partners/me/kyc'),

  getMyKycDocuments: () => api.get<PartnerKycDocument[]>('/partners/me/kyc/documents'),

  uploadKycDocument: (
    file: File,
    documentType: string,
    documentIdentifier?: string,
    notes?: string
  ) => {
    const additionalData: Record<string, string> = { document_type: documentType };
    if (documentIdentifier) additionalData.document_identifier = documentIdentifier;
    if (notes) additionalData.notes = notes;

    return api.uploadFile<PartnerKycDocument>(
      '/partners/me/kyc/documents',
      file,
      additionalData
    );
  },

  getAvailableRequests: () => api.get<ServiceRequest[]>('/partners/me/available-requests'),

  getAssignedRequests: (statusFilter?: string) => {
    const endpoint = statusFilter
      ? `/service-requests/partner/assigned?status_filter=${statusFilter}`
      : '/service-requests/partner/assigned';
    return api.get<ServiceRequest[]>(endpoint);
  },

  updateRequestStatus: (requestId: string, status: string) =>
    api.patch(`/partners/me/service-requests/${requestId}`, { status }),
};
