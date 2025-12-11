import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStatus } from '@/hooks/use-profile';
import { hasStoredSession } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

// Increased timeout to allow for PKCE exchange and auth initialization
const LOADING_TIMEOUT_MS = 12000;

// Auth loading screen component - clean and polished
function AuthLoadingScreen({ message = 'Checking authentication...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-6 p-8">
        {/* Animated logo/spinner */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Just a moment</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Error screen with retry option
function AuthErrorScreen({ onRetry, onGoHome }: { onRetry: () => void; onGoHome: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="text-center max-w-md px-6 space-y-6">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Connection issue</h2>
          <p className="text-sm text-muted-foreground">
            We're having trouble connecting. This might be a temporary network issue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Try again
          </button>
          <button
            onClick={onGoHome}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            Go to home
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, profile, isInitializing, isInitialized } = useAuthStore();
  const location = useLocation();

  // Use onboarding status hook with proper caching
  const {
    data: onboardingStatus,
    isLoading: isLoadingOnboarding,
    error: onboardingError,
    refetch: refetchOnboarding,
  } = useOnboardingStatus();

  // Track loading timeout
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Quick check: if no stored session, redirect immediately
  const hasSession = hasStoredSession();

  // Debug logging
  console.log('ProtectedRoute render:', {
    hasSession,
    isInitialized,
    isInitializing,
    hasUser: !!user,
    hasProfile: !!profile,
    requireOnboarding,
    isLoadingOnboarding,
    hasOnboardingStatus: !!onboardingStatus,
  });

  // Reset timeout on retry
  useEffect(() => {
    setIsTimedOut(false);
  }, [retryCount]);

  // Set up timeout
  useEffect(() => {
    const isLoading = !isInitialized || isInitializing || (requireOnboarding && isLoadingOnboarding && !onboardingStatus);

    if (isLoading && !isTimedOut) {
      timeoutRef.current = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timed out');
        setIsTimedOut(true);
      }, LOADING_TIMEOUT_MS);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else if (!isLoading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isInitialized, isInitializing, isLoadingOnboarding, onboardingStatus, requireOnboarding, isTimedOut]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    if (requireOnboarding) {
      refetchOnboarding();
    }
  };

  // Handle go home
  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Show error screen on timeout
  if (isTimedOut) {
    return <AuthErrorScreen onRetry={handleRetry} onGoHome={handleGoHome} />;
  }

  // Quick redirect if no session at all (synchronous check)
  if (!hasSession && !isInitializing) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Wait for auth to initialize
  if (!isInitialized || isInitializing) {
    return <AuthLoadingScreen message="Verifying your session..." />;
  }

  // Redirect if not authenticated after initialization
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check onboarding status if required
  if (requireOnboarding) {
    // If we have cached onboarding status showing complete, render immediately
    if (onboardingStatus?.is_complete) {
      return <>{children}</>;
    }

    // If still loading initial onboarding status
    if (isLoadingOnboarding && !onboardingStatus) {
      return <AuthLoadingScreen message="Loading your profile..." />;
    }

    // If error or not complete, redirect to onboarding
    if (onboardingError || (onboardingStatus && !onboardingStatus.is_complete)) {
      return <Navigate to="/onboarding" replace />;
    }

    // If no profile and no onboarding status, redirect to onboarding
    if (!profile && !onboardingStatus) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
