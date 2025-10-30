/**
 * Validation utilities
 * Pure functions for validating inputs
 */

import {
  ORGON_ADDRESS_PATTERN,
  PRIVATE_KEY_PATTERN,
  MIN_MNEMONIC_WORDS,
  MAX_TRANSACTION_AMOUNT,
  ERROR_MESSAGES,
} from '../constants';
import type { OrgonTransactionRequest } from '../types';

/**
 * Validate Orgon address format
 * @param address - Address to validate
 * @returns True if valid, false otherwise
 */
export function isValidOrgonAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return ORGON_ADDRESS_PATTERN.test(address);
}

/**
 * Validate private key format
 * @param privateKey - Private key to validate
 * @returns True if valid, false otherwise
 */
export function isValidPrivateKey(privateKey: string): boolean {
  if (!privateKey || typeof privateKey !== 'string') {
    return false;
  }
  return PRIVATE_KEY_PATTERN.test(privateKey);
}

/**
 * Validate mnemonic phrase format
 * @param mnemonic - Mnemonic phrase to validate
 * @returns True if valid, false otherwise
 */
export function isValidMnemonic(mnemonic: string): boolean {
  if (!mnemonic || typeof mnemonic !== 'string') {
    return false;
  }
  const words = mnemonic.trim().split(/\s+/);
  return words.length >= MIN_MNEMONIC_WORDS;
}


/**
 * Validate transaction parameters
 * Throws an error if validation fails
 * @param params - Transaction parameters to validate
 */
export function validateTransactionParams(params: OrgonTransactionRequest): void {
  if (!params.from || !isValidOrgonAddress(params.from)) {
    throw new Error(ERROR_MESSAGES.INVALID_FROM_ADDRESS);
  }

  if (!params.to || !isValidOrgonAddress(params.to)) {
    throw new Error(ERROR_MESSAGES.INVALID_TO_ADDRESS);
  }

  if (!params.amount || typeof params.amount !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
  }

  const amount = parseFloat(params.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
  }

  if (amount > MAX_TRANSACTION_AMOUNT) {
    throw new Error(ERROR_MESSAGES.AMOUNT_TOO_LARGE);
  }
}

/**
 * Validate required parameter exists
 * @param value - Value to check
 * @param paramName - Name of the parameter for error message
 * @throws Error if value is missing
 */
export function validateRequired<Value>(value: Value | undefined | null, paramName: string): asserts value is Value {
  if (value === undefined || value === null) {
    throw new Error(`${paramName} is required`);
  }
}

/**
 * Sanitize mnemonic phrase
 * @param mnemonic - Mnemonic to sanitize
 * @returns Sanitized mnemonic
 */
export function sanitizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize private key (remove 0x prefix if present)
 * @param privateKey - Private key to sanitize
 * @returns Sanitized private key
 */
export function sanitizePrivateKey(privateKey: string): string {
  return privateKey.replace(/^0x/i, '');
}


