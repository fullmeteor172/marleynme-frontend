import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, refreshSessionIfNeeded, forceLogout } from '@/lib/supabase';
import { apiEvents } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { profileService } from '@/services/profile-service';
import { useQueryClient } from '@tanstack/react-query';

// Timeout for auth initialization - increased to allow for PKCE flow
const INIT_TIMEOUT_MS = 8000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitRef = useRef(false);

  const {
    setSession,
    setUser,
    setProfile,
    setInitializing,
    setInitialized,
    user,
  } = useAuthStore();

  // Handle session expired - logout and redirect
  const handleSessionExpired = useCallback(async () => {
    console.log('Session expired, logging out...');

    // Clear all state
    setSession(null);
    setUser(null);
    setProfile(null);

    // Clear React Query cache
    queryClient.clear();

    // Force logout
    await forceLogout();

    // Redirect to home if on protected route
    if (location.pathname.startsWith('/dashboard') || location.pathname === '/onboarding') {
      navigate('/', { replace: true });
    }
  }, [setSession, setUser, setProfile, queryClient, navigate, location.pathname]);

  // Fetch user profile (non-blocking, doesn't affect auth state)
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await profileService.getProfile();
      setProfile(profile);
      // Also update React Query cache
      queryClient.setQueryData(['profile'], profile);
      return profile;
    } catch (error) {
      // Profile might not exist yet for new users
      console.log('Could not fetch profile:', error);
      setProfile(null);
      return null;
    }
  }, [setProfile, queryClient]);

  // Initialize auth - runs once on mount
  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (isInitRef.current) return;
    isInitRef.current = true;

    let mounted = true;

    const initialize = async () => {
      // Set a timeout to ensure we don't hang forever
      initTimeoutRef.current = setTimeout(() => {
        if (mounted) {
          console.warn('Auth initialization timed out');
          setInitializing(false);
          setInitialized(true);
        }
      }, INIT_TIMEOUT_MS);

      try {
        // Get session from Supabase (reads from localStorage first, then validates)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (!mounted) return;

        // Update auth state
        setSession(session);
        setUser(session?.user ?? null);

        // Mark as initialized immediately - don't wait for profile
        setInitializing(false);
        setInitialized(true);

        // Fetch profile in background (non-blocking)
        if (session?.user) {
          fetchProfile();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setInitializing(false);
          setInitialized(true);
        }
      } finally {
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
      }
    };

    initialize();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event);

      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch profile after sign in
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        // Clear profile and cache
        setProfile(null);
        queryClient.clear();
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed - good, nothing special needed
        console.log('Token refreshed successfully');
      }
    });

    // Listen for API auth errors
    const unsubscribeAuthError = apiEvents.on('auth_error', () => {
      console.log('API auth error - will attempt refresh');
    });

    const unsubscribeSessionExpired = apiEvents.on('session_expired', handleSessionExpired);

    // Handle visibility change - refresh session when page becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && useAuthStore.getState().user) {
        console.log('Page visible, checking session...');
        const success = await refreshSessionIfNeeded();
        if (!success && useAuthStore.getState().hasStoredSession() === false) {
          // Session truly expired while page was hidden
          handleSessionExpired();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      subscription.unsubscribe();
      unsubscribeAuthError();
      unsubscribeSessionExpired();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    setSession,
    setUser,
    setProfile,
    setInitializing,
    setInitialized,
    fetchProfile,
    queryClient,
    handleSessionExpired,
  ]);

  // Refetch profile when user changes (e.g., after navigation back to dashboard)
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  return <>{children}</>;
}
