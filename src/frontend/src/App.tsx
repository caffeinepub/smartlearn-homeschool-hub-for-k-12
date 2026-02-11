import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPublicationStatus } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import LandingPage from './pages/LandingPage';
import Takedown from './pages/Takedown';
import InstallPrompt from './components/InstallPrompt';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { data: publicationStatus, isLoading: publicationLoading } = useGetPublicationStatus();

  if (publicationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isPublished = publicationStatus?.__kind__ === 'published';
  const unpublishReason = publicationStatus?.__kind__ === 'unpublished' 
    ? publicationStatus.unpublished.reason 
    : undefined;

  if (!isPublished) {
    return <Takedown reason={unpublishReason} />;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <AppContent />
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showDashboard = isAuthenticated && !profileLoading && isFetched && userProfile !== null;

  if (loginStatus === 'initializing' || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  if (showDashboard && userProfile) {
    return <Dashboard userProfile={userProfile} />;
  }

  return null;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-cancel',
  component: PaymentCancel,
});

const routeTree = rootRoute.addChildren([indexRoute, paymentSuccessRoute, paymentCancelRoute]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
