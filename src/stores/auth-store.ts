import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, forceLogout as supabaseForceLogout } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthState {
  // Core auth state
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Session metadata
  lastActivity: number;
  sessionExpiresAt: number | null;

  // Setters
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;

  // Actions
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateLastActivity: () => void;

  // Computed helpers
  isAuthenticated: () => boolean;
  isSessionExpired: () => boolean;
  getTimeUntilExpiry: () => number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      lastActivity: Date.now(),
      sessionExpiresAt: null,

      // Setters
      setSession: (session) => {
        const expiresAt = session?.expires_at
          ? session.expires_at * 1000
          : null;

        set({
          session,
          sessionExpiresAt: expiresAt,
          lastActivity: Date.now(),
        });
      },

      setUser: (user) => set({ user }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      // Actions
      signOut: async () => {
        try {
          await supabaseForceLogout();
        } catch (error) {
          console.error('Error during sign out:', error);
        }

        set({
          session: null,
          user: null,
          profile: null,
          sessionExpiresAt: null,
        });
      },

      signInWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      // Computed helpers
      isAuthenticated: () => {
        const state = get();
        return !!(state.user && state.session);
      },

      isSessionExpired: () => {
        const state = get();
        if (!state.sessionExpiresAt) return false;
        return Date.now() >= state.sessionExpiresAt;
      },

      getTimeUntilExpiry: () => {
        const state = get();
        if (!state.sessionExpiresAt) return null;
        const remaining = state.sessionExpiresAt - Date.now();
        return remaining > 0 ? remaining : 0;
      },
    }),
    {
      name: 'marleynme-auth-store',
      // Only persist non-sensitive data
      partialize: (state) => ({
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Selector hooks for performance
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () => useAuthStore((state) => !!(state.user && state.session));
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
