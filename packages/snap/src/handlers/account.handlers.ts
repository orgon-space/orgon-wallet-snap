/**
 * Account request handlers
 * Handles all account-related RPC and keyring requests
 */

import {
  listAccounts,
  createAccount,
  importAccount,
  importAccountFromMnemonic,
  exportAccount,
  getAccountMnemonic,
  deleteAccount,
} from '../services';

/**
 * Handle keyring_listAccounts request
 */
export async function handleListAccounts(): Promise<any> {
  return await listAccounts();
}

/**
 * Handle keyring_createAccount request
 * @param params - Request parameters
 */
export async function handleCreateAccount(params: any): Promise<any> {
  return await createAccount(params);
}

/**
 * Handle keyring_importAccount request
 * @param params - Request parameters
 */
export async function handleImportAccount(params: any): Promise<any> {
  return await importAccount(params);
}

/**
 * Handle keyring_importAccountFromMnemonic request
 * @param params - Request parameters
 */
export async function handleImportAccountFromMnemonic(params: any): Promise<any> {
  return await importAccountFromMnemonic(params);
}

/**
 * Handle keyring_exportAccount request
 * @param params - Request parameters
 */
export async function handleExportAccount(params: any): Promise<any> {
  return await exportAccount(params);
}

/**
 * Handle keyring_getAccountMnemonic request
 * @param params - Request parameters
 */
export async function handleGetAccountMnemonic(params: any): Promise<any> {
  return await getAccountMnemonic(params);
}

/**
 * Handle keyring_deleteAccount request
 * @param params - Request parameters
 */
export async function handleDeleteAccount(params: any): Promise<any> {
  return await deleteAccount(params);
}


