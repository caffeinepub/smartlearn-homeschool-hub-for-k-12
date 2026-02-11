import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPremiumAccessStatus } from '../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { PREMIUM_PRICE_DISPLAY, PREMIUM_DURATION_DISPLAY } from '../constants/premiumPricing';

interface PremiumBannerProps {
  onUpgrade: () => void;
}

export default function PremiumBanner({ onUpgrade }: PremiumBannerProps) {
  const { identity } = useInternetIdentity();
  const { data: hasPremium, isLoading } = useGetPremiumAccessStatus(identity?.getPrincipal() || null);

  if (isLoading || hasPremium) {
    return null;
  }

  return (
    <Alert className="border-primary/50 bg-gradient-to-r from-primary/10 to-accent/10">
      <Crown className="h-5 w-5 text-primary" />
      <AlertTitle className="flex items-center gap-2">
        Unlock Premium Report Cards
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span className="text-sm">
          Get access to comprehensive report card generation for just {PREMIUM_PRICE_DISPLAY} every {PREMIUM_DURATION_DISPLAY}.
        </span>
        <Button onClick={onUpgrade} size="sm" className="ml-4">
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
