import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the hash from the URL (contains access_token, etc.)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError('Failed to establish session. Please try again.');
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          // Session is set, now check if user needs onboarding
          // The AuthProvider and ProtectedRoute will handle the rest
          console.log('Authentication successful, redirecting...');
          navigate('/dashboard');
        } else {
          // No tokens in URL, might be an error
          const errorDescription = hashParams.get('error_description');
          if (errorDescription) {
            setError(errorDescription);
          } else {
            setError('No authentication tokens found. Please try logging in again.');
          }
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred during authentication. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
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
