import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile-service';
import type { UpdateProfileRequest, ProfileRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Hook to get and manage user profile
 * Uses a 5-minute stale time for smooth navigation without blocking
 */
export const useProfile = () => {
  const setProfile = useAuthStore((state) => state.setProfile);
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await profileService.getProfile();
      setProfile(profile);
      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false,
    enabled: !!user,
    // Use cached data while refetching in background
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Handled by auth provider visibility change
  });
};

/**
 * Hook to get onboarding status
 * Uses caching but validates on mount for protected routes
 */
export const useOnboardingStatus = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: profileService.getOnboardingStatus,
    retry: false,
    enabled: !!user,
    // Cache for 2 minutes - fresh enough for navigation, stale enough to avoid spam
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // Show cached data immediately, refetch in background
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update both the auth store and query cache
      setProfile(updatedProfile);
      queryClient.setQueryData(['profile'], updatedProfile);
      // Invalidate onboarding status as profile changes might affect it
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
};

/**
 * Hook to add a role to the current user
 */
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

/**
 * Hook to complete onboarding
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: profileService.completeOnboarding,
    onSuccess: async (completedProfile) => {
      // Update auth store immediately
      setProfile(completedProfile);

      // Update query cache directly for instant navigation
      queryClient.setQueryData(['profile'], completedProfile);
      queryClient.setQueryData(['onboarding-status'], {
        is_complete: true,
        completed_at: completedProfile.onboarding_completed_at,
        missing_steps: [],
        has_required_info: true,
        current_roles: completedProfile.roles,
      });
    },
  });
};

/**
 * Hook to get list of cities
 */
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: profileService.getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes - cities rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
