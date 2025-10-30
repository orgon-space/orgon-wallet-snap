/**
 * Error handling utilities
 * Custom error classes and error handling helpers
 */

/**
 * Base error class for Orgon Snap
 */
export class OrgonSnapError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'OrgonSnapError';
    this.code = code;
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
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
    this.statusCode = statusCode;
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



