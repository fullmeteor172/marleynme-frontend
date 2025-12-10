import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

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

// Session management state
let lastActivityTime = Date.now();
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let activityCheckTimer: ReturnType<typeof setInterval> | null = null;
let isPageVisible = true;

// Configuration
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const ACTIVITY_CHECK_INTERVAL = 30 * 1000; // Check activity every 30 seconds
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes of inactivity triggers proactive refresh
const MIN_REFRESH_INTERVAL = 60 * 1000; // Don't refresh more than once per minute

// Event callbacks
type SessionEventCallback = (session: Session | null) => void;
type SessionExpiringCallback = (expiresInMs: number) => void;

let onSessionChangeCallback: SessionEventCallback | null = null;
let onSessionExpiringCallback: SessionExpiringCallback | null = null;
let onSessionExpiredCallback: (() => void) | null = null;

// Register event callbacks
export function onSessionChange(callback: SessionEventCallback) {
  onSessionChangeCallback = callback;
  return () => { onSessionChangeCallback = null; };
}

export function onSessionExpiring(callback: SessionExpiringCallback) {
  onSessionExpiringCallback = callback;
  return () => { onSessionExpiringCallback = null; };
}

export function onSessionExpired(callback: () => void) {
  onSessionExpiredCallback = callback;
  return () => { onSessionExpiredCallback = null; };
}

// Update last activity time - call this on user interactions
export function updateActivity() {
  lastActivityTime = Date.now();
}

// Check if session appears valid (based on stored data)
export function isSessionValid(): boolean {
  // Quick check without async - looks at localStorage
  try {
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return false;

    const parsed = JSON.parse(stored);
    if (!parsed?.expires_at) return false;

    const expiresAt = parsed.expires_at * 1000;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

// Get time until session expires (in ms)
export function getTimeUntilExpiry(): number | null {
  try {
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed?.expires_at) return null;

    const expiresAt = parsed.expires_at * 1000;
    return Math.max(0, expiresAt - Date.now());
  } catch {
    return null;
  }
}

// Get access token with automatic refresh if needed
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    // Check if session is expired or about to expire
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // If expired, try to refresh
    if (timeUntilExpiry <= 0) {
      console.log('Session expired, attempting refresh...');
      const newToken = await refreshSession();
      return newToken;
    }

    // If expiring within margin, refresh proactively
    if (timeUntilExpiry < TOKEN_REFRESH_MARGIN) {
      console.log('Session expiring soon, refreshing...');
      const newToken = await refreshSession();
      return newToken || session.access_token;
    }

    // Schedule next refresh if not already scheduled
    scheduleTokenRefresh(timeUntilExpiry - TOKEN_REFRESH_MARGIN);

    return session.access_token;
  } catch (error) {
    console.error('Unexpected error getting access token:', error);
    return null;
  }
};

// Force refresh the session
let lastRefreshTime = 0;

export async function refreshSession(): Promise<string | null> {
  // Prevent refresh spam
  const now = Date.now();
  if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
    console.log('Refresh throttled, using cached session');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  try {
    lastRefreshTime = now;
    console.log('Refreshing session...');

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);

      // If refresh failed due to invalid refresh token, session is truly expired
      if (error.message?.includes('invalid') ||
          error.message?.includes('expired') ||
          error.status === 400 ||
          error.status === 401) {
        onSessionExpiredCallback?.();
      }

      return null;
    }

    if (!session) {
      console.log('No session returned from refresh');
      onSessionExpiredCallback?.();
      return null;
    }

    console.log('Session refreshed successfully');
    onSessionChangeCallback?.(session);

    // Schedule next refresh
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const timeUntilExpiry = expiresAt - Date.now();
    scheduleTokenRefresh(timeUntilExpiry - TOKEN_REFRESH_MARGIN);

    return session.access_token;
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return null;
  }
}

// Schedule a token refresh
function scheduleTokenRefresh(delayMs: number) {
  // Clear existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  // Don't schedule if delay is too short or negative
  if (delayMs < MIN_REFRESH_INTERVAL) {
    return;
  }

  tokenRefreshTimer = setTimeout(async () => {
    console.log('Scheduled token refresh triggered');
    await refreshSession();
  }, delayMs);
}

// Force logout (clear all session data)
export async function forceLogout(): Promise<void> {
  stopSessionMonitoring();

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error during sign out:', error);
  }

  // Clear local storage backup
  try {
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore localStorage errors
  }

  onSessionChangeCallback?.(null);
}

// Start monitoring session and activity
export function startSessionMonitoring() {
  // Stop any existing monitoring
  stopSessionMonitoring();

  // Track page visibility
  const handleVisibilityChange = () => {
    const wasHidden = !isPageVisible;
    isPageVisible = document.visibilityState === 'visible';

    if (isPageVisible && wasHidden) {
      // Page became visible - check and refresh session if needed
      console.log('Page became visible, checking session...');
      handlePageResume();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Track user activity
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  const handleActivity = () => {
    updateActivity();
  };

  activityEvents.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  // Periodic activity check
  activityCheckTimer = setInterval(() => {
    checkActivityAndRefresh();
  }, ACTIVITY_CHECK_INTERVAL);

  // Initial session check
  initializeSession();

  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    stopSessionMonitoring();
  };
}

// Stop session monitoring
export function stopSessionMonitoring() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  if (activityCheckTimer) {
    clearInterval(activityCheckTimer);
    activityCheckTimer = null;
  }
}

// Handle page resume from background/hidden state
async function handlePageResume() {
  const timeUntilExpiry = getTimeUntilExpiry();

  if (timeUntilExpiry === null) {
    // No session
    return;
  }

  if (timeUntilExpiry <= 0) {
    // Session expired while page was hidden
    console.log('Session expired while page was hidden');
    const newToken = await refreshSession();
    if (!newToken) {
      onSessionExpiredCallback?.();
    }
    return;
  }

  if (timeUntilExpiry < TOKEN_REFRESH_MARGIN) {
    // Session expiring soon
    console.log('Session expiring soon after resume, refreshing...');
    await refreshSession();
    return;
  }

  // Notify if session is expiring within 10 minutes
  if (timeUntilExpiry < 10 * 60 * 1000) {
    onSessionExpiringCallback?.(timeUntilExpiry);
  }

  // Schedule refresh
  scheduleTokenRefresh(timeUntilExpiry - TOKEN_REFRESH_MARGIN);
}

// Check activity and refresh if needed
async function checkActivityAndRefresh() {
  if (!isPageVisible) {
    return;
  }

  const timeSinceActivity = Date.now() - lastActivityTime;
  const timeUntilExpiry = getTimeUntilExpiry();

  if (timeUntilExpiry === null) {
    return;
  }

  // If user has been inactive for a while but session is still valid,
  // proactively refresh to prevent issues when they return
  if (timeSinceActivity > INACTIVITY_THRESHOLD && timeUntilExpiry < 15 * 60 * 1000) {
    console.log('Proactive refresh due to inactivity + approaching expiry');
    await refreshSession();
  }

  // Warn about expiring session
  if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
    onSessionExpiringCallback?.(timeUntilExpiry);
  }
}

// Initialize session on load
async function initializeSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - Date.now();

      if (timeUntilExpiry <= 0) {
        // Already expired, try to refresh
        await refreshSession();
      } else if (timeUntilExpiry < TOKEN_REFRESH_MARGIN) {
        // Expiring soon, refresh now
        await refreshSession();
      } else {
        // Schedule refresh
        scheduleTokenRefresh(timeUntilExpiry - TOKEN_REFRESH_MARGIN);
      }
    }
  } catch (error) {
    console.error('Error initializing session:', error);
  }
}

// Export session utilities
export const sessionUtils = {
  updateActivity,
  isSessionValid,
  getTimeUntilExpiry,
  refreshSession,
  forceLogout,
  startSessionMonitoring,
  stopSessionMonitoring,
  onSessionChange,
  onSessionExpiring,
  onSessionExpired,
};
