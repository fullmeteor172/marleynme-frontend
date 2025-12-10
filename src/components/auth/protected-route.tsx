import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStatus } from '@/hooks/use-profile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, profile, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding, error: onboardingError } = useOnboardingStatus();

  // Wait for auth to initialize
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check onboarding status if required
  if (requireOnboarding) {
    // If we're still loading the onboarding status, show loading
    if (isLoadingOnboarding) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Checking your profile...</p>
          </div>
        </div>
      );
    }

    // If there's an error fetching onboarding status (likely no profile exists)
    // OR if onboarding is not complete, redirect to onboarding
    if (onboardingError || (onboardingStatus && !onboardingStatus.is_complete)) {
      return <Navigate to="/onboarding" replace />;
    }

    // Also check if profile doesn't exist at all
    if (!profile && !onboardingStatus) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
