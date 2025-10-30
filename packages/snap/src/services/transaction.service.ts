/**
 * Transaction service
 * Business logic for transaction operations
 * All methods correspond to API_ENDPOINTS
 */

import axios, { type AxiosError } from 'axios';
import type {
  TransactionBroadcastResult,
  SignTransactionParams,
  OrgonNetworkConfig,
} from '../types';
import { getAccountById } from '../storage';
import {
  signOrgonTransaction,
  getNetworkConfig,
  getDefaultNetwork,
} from '../blockchain';
import { showTransactionConfirmDialog } from '../ui';
import { API_ENDPOINTS, buildEndpoint, ERROR_MESSAGES, CONTENT_TYPE_JSON } from '../constants';
import { validateRequired, isValidOrgonAddress } from '../utils/validation';
import { UserCancelledError, ApiError } from '../utils/errors';

/**
 * Make an HTTP request to the Orgon network using axios
 * @param network - Network configuration
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param body - Request body
 * @returns Response data
 */
async function makeRequest(
  network: OrgonNetworkConfig,
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: unknown,
): Promise<any> {
  const url = `${network.rpcUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': CONTENT_TYPE_JSON,
  };

  if (network.apiKey) {
    headers['ORGON-PRO-API-KEY'] = network.apiKey;
  }

  try {
    const response = method === 'GET'
      ? await axios.get(url, { headers })
      : await axios.post(url, body, { headers });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `${ERROR_MESSAGES.API_REQUEST_FAILED}: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}

/**
 * Get account information (GET_ACCOUNT endpoint: /wallet/getaccount)
 * @param address - Account address
 * @param networkId - Optional network ID
 * @returns Account data
 */
export async function getAccount(address: string, networkId?: string): Promise<any> {
  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    return await makeRequest(network, API_ENDPOINTS.GET_ACCOUNT, 'POST', {
      address,
      visible: true,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `${ERROR_MESSAGES.BALANCE_FETCH_FAILED}: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}

/**
 * Get account information (GET_ACCOUNT endpoint: /wallet/getaccount)
 * @param address - Account address
 * @param networkId - Optional network ID
 * @returns Account data
 */
export async function getAccountV1(address: string, networkId?: string): Promise<any> {
  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    const endpoint = buildEndpoint(API_ENDPOINTS.GETv1_ACCOUNT, { address });
    return await makeRequest(network, endpoint, 'GET');
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `${ERROR_MESSAGES.BALANCE_FETCH_FAILED}: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}


/**
 * Get account resources (GET_ACCOUNT_RESOURCES endpoint: /wallet/getaccountresource)
 * @param address - Account address
 * @param networkId - Optional network ID
 * @returns Account resources (bandwidth, energy)
 */
export async function getAccountResources(address: string, networkId?: string): Promise<any> {
  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    return await makeRequest(network, API_ENDPOINTS.GET_ACCOUNT_RESOURCES, 'POST', {
      address,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `Failed to get account resources: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}

/**
 * Get account transactions (GETv1_TRANSACTIONS endpoint: /v1/accounts/{address}/transactions)
 * @param address - Account address
 * @param networkId - Optional network ID
 * @param limit - Maximum number of transactions
 * @returns Array of transactions
 */
export async function getAccountTransactions(
  address: string,
  networkId?: string,
  limit: number = 20,
): Promise<any[]> {
  validateRequired(address, 'Address');

  if (!isValidOrgonAddress(address)) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    let endpoint = buildEndpoint(API_ENDPOINTS.GETv1_TRANSACTIONS, { address });
    if (typeof limit === 'number') {
      endpoint = `${endpoint}?limit=${encodeURIComponent(String(limit))}`;
    }
    return await makeRequest(network, endpoint, 'GET');
  } catch {
    // Return empty array if transactions fetch fails (account might be new)
    return [];
  }
}

/**
 * Get transaction by ID (GET_TRANSACTION endpoint: /wallet/gettransactionbyid)
 * @param txId - Transaction ID
 * @param networkId - Optional network ID
 * @returns Transaction data
 */
export async function getTransaction(txId: string, networkId?: string): Promise<any> {
  validateRequired(txId, 'Transaction ID');

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    return await makeRequest(network, API_ENDPOINTS.GET_TRANSACTION, 'POST', {
      value: txId,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `Failed to get transaction: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}

/**
 * Get transaction info by ID (GET_TRANSACTION_INFO endpoint: /wallet/gettransactioninfobyid)
 * @param txId - Transaction ID
 * @param networkId - Optional network ID
 * @returns Transaction information
 */
export async function getTransactionInfo(txId: string, networkId?: string): Promise<any> {
  validateRequired(txId, 'Transaction ID');

  const network = networkId ? getNetworkConfig(networkId) : getDefaultNetwork();

  if (!network) {
    throw new Error(ERROR_MESSAGES.INVALID_NETWORK);
  }

  try {
    return await makeRequest(network, API_ENDPOINTS.GET_TRANSACTION_INFO, 'POST', {
      value: txId,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `Failed to get transaction info: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}

/**
 * Sign and broadcast any transaction
 * @param params - Transaction signing parameters
 * @returns Transaction broadcast result
 */
export async function signAndBroadcastTransaction(
  params: SignTransactionParams,
): Promise<TransactionBroadcastResult> {
  const { accountId, transaction, networkId } = params;

  validateRequired(accountId, 'Account ID');
  validateRequired(transaction, 'Transaction');

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

  // Show confirmation dialog with full transaction object
  const confirmed = await showTransactionConfirmDialog(
    storedAccount.account.address,
    transaction,
    network,
  );

  if (!confirmed) {
    throw new UserCancelledError(ERROR_MESSAGES.TRANSACTION_CANCELLED);
  }

  // Sign transaction
  const signedTransaction = await signOrgonTransaction(
    transaction,
    storedAccount.account.privateKey,
    network,
  );

  // Broadcast transaction
  try {
    const data = await makeRequest(
      network,
      API_ENDPOINTS.BROADCAST_TRANSACTION,
      'POST',
      signedTransaction,
    );

    if (data.result !== true) {
      throw new ApiError(data.message || ERROR_MESSAGES.TRANSACTION_FAILED);
    }

    return {
      success: true,
      txId: data.txid,
      transaction: signedTransaction,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new ApiError(
      `${ERROR_MESSAGES.TRANSACTION_FAILED}: ${axiosError.message}`,
      axiosError.response?.status,
    );
  }
}


