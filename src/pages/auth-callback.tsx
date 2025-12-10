import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // After Supabase redirects back, we just navigate to home
    // The AuthProvider will handle fetching the session
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
}
