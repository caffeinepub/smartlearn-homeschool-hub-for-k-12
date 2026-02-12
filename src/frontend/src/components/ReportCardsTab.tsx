import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPremiumAccessStatus, useIsSubscriptionCancelled, useGetStudentReportCards, useGenerateReportCard, useCancelPremiumSubscription, useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Calendar, Crown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PremiumBanner from './PremiumBanner';
import { createPremiumCheckoutItems, PREMIUM_PRICE_DISPLAY, PREMIUM_DURATION_DISPLAY } from '../constants/premiumPricing';
import { toast } from 'sonner';

interface ReportCardsTabProps {
  isEducatorParent: boolean;
}

export default function ReportCardsTab({ isEducatorParent }: ReportCardsTabProps) {
  const { identity } = useInternetIdentity();
  const studentId = identity?.getPrincipal() || null;
  const { data: hasPremium, isLoading: premiumLoading } = useGetPremiumAccessStatus(studentId);
  const { data: isCancelled, isLoading: cancelledLoading } = useIsSubscriptionCancelled(studentId);
  const { data: reportCards, isLoading: reportCardsLoading } = useGetStudentReportCards(studentId);
  const generateReportCard = useGenerateReportCard();
  const cancelSubscription = useCancelPremiumSubscription();
  const createCheckout = useCreateCheckoutSession();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpgrade = async () => {
    if (!studentId) {
      toast.error('Please log in to upgrade');
      return;
    }

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-cancel`;

      const items = createPremiumCheckoutItems();
      const session = await createCheckout.mutateAsync({ items, successUrl, cancelUrl });

      if (session?.url) {
        window.location.href = session.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleGenerateReportCard = async () => {
    if (!studentId) {
      toast.error('Student ID not available');
      return;
    }

    setIsGenerating(true);
    try {
      await generateReportCard.mutateAsync(studentId);
    } catch (error) {
      // Error already handled by mutation
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your premium subscription? You will retain access until the end of your current billing period.')) {
      try {
        await cancelSubscription.mutateAsync();
      } catch (error) {
        // Error already handled by mutation
      }
    }
  };

  if (premiumLoading || cancelledLoading || reportCardsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Report Cards</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEducatorParent ? 'Generate and view comprehensive student report cards' : 'View your academic report cards'}
        </p>
      </div>

      {!hasPremium && <PremiumBanner onUpgrade={handleUpgrade} />}

      {hasPremium && isCancelled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Cancelled</AlertTitle>
          <AlertDescription>
            Your premium subscription has been cancelled. You will retain access until the end of your current billing period.
          </AlertDescription>
        </Alert>
      )}

      {hasPremium && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Premium Access Active</CardTitle>
              </div>
              <Badge variant="default">Premium</Badge>
            </div>
            <CardDescription>
              You have access to premium report card features for {PREMIUM_PRICE_DISPLAY} every {PREMIUM_DURATION_DISPLAY}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={handleGenerateReportCard} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Report Card'
              )}
            </Button>
            {!isCancelled && (
              <Button variant="outline" onClick={handleCancelSubscription} disabled={cancelSubscription.isPending}>
                {cancelSubscription.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {reportCards && reportCards.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reportCards.map((reportCard) => {
            const issueDate = new Date(Number(reportCard.issueDate) / 1_000_000);
            const validUntil = new Date(Number(reportCard.validUntil) / 1_000_000);
            const isExpired = validUntil < new Date();

            return (
              <Card key={reportCard.reportCardId.toString()} className={isExpired ? 'opacity-60' : ''}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">Report Card #{reportCard.reportCardId.toString()}</CardTitle>
                    {isExpired ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : (
                      <Badge variant="default">Valid</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    Issued: {issueDate.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Overall Average</p>
                    <p className="text-2xl font-bold">{reportCard.overallAverage.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Subject Grades:</p>
                    {reportCard.subjects.map((subjectGrade, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{subjectGrade.subject.name}</span>
                        <span className="font-semibold">{subjectGrade.average.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valid until: {validUntil.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-5 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2.5 text-lg font-semibold">No Report Cards Yet</h3>
            <p className="text-sm text-muted-foreground">
              {hasPremium
                ? 'Generate your first report card to get started'
                : 'Upgrade to premium to generate report cards'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
