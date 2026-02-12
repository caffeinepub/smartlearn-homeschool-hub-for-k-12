// Utility for persisting pre-login sign-in type across Internet Identity redirects

export type SignInType = 'educator-parent' | 'student';

// New Homeschool Hub branded key
const STORAGE_KEY = 'homeschool_hub_signin_type';
// Legacy SmartLearn key for backward compatibility
const LEGACY_STORAGE_KEY = 'smartlearn_signin_type';

export function setSignInType(type: SignInType): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, type);
  } catch (error) {
    console.error('Failed to store sign-in type:', error);
  }
}

export function getSignInType(): SignInType | null {
  try {
    // Try new key first
    let stored = sessionStorage.getItem(STORAGE_KEY);
    
    // Fall back to legacy key for backward compatibility
    if (!stored) {
      stored = sessionStorage.getItem(LEGACY_STORAGE_KEY);
    }
    
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
    // Clear both new and legacy keys
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear sign-in type:', error);
  }
}

export function hasExplicitSignInType(): boolean {
  return getSignInType() !== null;
}
