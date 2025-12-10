import { api } from '@/lib/api';
import type { ServiceRequest, CreateServiceRequestRequest, ServiceRequestStatus } from '@/types';

export const serviceRequestService = {
  getServiceRequests: (statusFilter?: ServiceRequestStatus) => {
    const endpoint = statusFilter
      ? `/service-requests?status_filter=${statusFilter}`
      : '/service-requests';
    return api.get<ServiceRequest[]>(endpoint);
  },

  getServiceRequest: (requestId: string) =>
    api.get<ServiceRequest>(`/service-requests/${requestId}`),

  createServiceRequest: (data: CreateServiceRequestRequest) =>
    api.post<ServiceRequest>('/service-requests', data),

  updateServiceRequest: (
    requestId: string,
    data: {
      requested_datetime?: string;
      customer_contact_phone?: string;
      customer_notes?: string;
      status?: ServiceRequestStatus;
    }
  ) => api.patch<ServiceRequest>(`/service-requests/${requestId}`, data),
};
