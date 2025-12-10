import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useProfile } from '@/hooks/use-profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setUser, setLoading, setInitialized, setProfile } = useAuthStore();
  const { refetch: refetchProfile } = useProfile();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch profile if authenticated
      if (session?.user) {
        try {
          const result = await refetchProfile();
          // Profile exists, we're good
          if (result.data) {
            setProfile(result.data);
          }
        } catch (error) {
          // Profile doesn't exist yet - this is fine for new users
          // They'll be redirected to onboarding
          console.log('No profile found - new user or needs onboarding');
          setProfile(null);
        }
      }

      setLoading(false);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch profile on login
      if (session?.user) {
        try {
          const result = await refetchProfile();
          if (result.data) {
            setProfile(result.data);
          }
        } catch (error) {
          console.log('No profile found - new user or needs onboarding');
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setLoading, setInitialized, setProfile, refetchProfile]);

  return <>{children}</>;
}
