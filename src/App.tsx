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
import { AdoptionCenterPage } from './pages/dashboard/adoption';
import { PartnerPortalPage } from './pages/dashboard/partner';
import { AdminPortalPage } from './pages/dashboard/admin';
import { UserProfilePage } from './pages/dashboard/profile';
import { AddressBookPage } from './pages/dashboard/addresses';
import { Toaster } from './components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
