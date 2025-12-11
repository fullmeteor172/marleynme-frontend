import { api } from '@/lib/api';
import type { Service, ServiceSpecies } from '@/types';

export const serviceService = {
  getServices: () => api.get<Service[]>('/services'),

  getServicePricing: () => api.get<ServiceSpecies[]>('/services/pricing'),

  updateServicePricing: (
    pricingId: string,
    data: { base_price?: number; currency?: string; is_active?: boolean }
  ) => api.patch<ServiceSpecies>(`/services/pricing/${pricingId}`, data),
};
