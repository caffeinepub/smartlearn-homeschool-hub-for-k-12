import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, GraduationCap, Users } from 'lucide-react';
import { setSignInType, type SignInType } from '../utils/signInType';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoleSignInButtonsProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function RoleSignInButtons({ variant = 'default', className = '' }: RoleSignInButtonsProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  const handleSignIn = async (type: SignInType) => {
    setSignInType(type);
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
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
