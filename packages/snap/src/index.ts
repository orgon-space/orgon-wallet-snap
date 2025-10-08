/**
 * Orgon Snap Entry Point
 * Main handlers for RPC and Keyring requests
 */

import type { OnRpcRequestHandler, OnKeyringRequestHandler } from '@metamask/snaps-sdk';
import { showHelloDialog } from './ui';
import {
  handleListAccounts,
  handleCreateAccount,
  handleImportAccount,
  handleImportAccountFromMnemonic,
  handleExportAccount,
  handleGetAccountMnemonic,
  handleDeleteAccount,
  handleGetBalance,
  handleGetAccountInfo,
  handleSendTransaction,
  handleGetTransactionInfo,
  handleGetAccountResources,
  handleGetNetworks,
  handleGetAllNodes,
  handleGetSupportedNetworks,
  handleGetCurrentNetwork,
  handleSwitchNetwork,
} from './handlers';

/**
 * Handle incoming JSON-RPC requests via wallet_invokeSnap
 *
 * @param args - Request handler arguments
 * @param args.origin - Origin of the request
 * @param args.request - Validated JSON-RPC request object
 * @returns Response data
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    // Hello/Welcome
    case 'hello':
      return await showHelloDialog(origin);

    // Balance & Account Info
    case 'orgon_getBalance':
      return await handleGetBalance(request.params);

    case 'orgon_getAccountInfo':
      return await handleGetAccountInfo(request.params);

    case 'orgon_getAccountResources':
      return await handleGetAccountResources(request.params);

    // Transactions
    case 'orgon_sendTransaction':
      return await handleSendTransaction(request.params);

    case 'orgon_getTransactionInfo':
      return await handleGetTransactionInfo(request.params);

    // Networks
    case 'orgon_getNetworks':
      return await handleGetNetworks();

    case 'orgon_getAllNodes':
      return await handleGetAllNodes();

    // Account Management (exposed via RPC for frontend compatibility)
    case 'keyring_listAccounts':
      return await handleListAccounts();

    case 'keyring_createAccount':
      return await handleCreateAccount(request.params);

    case 'keyring_exportAccount':
      return await handleExportAccount(request.params);

    case 'keyring_importAccount':
      return await handleImportAccount(request.params);

    case 'keyring_deleteAccount':
      return await handleDeleteAccount(request.params);

    case 'keyring_getSupportedNetworks':
      return await handleGetSupportedNetworks();

    case 'keyring_switchNetwork':
      return await handleSwitchNetwork(request.params);

    case 'keyring_getCurrentNetwork':
      return await handleGetCurrentNetwork();

    // Placeholder methods (not implemented yet)
    case 'keyring_listRequests':
      return [];

    case 'keyring_getRequest':
      throw new Error('Request retrieval not implemented yet');

    case 'keyring_submitRequest':
      throw new Error('Request submission not implemented yet');

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};

/**
 * Handle keyring requests for Orgon account management
 *
 * @param args - Keyring request handler arguments
 * @param args.request - Keyring request object
 * @returns Response data
 */
export const onKeyringRequest: OnKeyringRequestHandler = async ({ request }): Promise<any> => {
  switch (request.method) {
    case 'keyring_listAccounts':
      return await handleListAccounts();

    case 'keyring_createAccount':
      return await handleCreateAccount(request.params);

    case 'keyring_exportAccount':
      return await handleExportAccount(request.params);

    case 'keyring_importAccount':
      return await handleImportAccount(request.params);

    case 'keyring_importAccountFromMnemonic':
      return await handleImportAccountFromMnemonic(request.params);

    case 'keyring_getAccountMnemonic':
      return await handleGetAccountMnemonic(request.params);

    case 'keyring_deleteAccount':
      return await handleDeleteAccount(request.params);

    case 'keyring_listRequests':
      return [];

    case 'keyring_getRequest':
      throw new Error('Request retrieval not implemented yet');

    case 'keyring_submitRequest':
      throw new Error('Request submission not implemented yet');

    case 'keyring_getSupportedNetworks':
      return await handleGetSupportedNetworks();

    case 'keyring_switchNetwork':
      return await handleSwitchNetwork(request.params);

    case 'keyring_getCurrentNetwork':
      return await handleGetCurrentNetwork();

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};


