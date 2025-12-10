import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile-service';
import type { UpdateProfileRequest, ProfileRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

export const useProfile = () => {
  const setProfile = useAuthStore((state) => state.setProfile);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await profileService.getProfile();
      setProfile(profile);
      return profile;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: profileService.getOnboardingStatus,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
};

export const useAddRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: ProfileRole) => profileService.addRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: profileService.getCities,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
