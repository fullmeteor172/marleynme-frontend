import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, forceLogout as supabaseForceLogout, hasStoredSession } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthState {
  // Core auth state
  session: Session | null;
  user: User | null;
  profile: Profile | null;

  // Loading states
  isInitializing: boolean;  // Initial auth check in progress
  isInitialized: boolean;   // Auth check completed at least once

  // Setters
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;

  // Actions
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;

  // Computed helpers
  isAuthenticated: () => boolean;
  hasStoredSession: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  session: null,
  user: null,
  profile: null,
  isInitializing: true,
  isInitialized: false,

  // Setters
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (isInitializing) => set({ isInitializing }),
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

  // Computed helpers
  isAuthenticated: () => {
    const state = get();
    return !!(state.user && state.session);
  },

  // Check localStorage synchronously for quick auth state check
  hasStoredSession: () => {
    return hasStoredSession();
  },
}));

// Selector hooks for performance
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () => useAuthStore((state) => !!(state.user && state.session));
export const useIsInitializing = () => useAuthStore((state) => state.isInitializing);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
