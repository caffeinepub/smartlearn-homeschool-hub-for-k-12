import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Moon, Sun, GraduationCap } from 'lucide-react';
import { useTheme } from 'next-themes';
import OfflineIndicator from './OfflineIndicator';
import RoleSignInButtons from './RoleSignInButtons';
import { APP_NAME } from '../constants/branding';

export default function Header() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <h1 className="text-lg font-bold text-primary">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-xs sm:text-sm"
              >
                Logout
              </Button>
            ) : (
              <RoleSignInButtons variant="compact" />
            )}
          </div>
        </div>
      </header>
      <OfflineIndicator />
    </>
  );
}
