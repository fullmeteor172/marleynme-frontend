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
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Storage key for Supabase session
const getStorageKey = () => {
  try {
    return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  } catch {
    return 'sb-auth-token';
  }
};

/**
 * Synchronously check if a session exists in localStorage
 * This is fast and doesn't require async operations
 */
export function hasStoredSession(): boolean {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    // Check if token exists and hasn't expired
    if (!parsed?.access_token || !parsed?.expires_at) return false;
    const expiresAt = parsed.expires_at * 1000;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

/**
 * Get time until session expires (in ms)
 * Returns null if no session
 */
export function getSessionExpiryTime(): number | null {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed?.expires_at) return null;
    const expiresAt = parsed.expires_at * 1000;
    return Math.max(0, expiresAt - Date.now());
  } catch {
    return null;
  }
}

/**
 * Get the access token from storage (synchronous)
 * For cases where we need quick access without async
 */
export function getStoredAccessToken(): string | null {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed?.access_token || !parsed?.expires_at) return null;
    // Only return if not expired
    const expiresAt = parsed.expires_at * 1000;
    if (Date.now() >= expiresAt) return null;
    return parsed.access_token;
  } catch {
    return null;
  }
}

/**
 * Get a valid access token, refreshing if necessary
 * This is the main method for getting tokens for API calls
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    // Check if token needs refresh (within 5 minutes of expiry)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const timeUntilExpiry = expiresAt - Date.now();

    if (timeUntilExpiry < 5 * 60 * 1000) {
      // Token expiring soon, refresh it
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !newSession) {
        console.error('Failed to refresh session:', refreshError);
        // Return existing token if refresh fails but token still valid
        if (timeUntilExpiry > 0) {
          return session.access_token;
        }
        return null;
      }

      return newSession.access_token;
    }

    return session.access_token;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
}

/**
 * Force logout - clears all session data
 */
export async function forceLogout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error during sign out:', error);
  }

  // Also clear localStorage backup in case signOut failed
  try {
    localStorage.removeItem(getStorageKey());
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Refresh the session - useful when page becomes visible after being hidden
 */
export async function refreshSessionIfNeeded(): Promise<boolean> {
  try {
    const expiryTime = getSessionExpiryTime();

    // No session or expired
    if (expiryTime === null || expiryTime <= 0) {
      return false;
    }

    // If expiring within 10 minutes, refresh
    if (expiryTime < 10 * 60 * 1000) {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh session:', error);
        return false;
      }
      return true;
    }

    // Session is still valid, just call getSession to trigger any pending refresh
    await supabase.auth.getSession();
    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}
