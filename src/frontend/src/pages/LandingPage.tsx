import { useInternetIdentity } from '../hooks/useInternetIdentity';
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
  const { 
    data: preview, 
    isLoading,
    isError,
    error: errorData,
    refetch
  } = useGetAppStorePreview();

  const isAuthenticated = !!identity;

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
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 sm:py-14 md:py-16 lg:py-20">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="relative mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={`/assets/${preview.heroSection.image}`}
                alt={preview.heroSection.title}
                className="h-[300px] w-full object-cover sm:h-[400px] md:h-[450px] lg:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-8 md:px-10 text-center text-white">
                <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl sm:mb-5 md:text-4xl md:mb-6 lg:text-5xl lg:mb-7 xl:text-6xl">
                  {preview.heroSection.title}
                </h1>
                <p className="mb-7 max-w-3xl text-sm font-medium opacity-95 sm:text-base sm:mb-8 md:text-lg md:mb-9 lg:text-xl">
                  {preview.heroSection.tagline}
                </p>
                {!isAuthenticated && <RoleSignInButtons />}
                {isAuthenticated && (
                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-4 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-7 sm:py-5 sm:text-base"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center sm:mb-14 md:mb-16 lg:mb-20">
              <Badge className="mb-4 px-4 py-2 text-xs sm:text-sm" variant="secondary">
                Powerful Features
              </Badge>
              <h2 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">Everything You Need</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Comprehensive homeschooling tools for Pre-K through 12th grade
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
              {preview.featuresSection.map((feature, index) => (
                <Card key={index} className="border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="p-6 text-center sm:p-7">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <img
                          src={`/assets/${feature.icon}`}
                          alt={feature.name}
                          className="h-10 w-10"
                        />
                      </div>
                    </div>
                    <h3 className="mb-3 text-base font-semibold sm:text-lg">{feature.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed sm:text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="bg-muted/30 py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center sm:mb-14 md:mb-16 lg:mb-20">
              <Badge className="mb-4 px-4 py-2 text-xs sm:text-sm" variant="secondary">
                Core Curriculum
              </Badge>
              <h2 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">Five Core Subjects</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Comprehensive curriculum covering all essential learning areas for K-12 education
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 md:grid-cols-3 lg:grid-cols-5">
              {preview.subjectsSection.map((subject, index) => (
                <Card key={index} className="group transition-all hover:scale-105 hover:shadow-xl">
                  <CardContent className="flex flex-col items-center p-6 sm:p-7">
                    <div className="mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-4 transition-all group-hover:from-primary/30 group-hover:to-accent/30">
                      <img
                        src={`/assets/${subject.icon}`}
                        alt={subject.name}
                        className="h-12 w-12 sm:h-14 sm:w-14"
                      />
                    </div>
                    <h3 className="text-center text-sm font-semibold sm:text-base">{subject.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-2xl">
              <CardContent className="p-8 sm:p-10 md:p-12 lg:p-14">
                <div className="text-center">
                  <Badge className="mb-6 px-4 py-2 text-xs sm:text-sm" variant="default">
                    Start Free Today
                  </Badge>
                  <h2 className="mb-7 text-xl font-bold sm:text-2xl md:text-3xl lg:mb-9">
                    {preview.callToAction.message}
                  </h2>
                  
                  <div className="mb-9 grid gap-6 md:grid-cols-2 lg:gap-7">
                    {/* Free Features */}
                    <div className="rounded-xl border-2 bg-card p-5 text-left sm:p-6">
                      <h3 className="mb-4 text-base font-semibold sm:text-lg">Free Forever</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs sm:text-sm">All lesson planning tools</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs sm:text-sm">Complete progress tracking</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs sm:text-sm">Grading and assessments</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs sm:text-sm">Pre-made lesson library</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs sm:text-sm">Five core subjects</span>
                        </li>
                      </ul>
                    </div>

                    {/* Premium Features */}
                    <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 text-left sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold sm:text-lg">Premium</h3>
                        <Badge variant="default" className="text-xs sm:text-sm">
                          {preview.callToAction.premiumInfo.price}
                        </Badge>
                      </div>
                      <ul className="mb-4 space-y-3">
                        {preview.callToAction.premiumInfo.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-xs sm:text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        {preview.callToAction.premiumInfo.cancellationPolicy}
                      </p>
                    </div>
                  </div>

                  {!isAuthenticated && <RoleSignInButtons />}
                  {isAuthenticated && (
                    <>
                      <Button
                        size="lg"
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-4 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-7 sm:py-5 sm:text-base"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Welcome back! Access your dashboard now
                      </p>
                    </>
                  )}
                  {!isAuthenticated && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      No credit card required • Start learning immediately
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-14 sm:py-16 md:py-20">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-9 text-lg font-bold sm:text-xl md:text-2xl lg:mb-11">
              Trusted by Homeschooling Families
            </h3>
            <div className="grid gap-6 sm:grid-cols-3 md:gap-7">
              <div className="rounded-lg bg-card p-6 shadow-sm sm:p-7">
                <div className="mb-2.5 text-2xl font-bold text-primary sm:text-3xl">100%</div>
                <p className="text-xs text-muted-foreground sm:text-sm">Free Core Features</p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm sm:p-7">
                <div className="mb-2.5 text-2xl font-bold text-primary sm:text-3xl">5</div>
                <p className="text-xs text-muted-foreground sm:text-sm">Core Subjects Covered</p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm sm:p-7">
                <div className="mb-2.5 text-2xl font-bold text-primary sm:text-3xl">K-12</div>
                <p className="text-xs text-muted-foreground sm:text-sm">All Grade Levels</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
