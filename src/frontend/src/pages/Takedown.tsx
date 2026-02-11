import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdminPublicationControls from '../components/AdminPublicationControls';

interface TakedownProps {
  reason?: string;
}

export default function Takedown({ reason }: TakedownProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Service Temporarily Unavailable</h1>
          <p className="text-lg text-muted-foreground">
            This application is currently undergoing maintenance and is not available at the moment.
          </p>
        </div>

        {reason && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Additional Information</AlertTitle>
            <AlertDescription>{reason}</AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            We apologize for any inconvenience. Please check back later.
          </p>
          <p className="text-sm text-muted-foreground">
            If you have any questions, please contact the administrator.
          </p>
        </div>

        <AdminPublicationControls />
      </div>
    </div>
  );
}
