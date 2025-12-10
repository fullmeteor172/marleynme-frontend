import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useProfile } from '@/hooks/use-profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setUser, setLoading, setInitialized } = useAuthStore();
  const { refetch: refetchProfile } = useProfile();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);

      // Fetch profile if authenticated
      if (session?.user) {
        refetchProfile();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch profile on login
      if (session?.user) {
        refetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setLoading, setInitialized, refetchProfile]);

  return <>{children}</>;
}
