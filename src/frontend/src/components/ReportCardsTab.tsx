import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPremiumAccessStatus, useGetStudentReportCards, useGenerateReportCard, useCreateCheckoutSession, useIsStripeConfigured, useCancelPremiumSubscription, useIsSubscriptionCancelled } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, FileText, Crown, Calendar, TrendingUp, Award, XCircle, Shield, Info } from 'lucide-react';
import { toast } from 'sonner';
import StripeSetup from './StripeSetup';
import { createPremiumCheckoutItems, PREMIUM_PRICE_DISPLAY, PREMIUM_DURATION_DISPLAY } from '../constants/premiumPricing';

interface ReportCardsTabProps {
  isEducatorParent: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  'History': '/assets/generated/history-icon.dim_64x64.png',
  'Math': '/assets/generated/math-icon.dim_64x64.png',
  'Language Arts/Reading': '/assets/generated/language-arts-icon.dim_64x64.png',
  'Science': '/assets/generated/science-icon.dim_64x64.png',
  'Social Studies': '/assets/generated/social-studies-icon.dim_64x64.png',
};

export default function ReportCardsTab({ isEducatorParent }: ReportCardsTabProps) {
  const { identity } = useInternetIdentity();
  const studentId = identity?.getPrincipal() || null;
  const { data: hasPremium, isLoading: premiumLoading } = useGetPremiumAccessStatus(studentId);
  const { data: isCancelled, isLoading: cancelledLoading } = useIsSubscriptionCancelled(studentId);
  const { data: reportCards, isLoading: reportCardsLoading } = useGetStudentReportCards(studentId);
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const generateReportCard = useGenerateReportCard();
  const createCheckoutSession = useCreateCheckoutSession();
  const cancelSubscription = useCancelPremiumSubscription();
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!isStripeConfigured) {
      if (isEducatorParent) {
        setShowStripeSetup(true);
      } else {
        toast.error('Payment system is not configured. Please contact your administrator.');
      }
      return;
    }

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const items = createPremiumCheckoutItems();

      const session = await createCheckoutSession.mutateAsync({
        items,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-cancel`,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      toast.error(`Failed to start checkout: ${error.message}`);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const message = await cancelSubscription.mutateAsync();
      setCancellationMessage(message);
    } catch (error: any) {
      // Error already handled by mutation
    }
  };

  const handleGenerateReportCard = async () => {
    if (!studentId) return;
    try {
      await generateReportCard.mutateAsync(studentId);
    } catch (error: any) {
      toast.error(`Failed to generate report card: ${error.message}`);
    }
  };

  if (premiumLoading || reportCardsLoading || stripeConfigLoading || cancelledLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <div className="space-y-6 sm:space-y-7 md:space-y-8">
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center space-y-4 sm:space-y-5">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-18 sm:w-18">
              <Crown className="h-8 w-8 text-primary sm:h-9 sm:w-9" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Premium Report Cards</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Unlock comprehensive report card generation and tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-7">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Comprehensive Reports</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate detailed report cards with subject-by-subject breakdowns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Performance Analytics</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track progress over time with historical report cards
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Professional Format</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Downloadable report cards suitable for official records
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <div className="mb-5">
                <span className="text-3xl font-bold sm:text-4xl">{PREMIUM_PRICE_DISPLAY}</span>
                <span className="text-sm text-muted-foreground sm:text-base"> / {PREMIUM_DURATION_DISPLAY}</span>
              </div>
              <Button onClick={handleUpgrade} size="lg" className="w-full" disabled={createCheckoutSession.isPending}>
                {createCheckoutSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
              <div className="mt-5 flex items-center justify-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>No hidden fees or automatic renewals — you're always in control</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEducatorParent && (
          <StripeSetup open={showStripeSetup} onOpenChange={setShowStripeSetup} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Report Cards</h2>
          <p className="mt-2 text-sm text-muted-foreground">View and generate comprehensive performance reports</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant={isCancelled ? 'secondary' : 'default'} className="gap-1.5">
            <Crown className="h-3 w-3" />
            {isCancelled ? 'Premium (Cancelled)' : 'Premium Active'}
          </Badge>
        </div>
      </div>

      {cancellationMessage && (
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Subscription Cancelled</AlertTitle>
          <AlertDescription>{cancellationMessage}</AlertDescription>
        </Alert>
      )}

      {isCancelled && !cancellationMessage && (
        <Alert className="border-amber-500/50 bg-amber-500/5">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle>Subscription Cancelled</AlertTitle>
          <AlertDescription>
            Your premium access has been cancelled. You will retain access until your current subscription period expires.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Generate New Report Card</CardTitle>
          <CardDescription>
            Create a comprehensive report card based on your current grades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 sm:space-y-6">
          <Button onClick={handleGenerateReportCard} disabled={generateReportCard.isPending}>
            {generateReportCard.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report Card
              </>
            )}
          </Button>

          {!isCancelled && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Subscription Management</h4>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={cancelSubscription.isPending}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader className="space-y-4">
                      <AlertDialogTitle>Cancel Premium Subscription?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Are you sure you want to cancel your premium subscription? You will retain access to report cards until your current subscription period expires.
                        </p>
                        <p className="font-medium">
                          No hidden fees or penalties — you're always in control.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {cancelSubscription.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Subscription'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 flex-shrink-0" />
                  No hidden fees or automatic renewals — you're always in control
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {reportCards && reportCards.length > 0 ? (
        <div className="space-y-5 sm:space-y-6">
          <h3 className="text-base font-semibold sm:text-lg">Your Report Cards</h3>
          {reportCards.map((reportCard) => (
            <ReportCardDisplay key={reportCard.reportCardId.toString()} reportCard={reportCard} />
          ))}
        </div>
      ) : (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>No Report Cards Yet</AlertTitle>
          <AlertDescription>
            Generate your first report card to see your comprehensive academic performance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ReportCardDisplay({ reportCard }: { reportCard: any }) {
  const issueDate = new Date(Number(reportCard.issueDate) / 1_000_000);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
            <FileText className="h-5 w-5" />
            Report Card #{reportCard.reportCardId.toString()}
          </CardTitle>
          <Badge variant={reportCard.overallAverage >= 70 ? 'default' : 'destructive'}>
            {reportCard.overallAverage.toFixed(1)}% Overall
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3" />
            Issued: {issueDate.toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h4 className="mb-4 text-sm font-semibold sm:text-base">Subject Breakdown</h4>
          <div className="space-y-4">
            {reportCard.subjects.map((subjectGrade: any) => {
              const subjectIcon = SUBJECT_ICONS[subjectGrade.subject.name];
              return (
                <div key={subjectGrade.subject.subjectId.toString()} className="flex items-center justify-between rounded-lg border p-4 sm:p-5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {subjectIcon && (
                      <img src={subjectIcon} alt={subjectGrade.subject.name} className="h-7 w-7 flex-shrink-0 rounded object-contain sm:h-8 sm:w-8" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">{subjectGrade.subject.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {subjectGrade.grades.length} assignment{subjectGrade.grades.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={subjectGrade.average >= 70 ? 'default' : 'destructive'} className="flex-shrink-0">
                    {subjectGrade.average.toFixed(1)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
