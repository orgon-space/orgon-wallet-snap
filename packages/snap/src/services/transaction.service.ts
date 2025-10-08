/**
 * Transaction service
 * Business logic for transaction operations
 */

import type {
  TransactionBroadcastResult,
  SendTransactionParams,
  GetTransactionInfoParams,
  GetAccountResourcesParams,
  GetBalanceParams,
  GetAccountInfoParams,
  OrgonBalance,
  OrgonAccountInfo,
} from '../types';
import { getAccountById } from '../storage';
import {
  createOrgonTransaction,
  signOrgonTransaction,
  getNetworkConfig,
  getDefaultNetwork,
} from '../blockchain';
import { createApiClient } from '../blockchain';
import { showTransactionConfirmDialog } from '../ui';
import { ERROR_MESSAGES } from '../constants';
import { validateRequired, validateTransactionParams, isValidOrgonAddress } from '../utils/validation';
import { UserCancelledError } from '../utils/errors';

/**
 * Get account balance
 * @param params - Balance query parameters
 * @returns Balance information
 */
export async function getBalance(params: GetBalanceParams): Promise<OrgonBalance> {
  const { address, networkId } = params;

  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  const apiClient = createApiClient(network);
  return await apiClient.getAccountBalance(address);
}

/**
 * Get complete account information
 * @param params - Account info query parameters
 * @returns Complete account information
 */
export async function getAccountInfo(params: GetAccountInfoParams): Promise<OrgonAccountInfo> {
  const { address, networkId } = params;

  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  const apiClient = createApiClient(network);
  return await apiClient.getAccountInfo(address);
}

/**
 * Send a transaction
 * @param params - Transaction parameters
 * @returns Transaction broadcast result
 */
export async function sendTransaction(
  params: SendTransactionParams,
): Promise<TransactionBroadcastResult> {
  const { from, to, amount, memo, networkId, accountId } = params;

  // Validate required parameters
  if (!from || !to || !amount) {
    throw new Error(ERROR_MESSAGES.TRANSACTION_PARAMS_REQUIRED);
  }

  validateRequired(accountId, 'Account ID');

  // Validate transaction parameters
  validateTransactionParams({ from, to, amount, memo });

  // Get network configuration
  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  // Get account for signing
  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  }

  if (storedAccount.account.address !== from) {
    throw new Error(
      `Account address mismatch: stored=${storedAccount.account.address}, from=${from}`,
    );
  }

  // Show confirmation dialog
  const confirmed = await showTransactionConfirmDialog(from, to, amount, memo, network);

  if (!confirmed) {
    throw new UserCancelledError(ERROR_MESSAGES.TRANSACTION_CANCELLED);
  }

  // Create transaction
  const transaction = await createOrgonTransaction(from, to, amount, memo, network);

  // Sign transaction
  const signedTransaction = await signOrgonTransaction(
    transaction,
    storedAccount.account.privateKey,
    network,
  );

  // Broadcast transaction
  const apiClient = createApiClient(network);
  const txId = await apiClient.broadcastTransaction(signedTransaction);

  return {
    success: true,
    txId,
    transaction: signedTransaction,
  };
}

/**
 * Get transaction information
 * @param params - Transaction query parameters
 * @returns Transaction information
 */
export async function getTransactionInfo(params: GetTransactionInfoParams): Promise<any> {
  const { txId, networkId } = params;

  validateRequired(txId, 'Transaction ID');

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  const apiClient = createApiClient(network);
  return await apiClient.getTransactionInfo(txId);
}

/**
 * Get account resources (bandwidth, energy)
 * @param params - Account resources query parameters
 * @returns Account resources
 */
export async function getAccountResources(params: GetAccountResourcesParams): Promise<any> {
  const { address, networkId } = params;

  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  const apiClient = createApiClient(network);
  return await apiClient.getAccountResources(address);
}


