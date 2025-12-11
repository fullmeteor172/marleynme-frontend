import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStatus } from '@/hooks/use-profile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

// Maximum time to wait for loading states before showing error recovery
const LOADING_TIMEOUT_MS = 15000; // 15 seconds

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, profile, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();
  const {
    data: onboardingStatus,
    isLoading: isLoadingOnboarding,
    error: onboardingError,
    refetch: refetchOnboarding,
  } = useOnboardingStatus();

  // Track loading timeout
  const [isLoadingTimedOut, setIsLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountTimeRef = useRef(Date.now());

  // Determine if we're in any loading state
  const isInLoadingState = !isInitialized || isLoading || (requireOnboarding && isLoadingOnboarding);

  // Reset timeout state when loading completes
  useEffect(() => {
    if (!isInLoadingState) {
      setIsLoadingTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isInLoadingState]);

  // Set up loading timeout
  useEffect(() => {
    if (isInLoadingState && !isLoadingTimedOut) {
      timeoutRef.current = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timed out after', LOADING_TIMEOUT_MS, 'ms');
        setIsLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [isInLoadingState, isLoadingTimedOut]);

  // Handle retry after timeout
  const handleRetry = async () => {
    setIsLoadingTimedOut(false);
    mountTimeRef.current = Date.now();
    // Try to refetch onboarding status
    if (user && requireOnboarding) {
      try {
        await refetchOnboarding();
      } catch (error) {
        console.error('Failed to refetch onboarding status:', error);
      }
    }
  };

  // Show timeout error with retry option
  if (isLoadingTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Taking too long...</h2>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading your information. This might be a network issue.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    // If we're still loading or fetching the onboarding status, show loading
    // But only block on initial load, not on background refetches
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
