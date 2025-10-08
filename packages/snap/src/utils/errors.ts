/**
 * Error handling utilities
 * Custom error classes and error handling helpers
 */

/**
 * Base error class for Orgon Snap
 */
export class OrgonSnapError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'OrgonSnapError';
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends OrgonSnapError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Error for storage operations
 */
export class StorageError extends OrgonSnapError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}

/**
 * Error for API operations
 */
export class ApiError extends OrgonSnapError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
  }
}

/**
 * Error for blockchain operations
 */
export class BlockchainError extends OrgonSnapError {
  constructor(message: string) {
    super(message, 'BLOCKCHAIN_ERROR');
    this.name = 'BlockchainError';
  }
}

/**
 * Error for user cancellation
 */
export class UserCancelledError extends OrgonSnapError {
  constructor(message: string) {
    super(message, 'USER_CANCELLED');
    this.name = 'UserCancelledError';
  }
}

/**
 * Handle errors consistently
 * Converts unknown errors to proper Error objects
 * @param error - Error to handle
 * @param defaultMessage - Default message if error is not standard
 * @returns Formatted error message
 */
export function handleError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
}

/**
 * Wrap async operations with error handling
 * @param operation - Async operation to execute
 * @param errorMessage - Error message prefix
 * @returns Result of operation
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = handleError(error, errorMessage);
    throw new Error(`${errorMessage}: ${message}`);
  }
}

/**
 * Check if error is a user cancellation
 * @param error - Error to check
 * @returns True if user cancelled
 */
export function isUserCancellation(error: unknown): boolean {
  if (error instanceof UserCancelledError) {
    return true;
  }
  
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('cancel');
  }
  
  return false;
}


