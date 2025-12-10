import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestService } from '@/services/service-request-service';
import type { CreateServiceRequestRequest, ServiceRequestStatus } from '@/types';

export const useServiceRequests = (statusFilter?: ServiceRequestStatus) => {
  return useQuery({
    queryKey: ['service-requests', statusFilter],
    queryFn: () => serviceRequestService.getServiceRequests(statusFilter),
  });
};

export const useServiceRequest = (requestId: string) => {
  return useQuery({
    queryKey: ['service-requests', requestId],
    queryFn: () => serviceRequestService.getServiceRequest(requestId),
    enabled: !!requestId,
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestRequest) =>
      serviceRequestService.createServiceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
};

export const useUpdateServiceRequest = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      requested_datetime?: string;
      customer_contact_phone?: string;
      customer_notes?: string;
      status?: ServiceRequestStatus;
    }) => serviceRequestService.updateServiceRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-requests', requestId] });
    },
  });
};
