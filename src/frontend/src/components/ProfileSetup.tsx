import { useState, useEffect } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { getSignInType, clearSignInType } from '../utils/signInType';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  useEffect(() => {
    const signInType = getSignInType();
    if (signInType) {
      // Default role based on sign-in type (including legacy values)
      const defaultRole = signInType === 'educator-parent' ? UserRole.admin : UserRole.user;
      setRole(defaultRole);
      setIsRoleLocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile(
        { name: name.trim(), role },
        {
          onSuccess: () => {
            // Clear the stored sign-in type only after successful profile creation
            clearSignInType();
            toast.success('Profile created successfully!');
          },
          onError: (error: any) => {
            // Keep sign-in type stored so user can retry
            const errorMessage = error?.message || 'Failed to create profile. Please try again.';
            toast.error('Profile Setup Failed', {
              description: errorMessage,
            });
          },
        }
      );
    }
  };

  const getRoleLabel = (roleValue: UserRole): string => {
    if (roleValue === UserRole.admin) {
      return 'Educator/Parent';
    }
    return 'Student';
  };

  const getRoleDescription = (roleValue: UserRole): string => {
    if (roleValue === UserRole.admin) {
      return 'Educators and parents can create lessons, track progress, and grade assignments';
    }
    return 'Students can view lessons and track their own progress';
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome! Let's set up your profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              {isRoleLocked ? (
                <div className="rounded-md border bg-muted px-3 py-2">
                  <p className="text-sm font-medium">{getRoleLabel(role)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role selected based on your sign-in choice
                  </p>
                </div>
              ) : (
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.admin}>{getRoleLabel(UserRole.admin)}</SelectItem>
                    <SelectItem value={UserRole.user}>{getRoleLabel(UserRole.user)}</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                {getRoleDescription(role)}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending || !name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
