import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  supabase,
  startSessionMonitoring,
  onSessionExpiring,
  onSessionExpired,
  forceLogout,
} from '@/lib/supabase';
import { apiEvents } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useProfile } from '@/hooks/use-profile';
import { useQueryClient } from '@tanstack/react-query';
import { SessionExpiringWarning } from '@/components/auth/session-expiring-warning';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setSession, setUser, setLoading, setInitialized, setProfile, user } = useAuthStore();
  const { refetch: refetchProfile } = useProfile();

  // Session expiring state
  const [sessionExpiringIn, setSessionExpiringIn] = useState<number | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Handle session expired - logout and redirect
  const handleSessionExpired = useCallback(async () => {
    console.log('Session expired, logging out...');
    setShowSessionWarning(false);
    setSessionExpiringIn(null);

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

  // Handle session expiring warning
  const handleSessionExpiring = useCallback((expiresInMs: number) => {
    setSessionExpiringIn(expiresInMs);

    // Only show warning if less than 5 minutes
    if (expiresInMs < 5 * 60 * 1000) {
      setShowSessionWarning(true);
    }
  }, []);

  // Handle auth error from API (401)
  const handleAuthError = useCallback(() => {
    console.log('Auth error received from API');
    // The API layer will attempt token refresh automatically
    // This is just for logging/monitoring
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const result = await refetchProfile();
      if (result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      console.log('No profile found - new user or needs onboarding');
      setProfile(null);
    }
  }, [refetchProfile, setProfile]);

  // Initialize auth and set up listeners
  useEffect(() => {
    let mounted = true;
    let cleanupSessionMonitoring: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile if authenticated
        if (session?.user) {
          await fetchUserProfile();

          // Start session monitoring only for authenticated users
          cleanupSessionMonitoring = startSessionMonitoring();
        }

        setLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event);

      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - fetch profile and start monitoring
        await fetchUserProfile();

        // Start session monitoring
        if (cleanupSessionMonitoring) {
          cleanupSessionMonitoring();
        }
        cleanupSessionMonitoring = startSessionMonitoring();

        setShowSessionWarning(false);
        setSessionExpiringIn(null);
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear everything
        setProfile(null);
        queryClient.clear();

        // Stop session monitoring
        if (cleanupSessionMonitoring) {
          cleanupSessionMonitoring();
          cleanupSessionMonitoring = null;
        }

        setShowSessionWarning(false);
        setSessionExpiringIn(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed - reset warning
        setShowSessionWarning(false);
        setSessionExpiringIn(null);
      }

      setLoading(false);
    });

    // Set up session event listeners
    const unsubscribeExpiring = onSessionExpiring(handleSessionExpiring);
    const unsubscribeExpired = onSessionExpired(handleSessionExpired);

    // Set up API event listeners
    const unsubscribeAuthError = apiEvents.on('auth_error', handleAuthError);
    const unsubscribeSessionExpired = apiEvents.on('session_expired', handleSessionExpired);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      unsubscribeExpiring();
      unsubscribeExpired();
      unsubscribeAuthError();
      unsubscribeSessionExpired();
      if (cleanupSessionMonitoring) {
        cleanupSessionMonitoring();
      }
    };
  }, [
    setSession,
    setUser,
    setLoading,
    setInitialized,
    setProfile,
    fetchUserProfile,
    queryClient,
    handleSessionExpiring,
    handleSessionExpired,
    handleAuthError,
  ]);

  // Handle refresh session action from warning dialog
  const handleRefreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        setShowSessionWarning(false);
        setSessionExpiringIn(null);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, []);

  // Handle logout action from warning dialog
  const handleLogout = useCallback(async () => {
    await handleSessionExpired();
  }, [handleSessionExpired]);

  return (
    <>
      {children}
      {user && (
        <SessionExpiringWarning
          open={showSessionWarning}
          expiresInMs={sessionExpiringIn}
          onRefresh={handleRefreshSession}
          onLogout={handleLogout}
          onOpenChange={setShowSessionWarning}
        />
      )}
    </>
  );
}
