import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Loader2, GraduationCap, Users } from 'lucide-react';
import { setSignInType, type SignInType } from '../utils/signInType';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface RoleSignInButtonsProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function RoleSignInButtons({ variant = 'default', className = '' }: RoleSignInButtonsProps) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const navigate = useNavigate();

  const handleSignIn = async (type: SignInType) => {
    // If already authenticated, navigate to dashboard instead of trying to login again
    if (identity) {
      navigate({ to: '/' });
      return;
    }

    // Store the sign-in type before login
    setSignInType(type);
    
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle "already authenticated" error gracefully
      if (error?.message?.includes('already authenticated')) {
        toast.info('You are already logged in', {
          description: 'Redirecting to dashboard...',
        });
        navigate({ to: '/' });
        return;
      }
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Login failed. Please try again.';
      toast.error('Login Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleSignIn(type),
        },
      });
      
      // Keep the sign-in type stored for retry
    }
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isLoggingIn} className={className}>
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => handleSignIn('educator-parent')}
            disabled={isLoggingIn}
            className="cursor-pointer"
          >
            <Users className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Educator/Parent</span>
              <span className="text-xs text-muted-foreground">Create lessons & track progress</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSignIn('student')}
            disabled={isLoggingIn}
            className="cursor-pointer"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Student</span>
              <span className="text-xs text-muted-foreground">View lessons & assignments</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:gap-4 ${className}`}>
      <Button
        size="lg"
        onClick={() => handleSignIn('educator-parent')}
        disabled={isLoggingIn}
        className="px-6 py-4 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-7 sm:py-5 sm:text-base"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <Users className="mr-2 h-4 w-4" />
            Educator/Parent Sign In
          </>
        )}
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => handleSignIn('student')}
        disabled={isLoggingIn}
        className="border-2 px-6 py-4 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-7 sm:py-5 sm:text-base"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <GraduationCap className="mr-2 h-4 w-4" />
            Student Sign In
          </>
        )}
      </Button>
    </div>
  );
}
