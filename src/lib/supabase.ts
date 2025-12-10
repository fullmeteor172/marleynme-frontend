import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const getAccessToken = async (): Promise<string | null> => {
  try {
    // Try to get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    // If no session, return null
    if (!session) {
      return null;
    }

    // Check if session is expired or about to expire (within 60 seconds)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const willExpireSoon = expiresAt - now < 60000; // 60 seconds

    // If session is expired or will expire soon, refresh it
    if (willExpireSoon) {
      console.log('Session expiring soon, refreshing...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        // Session refresh failed, return null to trigger re-auth
        return null;
      }

      return refreshedSession?.access_token ?? null;
    }

    return session.access_token;
  } catch (error) {
    console.error('Unexpected error getting access token:', error);
    return null;
  }
};
