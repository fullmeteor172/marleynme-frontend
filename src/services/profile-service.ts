import { api } from '@/lib/api';
import type { Profile, OnboardingStatus, UpdateProfileRequest, ProfileRole, City } from '@/types';

export const profileService = {
  getProfile: () => api.get<Profile>('/profiles/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<Profile>('/profiles/me', data),

  addRole: (role: ProfileRole) =>
    api.post<Profile>('/profiles/me/roles', { role }),

  removeRole: (role: ProfileRole) =>
    api.delete<Profile>(`/profiles/me/roles/${role}`),

  completeOnboarding: () =>
    api.post<Profile>('/profiles/me/complete-onboarding'),

  getOnboardingStatus: () =>
    api.get<OnboardingStatus>('/profiles/me/onboarding-status'),

  getCities: () =>
    api.get<City[]>('/profiles/cities'),
};
