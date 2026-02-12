import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useGetAppStorePreview } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import RoleSignInButtons from '../components/RoleSignInButtons';
import { QueryErrorState } from '../components/QueryErrorState';
import { ActorNotReadyState } from '../components/ActorNotReadyState';
import { normalizeErrorMessage } from '../utils/userFacingErrors';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { 
    data: preview, 
    isLoading,
    isError,
    error: errorData,
    refetch
  } = useGetAppStorePreview();

  const isAuthenticated = !!identity;

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError || !preview) {
    const errorMessage = normalizeErrorMessage(errorData);
    
    // Check if it's an actor not ready error
    if (errorMessage.includes('connection') || errorMessage.includes('not ready')) {
      return <ActorNotReadyState onRetry={() => refetch()} />;
    }

    return (
      <QueryErrorState
        title="Unable to load preview"
        message={errorMessage}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <Badge className="w-fit" variant="secondary">
              Free Core Features
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {preview.heroSection.title}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
              {preview.heroSection.tagline}
            </p>
            <div className="pt-4">
              <RoleSignInButtons />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src={`/assets/${preview.heroSection.image}`}
              alt="Homeschool Hub Hero"
              className="h-auto w-full max-w-lg rounded-lg object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
            Core Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {preview.featuresSection.map((feature, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <img
                    src={`/assets/${feature.icon}`}
                    alt={feature.name}
                    className="mb-4 h-16 w-16"
                  />
                  <h3 className="mb-2 text-lg font-semibold">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="border-t bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
            Five Core Subjects
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
            {preview.subjectsSection.map((subject, index) => (
              <Card key={index} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <img
                    src={`/assets/${subject.icon}`}
                    alt={subject.name}
                    className="mb-3 h-12 w-12 sm:h-14 sm:w-14"
                  />
                  <p className="text-sm font-medium sm:text-base">{subject.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="border-t bg-background py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-bold sm:text-3xl md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-base text-muted-foreground sm:text-lg">
              {preview.callToAction.message}
            </p>

            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Premium Report Cards</h3>
                <p className="mb-4 text-2xl font-bold text-primary">
                  {preview.callToAction.premiumInfo.price}
                </p>
                <ul className="mb-4 space-y-2 text-left">
                  {preview.callToAction.premiumInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  {preview.callToAction.premiumInfo.cancellationPolicy}
                </p>
              </CardContent>
            </Card>

            <RoleSignInButtons />
          </div>
        </div>
      </section>
    </div>
  );
}
