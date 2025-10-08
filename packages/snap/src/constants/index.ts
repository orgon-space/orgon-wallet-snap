/**
 * Application constants
 * Network configurations, storage keys, and other constant values
 */

import type { OrgonNetworkConfig } from '../types';

// ============================================================================
// Network Configurations
// ============================================================================

/**
 * Available Orgon network configurations
 */
export const ORGON_NETWORKS: Record<string, OrgonNetworkConfig> = {
  mainnet: {
    name: 'Orgon Mainnet',
    chainId: 'orgon:mainnet',
    rpcUrl: 'https://gate.orgon.space',
    explorerUrl: 'https://orgonscan.org',
  },
  quasar: {
    name: 'Orgon quasar Testnet',
    chainId: 'orgon:quasar',
    rpcUrl: 'http://5.35.81.72:19667',
    explorerUrl: 'https://quasar.orgonscan.org',
  },
};

/**
 * Default network to use
 */
export const DEFAULT_NETWORK_KEY = 'mainnet';

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * Key for storing accounts in snap state
 */
export const STORAGE_KEY_ACCOUNTS = 'orgon_accounts';

/**
 * Key for storing account counter
 */
export const STORAGE_KEY_ACCOUNT_COUNTER = 'orgon_account_counter';

/**
 * Key for storing current network
 */
export const STORAGE_KEY_CURRENT_NETWORK = 'currentNetwork';

// ============================================================================
// Conversion Constants
// ============================================================================

/**
 * Conversion factor: 1 ORG = 1,000,000 sun
 */
export const ORGON_TO_SUN_MULTIPLIER = 1_000_000;

/**
 * Maximum transaction amount in ORG
 */
export const MAX_TRANSACTION_AMOUNT = 1_000_000;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Orgon address regex pattern
 * Addresses start with 'o' and are 34 characters long
 */
export const ORGON_ADDRESS_PATTERN = /^o[A-Za-z1-9]{33}$/;

/**
 * Private key regex pattern (64 hex characters)
 */
export const PRIVATE_KEY_PATTERN = /^[a-fA-F0-9]{64}$/;

/**
 * Minimum mnemonic phrase length (words)
 */
export const MIN_MNEMONIC_WORDS = 12;

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  GET_ACCOUNT: '/wallet/getaccount',
  GET_TRANSACTIONS: '/v1/accounts',
  BROADCAST_TRANSACTION: '/wallet/broadcasttransaction',
  GET_TRANSACTION_INFO: '/wallet/gettransactioninfobyid',
  GET_ACCOUNT_RESOURCES: '/wallet/getaccountresource',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
  // Account errors
  ACCOUNT_NOT_FOUND: 'Account not found',
  ACCOUNT_ID_REQUIRED: 'Account ID is required',
  INVALID_PRIVATE_KEY: 'Invalid private key format',
  INVALID_MNEMONIC: 'Invalid mnemonic phrase format',
  
  // Address errors
  ADDRESS_REQUIRED: 'Address is required',
  INVALID_ADDRESS: 'Invalid Orgon address',
  
  // Transaction errors
  TRANSACTION_PARAMS_REQUIRED: 'Missing required parameters: from, to, amount',
  INVALID_FROM_ADDRESS: 'Invalid from address',
  INVALID_TO_ADDRESS: 'Invalid to address',
  INVALID_AMOUNT: 'Invalid amount',
  AMOUNT_TOO_LARGE: 'Amount too large',
  TRANSACTION_CANCELLED: 'Transaction cancelled by user',
  TRANSACTION_FAILED: 'Failed to send transaction',
  
  // Network errors
  CHAIN_ID_REQUIRED: 'Chain ID is required',
  UNSUPPORTED_NETWORK: 'Unsupported network',
  INVALID_NETWORK: 'Invalid network',
  
  // Storage errors
  STORAGE_ERROR: 'Failed to access storage',
  
  // API errors
  API_REQUEST_FAILED: 'API request failed',
  BALANCE_FETCH_FAILED: 'Failed to fetch account balance',
  ACCOUNT_INFO_FETCH_FAILED: 'Failed to fetch account information',
  
  // Crypto errors
  TRONWEB_NOT_AVAILABLE: 'TronWeb is not available',
  ACCOUNT_GENERATION_FAILED: 'Failed to generate Orgon account',
  ACCOUNT_CREATION_FAILED: 'Failed to create Orgon account',
  TRANSACTION_CREATION_FAILED: 'Transaction creation failed',
  TRANSACTION_SIGNING_FAILED: 'Transaction signing failed',
  
  // User cancellation
  WALLET_CREATION_CANCELLED: 'Wallet creation cancelled',
  EXPORT_CANCELLED: 'Export cancelled by user',
  DELETION_CANCELLED: 'Deletion cancelled by user',
  MNEMONIC_ACCESS_CANCELLED: 'Mnemonic phrase access cancelled',
} as const;

// ============================================================================
// UI Text Constants
// ============================================================================

/**
 * UI text and labels
 */
export const UI_TEXT = {
  APP_NAME: 'Orgon Snap',
  APP_DESCRIPTION: 'Orgon Network Snap for MetaMask',
  CURRENCY_SYMBOL: 'ORG',
  SUN_UNIT: 'sun',
} as const;


