import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let hasNavigated = false;

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
      if (!hasNavigated && isMounted) {
        hasNavigated = true;
        console.log(`Navigating to ${path}...`);
        navigate(path);
      }
    };

    // Poll for session with exponential backoff
    // This gives Supabase time to complete the PKCE exchange
    // and gives AuthProvider time to initialize
    const pollForSession = async () => {
      const maxAttempts = 15;
      let attempt = 0;

      const checkSession = async (): Promise<boolean> => {
        if (!isMounted || hasNavigated) return false;

        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            return false;
          }

          if (session) {
            console.log('Session found after', attempt + 1, 'attempts');
            // Wait additional time to ensure AuthProvider has initialized
            // This prevents the ProtectedRoute timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigateOnce('/dashboard');
            return true;
          }

          return false;
        } catch (err) {
          console.error('Session check failed:', err);
          return false;
        }
      };

      // Poll with increasing delays: 300ms, 500ms, 700ms, 1000ms, 1000ms...
      while (attempt < maxAttempts && isMounted && !hasNavigated) {
        const found = await checkSession();
        if (found) return;

        attempt++;
        const delay = Math.min(300 + (attempt * 200), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // If we got here, we timed out
      if (isMounted && !hasNavigated) {
        console.error('Session polling timed out after', attempt, 'attempts');
        setError('Authentication timeout. Please try logging in again.');
        setTimeout(() => navigateOnce('/'), 3000);
      }
    };

    // Start polling
    pollForSession();

    // Cleanup
    return () => {
      isMounted = false;
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
