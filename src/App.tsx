import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/auth-provider';
import { ProtectedRoute } from './components/auth/protected-route';
import { LandingPage } from './pages/landing';
import { AuthCallbackPage } from './pages/auth-callback';
import { OnboardingPage } from './pages/onboarding';
import { DashboardLayout } from './pages/dashboard/layout';
import { PetsHomePage } from './pages/dashboard/pets-home';
import { AddPetPage } from './pages/dashboard/add-pet';
import { PetDetailPage } from './pages/dashboard/pet-detail';
import { ServiceRequestDetailPage } from './pages/dashboard/service-request-detail';
import { AdoptionCenterPage } from './pages/dashboard/adoption';
import { PartnerPortalPage } from './pages/dashboard/partner';
import { AdminPortalPage } from './pages/dashboard/admin';
import { UserProfilePage } from './pages/dashboard/profile';
import { AddressBookPage } from './pages/dashboard/addresses';
import { Toaster } from './components/ui/sonner';
import { ApiError, AuthenticationError } from './lib/api';

// Configure React Query with robust defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus to recover from stale data after inactivity
      refetchOnWindowFocus: true,

      // Don't refetch on reconnect automatically (we handle this via session monitoring)
      refetchOnReconnect: true,

      // Retry configuration with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry auth errors - let the auth layer handle it
        if (error instanceof AuthenticationError) {
          return false;
        }

        // Don't retry client errors (4xx) except rate limiting
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          return false;
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
      },

      // Stale time - data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,

      // Cache time - keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Retry mutations once on server errors
      retry: (failureCount, error) => {
        if (error instanceof AuthenticationError) {
          return false;
        }
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },

      retryDelay: 1000,
    },
  },
});

// Global error handler for React Query
queryClient.getQueryCache().config = {
  onError: (error, query) => {
    // Log errors for debugging
    console.error('Query error:', query.queryKey, error);

    // Don't show toast for auth errors - handled by auth provider
    if (error instanceof AuthenticationError) {
      return;
    }

    // Could add toast notification here if needed
  },
};

queryClient.getMutationCache().config = {
  onError: (error, _variables, _context, mutation) => {
    // Log mutation errors
    console.error('Mutation error:', mutation.options.mutationKey, error);

    if (error instanceof AuthenticationError) {
      return;
    }

    // Could add toast notification here if needed
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Onboarding route */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/pets" replace />} />
              <Route path="pets" element={<PetsHomePage />} />
              <Route path="pets/add" element={<AddPetPage />} />
              <Route path="pets/:petId" element={<PetDetailPage />} />
              <Route path="pets/:petId/edit" element={<AddPetPage />} />
              <Route path="service-requests/:requestId" element={<ServiceRequestDetailPage />} />
              <Route path="adoption" element={<AdoptionCenterPage />} />
              <Route path="partner" element={<PartnerPortalPage />} />
              <Route path="admin" element={<AdminPortalPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="addresses" element={<AddressBookPage />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
