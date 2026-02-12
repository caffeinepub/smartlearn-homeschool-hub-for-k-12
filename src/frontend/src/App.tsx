import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPublicationStatus } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Takedown from './pages/Takedown';
import ProfileSetup from './components/ProfileSetup';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { QueryErrorState } from './components/QueryErrorState';
import { ActorNotReadyState } from './components/ActorNotReadyState';
import { ServiceWorkerUpdatePrompt } from './components/ServiceWorkerUpdatePrompt';
import { usePWA } from './hooks/usePWA';
import { Loader2 } from 'lucide-react';
import { normalizeErrorMessage } from './utils/userFacingErrors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Layout() {
  const { isUpdateAvailable } = usePWA();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <InstallPrompt />
      <OfflineIndicator />
      <ServiceWorkerUpdatePrompt isUpdateAvailable={isUpdateAvailable} />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
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

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function IndexPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { 
    data: publicationStatus, 
    isLoading: publicationLoading,
    isError: publicationError,
    error: publicationErrorData,
    refetch: refetchPublication
  } = useGetPublicationStatus();
  
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched 
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading while checking publication status or initializing identity
  if (publicationLoading || isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle publication status errors
  if (publicationError) {
    const errorMessage = normalizeErrorMessage(publicationErrorData);
    
    // Check if it's an actor not ready error
    if (errorMessage.includes('connection') || errorMessage.includes('not ready')) {
      return <ActorNotReadyState onRetry={() => refetchPublication()} />;
    }

    return (
      <QueryErrorState
        title="Unable to check app status"
        message={errorMessage}
        onRetry={() => refetchPublication()}
      />
    );
  }

  // Check if app is unpublished - this check happens immediately after publication status is loaded
  // The staleTime: 0 in useGetPublicationStatus ensures this reflects the latest state after publish/unpublish
  const isPublished = publicationStatus?.__kind__ === 'published';
  
  if (!isPublished && publicationStatus?.__kind__ === 'unpublished') {
    return <Takedown reason={publicationStatus.unpublished.reason} />;
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Authenticated - wait for actor and profile to be ready
  // This prevents flash of profile setup when actor is still initializing
  if (actorFetching || !actor || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show profile setup if no profile exists (only after actor is ready and profile is fetched)
  if (profileFetched && userProfile === null) {
    return <ProfileSetup />;
  }

  // Show dashboard with user profile (type guard ensures userProfile is defined)
  if (!userProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Dashboard userProfile={userProfile} />;
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
