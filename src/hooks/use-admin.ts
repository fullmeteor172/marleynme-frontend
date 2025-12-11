import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin-service';
import { serviceService } from '@/services/service-service';
import type {
  ProfileRole,
  ServicePartnerStatus,
  KycDocumentStatus,
  KycSummaryStatus,
  DeliveryMode,
} from '@/types';

// Users
export const useAdminUsers = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ['admin', 'users', skip, limit],
    queryFn: () => adminService.getUsers(skip, limit),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminService.getUser(userId),
    enabled: !!userId,
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Parameters<typeof adminService.updateUser>[1] }) =>
      adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAddUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProfileRole }) =>
      adminService.addUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useRemoveUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProfileRole }) =>
      adminService.removeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Pets
export const useAdminPets = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ['admin', 'pets', skip, limit],
    queryFn: () => adminService.getPets(skip, limit),
    staleTime: 60 * 1000,
  });
};

// Partners
export const useAdminPartner = (partnerId: string) => {
  return useQuery({
    queryKey: ['admin', 'partners', partnerId],
    queryFn: () => adminService.getPartner(partnerId),
    enabled: !!partnerId,
  });
};

export const useUpdatePartnerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      status,
      isVerified,
    }: {
      partnerId: string;
      status: ServicePartnerStatus;
      isVerified: boolean;
    }) => adminService.updatePartnerStatus(partnerId, status, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
};

export const useAddPartnerService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      serviceId,
      speciesId,
      deliveryMode,
    }: {
      partnerId: string;
      serviceId: string;
      speciesId: string;
      deliveryMode: DeliveryMode;
    }) => adminService.addPartnerService(partnerId, serviceId, speciesId, deliveryMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
};

export const useUpdateKycDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      documentId,
      status,
      notes,
    }: {
      partnerId: string;
      documentId: string;
      status: KycDocumentStatus;
      notes?: string;
    }) => adminService.updateKycDocument(partnerId, documentId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
};

export const useUpdateKycSummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      status,
      notes,
    }: {
      partnerId: string;
      status: KycSummaryStatus;
      notes?: string;
    }) => adminService.updateKycSummary(partnerId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
};

// Service Requests
export const useAdminServiceRequests = (statusFilter?: string, skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ['admin', 'service-requests', statusFilter, skip, limit],
    queryFn: () => adminService.getServiceRequests(statusFilter, skip, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUpdateAdminServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: Parameters<typeof adminService.updateServiceRequest>[1];
    }) => adminService.updateServiceRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
};

// Reference Data - Cities
export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminService.createCity>[0]) =>
      adminService.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cityId, data }: { cityId: string; data: Parameters<typeof adminService.updateCity>[1] }) =>
      adminService.updateCity(cityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

// Reference Data - Species
export const useCreateSpecies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminService.createSpecies>[0]) =>
      adminService.createSpecies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
  });
};

export const useUpdateSpecies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ speciesId, data }: { speciesId: string; data: Parameters<typeof adminService.updateSpecies>[1] }) =>
      adminService.updateSpecies(speciesId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
  });
};

// Reference Data - Breeds
export const useCreateBreed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminService.createBreed>[0]) =>
      adminService.createBreed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
  });
};

export const useUpdateBreed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ breedId, data }: { breedId: string; data: Parameters<typeof adminService.updateBreed>[1] }) =>
      adminService.updateBreed(breedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
  });
};

// Reference Data - Services
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminService.createService>[0]) =>
      adminService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: Parameters<typeof adminService.updateService>[1] }) =>
      adminService.updateService(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Update service pricing
export const useUpdateServicePricing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pricingId,
      data,
    }: {
      pricingId: string;
      data: { base_price?: number; currency?: string; is_active?: boolean };
    }) => serviceService.updateServicePricing(pricingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-pricing'] });
    },
  });
};
