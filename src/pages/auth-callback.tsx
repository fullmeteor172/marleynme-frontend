import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlParams = new URLSearchParams(window.location.search);
    const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');

    if (errorDescription) {
      setError(errorDescription);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Set up a timeout to prevent infinite waiting
    const timeout = setTimeout(() => {
      setError('Authentication timeout. Please try logging in again.');
      setTimeout(() => navigate('/'), 3000);
    }, 10000); // 10 second timeout

    // Listen for auth state changes
    // Supabase v2 automatically exchanges OAuth codes for sessions
    // and triggers this listener when complete
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);

      if (event === 'SIGNED_IN' && session) {
        clearTimeout(timeout);
        console.log('Authentication successful, redirecting...');
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        clearTimeout(timeout);
        setError('Authentication failed. Please try logging in again.');
        setTimeout(() => navigate('/'), 3000);
      }
    });

    // Also check if there's already a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeout);
        console.log('Session found, redirecting...');
        navigate('/dashboard');
      }
    });

    // Cleanup
    return () => {
      clearTimeout(timeout);
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
