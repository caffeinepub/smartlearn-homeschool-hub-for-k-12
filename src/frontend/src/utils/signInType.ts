// Utility for persisting pre-login sign-in type across Internet Identity redirects

export type SignInType = 'educator-parent' | 'student';

const STORAGE_KEY = 'smartlearn_signin_type';

export function setSignInType(type: SignInType): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, type);
  } catch (error) {
    console.error('Failed to store sign-in type:', error);
  }
}

export function getSignInType(): SignInType | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'educator-parent' || stored === 'student') {
      return stored;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve sign-in type:', error);
    return null;
  }
}

export function clearSignInType(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear sign-in type:', error);
  }
}

export function hasExplicitSignInType(): boolean {
  return getSignInType() !== null;
}
