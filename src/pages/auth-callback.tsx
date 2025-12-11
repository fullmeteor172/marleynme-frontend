import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hasNavigated = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Check for errors in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlParams = new URLSearchParams(window.location.search);
    const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');

    if (errorDescription) {
      setError(errorDescription);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Helper to navigate only once
    const navigateOnce = (path: string) => {
      if (!hasNavigated) {
        hasNavigated = true;
        if (timeoutId) clearTimeout(timeoutId);
        navigate(path);
      }
    };

    // Set up a timeout to prevent infinite waiting
    timeoutId = setTimeout(() => {
      if (!hasNavigated) {
        setError('Authentication timeout. Please try logging in again.');
        setTimeout(() => navigateOnce('/'), 3000);
      }
    }, 15000); // 15 second timeout - increased to allow PKCE exchange

    // Listen for auth state changes
    // Supabase v2 automatically exchanges OAuth codes for sessions
    // and triggers this listener when complete
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);

      if (event === 'SIGNED_IN' && session) {
        console.log('Authentication successful, redirecting...');
        // Small delay to ensure session is fully persisted
        setTimeout(() => navigateOnce('/dashboard'), 100);
      } else if (event === 'SIGNED_OUT') {
        setError('Authentication failed. Please try logging in again.');
        setTimeout(() => navigateOnce('/'), 3000);
      }
    });

    // Check if session already exists after a short delay
    // This handles the case where the auth state change already fired
    const checkSessionTimeout = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !hasNavigated) {
          console.log('Session found, redirecting...');
          navigateOnce('/dashboard');
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    }, 2000); // Wait 2 seconds for PKCE exchange to complete

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(checkSessionTimeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting back to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
}
