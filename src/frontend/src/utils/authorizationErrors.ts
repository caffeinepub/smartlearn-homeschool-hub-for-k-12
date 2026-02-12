/**
 * Utility for detecting and formatting authorization errors from backend
 */

export interface AuthorizationErrorResult {
  isAuthorizationError: boolean;
  message: string;
}

/**
 * Detects if an error is an authorization/permission failure and returns
 * a standardized user-friendly message
 */
export function classifyAuthorizationError(error: Error): AuthorizationErrorResult {
  const message = error.message.toLowerCase();
  
  // Check for common authorization error patterns
  const isAuthError = 
    message.includes('unauthorized') ||
    message.includes('only educators') ||
    message.includes('only teachers') ||
    message.includes('only parents') ||
    message.includes('educators/parents') ||
    message.includes('admin role required') ||
    message.includes('permission') ||
    message.includes('access denied');

  if (isAuthError) {
    // Return standardized message for Educator/Parent (admin) role requirements
    return {
      isAuthorizationError: true,
      message: 'This action is only available to Educators/Parents.',
    };
  }

  // Not an authorization error - return original message
  return {
    isAuthorizationError: false,
    message: error.message,
  };
}
