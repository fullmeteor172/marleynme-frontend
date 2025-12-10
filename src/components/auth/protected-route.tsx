import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStatus } from '@/hooks/use-profile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } = useOnboardingStatus();

  // Wait for auth to initialize
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  // Redirect to landing if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check onboarding status if required
  if (requireOnboarding && !isLoadingOnboarding) {
    if (onboardingStatus && !onboardingStatus.is_complete) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
