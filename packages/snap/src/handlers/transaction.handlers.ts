/**
 * Transaction request handlers
 * Handles all transaction-related RPC requests
 */

import {
  getBalance,
  getAccountInfo,
  sendTransaction,
  getTransactionInfo,
  getAccountResources,
} from '../services';

/**
 * Handle orgon_getBalance request
 * @param params - Request parameters
 */
export async function handleGetBalance(params: any): Promise<any> {
  return await getBalance(params);
}

/**
 * Handle orgon_getAccountInfo request
 * @param params - Request parameters
 */
export async function handleGetAccountInfo(params: any): Promise<any> {
  return await getAccountInfo(params);
}

/**
 * Handle orgon_sendTransaction request
 * @param params - Request parameters
 */
export async function handleSendTransaction(params: any): Promise<any> {
  return await sendTransaction(params);
}

/**
 * Handle orgon_getTransactionInfo request
 * @param params - Request parameters
 */
export async function handleGetTransactionInfo(params: any): Promise<any> {
  return await getTransactionInfo(params);
}

/**
 * Handle orgon_getAccountResources request
 * @param params - Request parameters
 */
export async function handleGetAccountResources(params: any): Promise<any> {
  return await getAccountResources(params);
}


