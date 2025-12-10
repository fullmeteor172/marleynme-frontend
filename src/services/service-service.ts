import { api } from '@/lib/api';
import type { Service, ServiceSpecies } from '@/types';

export const serviceService = {
  getServices: () => api.get<Service[]>('/services'),

  getServicePricing: () => api.get<ServiceSpecies[]>('/services/pricing'),
};
