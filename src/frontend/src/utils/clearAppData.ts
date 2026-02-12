/**
 * Clears relevant app data from localStorage and sessionStorage
 * to help recover from corrupted client state.
 */
export function clearAppData(): void {
  try {
    // Clear specific app-related keys
    const keysToRemove = [
      'pwa-install-dismissed',
      'onboarding-completed',
      'sign-in-type',
      'theme',
    ];

    // Remove from localStorage
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[clearAppData] Failed to remove localStorage key "${key}":`, err);
      }
    });

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (err) {
      console.warn('[clearAppData] Failed to clear sessionStorage:', err);
    }

    console.log('[clearAppData] App data cleared successfully');
  } catch (error) {
    console.error('[clearAppData] Error clearing app data:', error);
    // If specific clearing fails, try a full clear as fallback
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (fallbackError) {
      console.error('[clearAppData] Fallback clear also failed:', fallbackError);
    }
  }
}
