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
  
  // Check for admin-only operations (publish/unpublish)
  if (
    message.includes('only admins') ||
    (message.includes('admin') && message.includes('required')) ||
    (message.includes('unauthorized') && (
      message.includes('admin role') ||
      message.includes('publish') ||
      message.includes('unpublish')
    ))
  ) {
    return {
      isAuthorizationError: true,
      message: 'This action is only available to administrators.',
    };
  }
  
  // Check for Educator/Parent role requirements
  if (
    message.includes('unauthorized') ||
    message.includes('only educators') ||
    message.includes('only teachers') ||
    message.includes('only parents') ||
    message.includes('educators/parents') ||
    message.includes('permission') ||
    message.includes('access denied')
  ) {
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
