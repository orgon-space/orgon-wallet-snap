/**
 * Type definitions for Orgon Snap
 * All interfaces and types used throughout the application
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/naming-convention */

// ============================================================================
// Account Types
// ============================================================================

/**
 * Represents an Orgon blockchain account
 */
export interface OrgonAccount {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

/**
 * Stored account with metadata
 */
export interface StoredAccount {
  id: string;
  name: string;
  account: OrgonAccount;
  createdAt: number;
  encryptedPrivateKey?: string;
  mnemonic?: string;
}

// ============================================================================
// Network Types
// ============================================================================

/**
 * Orgon network configuration
 */
export interface OrgonNetworkConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  apiKey?: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction request parameters
 */
export interface OrgonTransactionRequest {
  from: string;
  to: string;
  amount: string;
  data?: string;
  feeLimit?: number;
  memo?: string;
}

/**
 * Basic transaction structure
 */
export interface OrgonTransaction {
  to: string;
  amount: string;
  data?: string;
  feeLimit?: number;
  memo?: string;
}

/**
 * Signed transaction ready for broadcast
 */
export interface OrgonSignedTransaction {
  visible?: boolean;
  txID: string;
  raw_data_hex: string;
  raw_data: any;
  signature: string[];
}

/**
 * Transaction in history
 */
export interface OrgonTransactionHistory {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// ============================================================================
// Balance Types
// ============================================================================

/**
 * Account balance information
 */
export interface OrgonBalance {
  orgon: string;
  usd?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Complete account information from API
 */
export interface OrgonAccountInfo {
  address: string;
  balance: OrgonBalance;
  transactions: OrgonTransactionHistory[];
}

/**
 * Transaction broadcast result
 */
export interface TransactionBroadcastResult {
  success: boolean;
  txId: string;
  transaction?: OrgonSignedTransaction;
}

/**
 * Network switch result
 */
export interface NetworkSwitchResult {
  success: boolean;
  network: OrgonNetworkConfig;
}

// ============================================================================
// Handler Parameter Types
// ============================================================================

/**
 * Parameters for creating an account
 */
export interface CreateAccountParams {
  name?: string;
}

/**
 * Parameters for importing an account
 */
export interface ImportAccountParams {
  privateKey: string;
  name?: string;
}

/**
 * Parameters for importing from mnemonic
 */
export interface ImportMnemonicParams {
  mnemonic: string;
  name?: string;
}

/**
 * Parameters for exporting an account
 */
export interface ExportAccountParams {
  accountId: string;
}

/**
 * Parameters for deleting an account
 */
export interface DeleteAccountParams {
  accountId: string;
}

/**
 * Parameters for getting account mnemonic
 */
export interface GetMnemonicParams {
  accountId: string;
}

/**
 * Parameters for signing and broadcasting any transaction
 */
export interface SignTransactionParams {
  accountId: string;
  transaction: any; // Unsigned transaction object from TronWeb/OrgonWeb
  networkId?: string;
}

/**
 * Parameters for switching network
 */
export interface SwitchNetworkParams {
  chainId: string;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Snap state structure
 */
export interface SnapState {
  orgon_accounts?: string; // JSON stringified StoredAccount[]
  orgon_account_counter?: string;
  currentNetwork?: string;
  [key: string]: any;
}

// ============================================================================
// Export Result Types
// ============================================================================

/**
 * Result of account export
 */
export interface AccountExportResult {
  privateKey: string;
  address: string;
}

/**
 * Result of mnemonic retrieval
 */
export interface MnemonicResult {
  accountId: string;
  address: string;
  mnemonic: string;
}

/**
 * Result of account creation
 */
export interface AccountCreationResult {
  id: string;
  name: string;
  address: string;
  mnemonic?: string;
}

/**
 * Simple account list item
 */
export interface AccountListItem {
  id: string;
  name: string;
  address: string;
}


