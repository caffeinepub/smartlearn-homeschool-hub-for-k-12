import { useState, useEffect } from 'react';
import { useIsCallerAdmin, usePublishApp, useUnpublishApp, useGetPublicationStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPublicationControls() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: publicationStatus } = useGetPublicationStatus();
  const publishApp = usePublishApp();
  const unpublishApp = useUnpublishApp();
  
  const [unpublishReason, setUnpublishReason] = useState('');
  const [showUnpublishForm, setShowUnpublishForm] = useState(false);

  const isPublished = publicationStatus?.__kind__ === 'published';

  // Clear form state when publication status changes to published
  useEffect(() => {
    if (isPublished) {
      setShowUnpublishForm(false);
      setUnpublishReason('');
    }
  }, [isPublished]);

  // Don't render anything for non-admins
  if (adminCheckLoading || !isAdmin) {
    return null;
  }

  const isLoading = publishApp.isPending || unpublishApp.isPending;

  const handlePublish = async () => {
    try {
      await publishApp.mutateAsync();
    } catch (error) {
      // Error is already handled by the mutation's onError with toast
      console.error('Failed to publish app:', error);
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishReason.trim()) {
      return;
    }
    
    try {
      await unpublishApp.mutateAsync(unpublishReason);
    } catch (error) {
      // Error is already handled by the mutation's onError with toast
      console.error('Failed to unpublish app:', error);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPublished ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              App Published
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-orange-600" />
              App Unpublished
            </>
          )}
        </CardTitle>
        <CardDescription>
          Admin controls for managing app publication status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPublished ? (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                The app is currently live and accessible to all users.
              </AlertDescription>
            </Alert>

            {!showUnpublishForm ? (
              <Button
                variant="destructive"
                onClick={() => setShowUnpublishForm(true)}
                disabled={isLoading}
                className="w-full"
              >
                Unpublish App
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unpublish-reason">Reason for Unpublishing</Label>
                  <Input
                    id="unpublish-reason"
                    placeholder="Enter reason (e.g., Maintenance, Updates in progress)"
                    value={unpublishReason}
                    onChange={(e) => setUnpublishReason(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be displayed to users while the app is unpublished.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleUnpublish}
                    disabled={isLoading || !unpublishReason.trim()}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Unpublish
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUnpublishForm(false);
                      setUnpublishReason('');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The app is currently offline and not accessible to regular users.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handlePublish}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish App
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
