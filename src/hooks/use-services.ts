import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/service-service';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getServices,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useServicePricing = () => {
  return useQuery({
    queryKey: ['service-pricing'],
    queryFn: serviceService.getServicePricing,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
