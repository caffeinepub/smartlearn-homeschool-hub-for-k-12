/**
 * Converts technical error messages into user-friendly English text.
 * Handles common initialization, actor availability, and trap-like errors.
 */
export function normalizeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Actor/connection not ready
  if (lowerMessage.includes('actor not available')) {
    return 'The connection to the backend is not ready yet. Please wait a moment and try again.';
  }

  // Identity/authentication issues
  if (lowerMessage.includes('identity') || lowerMessage.includes('authentication')) {
    return 'There was an issue with authentication. Please try logging in again.';
  }

  // Network/connection issues
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'Unable to connect to the network. Please check your internet connection and try again.';
  }

  // Trap messages (backend errors)
  if (lowerMessage.includes('trap') || lowerMessage.includes('canister')) {
    // Extract the meaningful part after "trap" or return a generic message
    const trapMatch = errorMessage.match(/trap[:\s]+(.+)/i);
    if (trapMatch && trapMatch[1]) {
      return trapMatch[1].trim();
    }
    return 'A backend error occurred. Please try again or contact support if the issue persists.';
  }

  // Authorization errors (handled by existing utility)
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('permission')) {
    return errorMessage; // Keep authorization messages as-is
  }

  // Default: return the original message if it's already user-friendly
  // (short, no stack traces, no technical jargon)
  if (errorMessage.length < 150 && !errorMessage.includes('\n') && !errorMessage.includes('at ')) {
    return errorMessage;
  }

  // Fallback for complex/technical errors
  return 'An unexpected error occurred. Please try again or reload the page.';
}
