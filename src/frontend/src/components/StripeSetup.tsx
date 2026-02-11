import { useState } from 'react';
import { useSetStripeConfiguration } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard } from 'lucide-react';

interface StripeSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StripeSetup({ open, onOpenChange }: StripeSetupProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const setStripeConfig = useSetStripeConfiguration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allowedCountries = countries.split(',').map((c) => c.trim()).filter(Boolean);
    await setStripeConfig.mutateAsync({
      secretKey,
      allowedCountries,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <DialogTitle>Configure Stripe Payment</DialogTitle>
          </div>
          <DialogDescription>
            Set up Stripe to enable premium report card subscriptions ($5 every 3 months).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe secret key (starts with sk_test_ or sk_live_)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries</Label>
            <Input
              id="countries"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated country codes (e.g., US, CA, GB)
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={setStripeConfig.isPending}>
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

