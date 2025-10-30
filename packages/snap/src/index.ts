/**
 * Orgon Snap Entry Point
 * Main handlers for RPC and Keyring requests
 */

import type { OnRpcRequestHandler, OnKeyringRequestHandler } from '@metamask/snaps-sdk';
import { showHelloDialog } from './ui';
import {
  listAccounts,
  createAccount,
  importAccount,
  importAccountFromMnemonic,
  exportAccount,
  getAccountMnemonic,
  deleteAccount,
} from './services/account.service';
import {
  getAccount,
  getAccountResources,
  getAccountTransactions,
  getAccountV1,
  getTransaction,
  getTransactionInfo,
  signAndBroadcastTransaction,
} from './services/transaction.service';
import {
  getSupportedNetworks,
  getCurrentNetwork,
  switchNetwork,
} from './services/network.service';

/**
 * Handle incoming JSON-RPC requests via wallet_invokeSnap
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

    // Account & Balance (GET_ACCOUNT endpoint)
    case 'orgon_getAccount': {
      const params = request.params as any;
      return await getAccount(params?.address, params?.networkId);
    }

    // Account Resources (GET_ACCOUNT_RESOURCES endpoint)
    case 'orgon_getAccountResources': {
      const params = request.params as any;
      return await getAccountResources(params?.address, params?.networkId);
    }

    // Account & Balance (GETv1_ACCOUNT endpoint)
    case 'orgon_getAccountV1': {
      const params = request.params as any;
      return await getAccountV1(params?.address, params?.networkId);
    }

    // Account Transactions (GETv1_TRANSACTIONS endpoint)
    case 'orgon_getAccountTransactions': {
      const params = request.params as any;
      return await getAccountTransactions(params?.address, params?.networkId, params?.limit);
    }

    // Transaction by ID (GET_TRANSACTION endpoint)
    case 'orgon_getTransaction': {
      const params = request.params as any;
      return await getTransaction(params?.txId, params?.networkId);
    }

    // Transaction Info (GET_TRANSACTION_INFO endpoint)
    case 'orgon_getTransactionInfo': {
      const params = request.params as any;
      return await getTransactionInfo(params?.txId, params?.networkId);
    }

    // Sign and Broadcast Transaction (BROADCAST_TRANSACTION endpoint)
    case 'orgon_sendTransaction':
      return await signAndBroadcastTransaction(request.params as any);

    // Networks
    case 'orgon_getNetworks': {
      const networks = await getSupportedNetworks();
      return networks.map((network) => ({
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        explorerUrl: network.explorerUrl,
      }));
    }

    case 'orgon_getAllNodes': {
      const networks = await getSupportedNetworks();
      return networks.map((network) => ({
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        explorerUrl: network.explorerUrl,
      }));
    }

    // Account Management (exposed via RPC for frontend compatibility)
    case 'keyring_listAccounts':
      return await listAccounts();

    case 'keyring_createAccount':
      return await createAccount(request.params as any);

    case 'keyring_exportAccount':
      return await exportAccount(request.params as any);

    case 'keyring_importAccount':
      return await importAccount(request.params as any);

    case 'keyring_importAccountFromMnemonic':
      return await importAccountFromMnemonic(request.params as any);

    case 'keyring_getAccountMnemonic':
      return await getAccountMnemonic(request.params as any);

    case 'keyring_deleteAccount':
      return await deleteAccount(request.params as any);

    case 'keyring_getSupportedNetworks': {
      const networks = await getSupportedNetworks();
      return networks.map((network) => ({
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        explorerUrl: network.explorerUrl,
      }));
    }

    case 'keyring_switchNetwork':
      return await switchNetwork(request.params as any);

    case 'keyring_getCurrentNetwork':
      return await getCurrentNetwork();

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
 * @param args - Keyring request handler arguments
 * @param args.request - Keyring request object
 * @returns Response data
 */
export const onKeyringRequest: OnKeyringRequestHandler = async ({ request }): Promise<any> => {
  switch (request.method) {
    case 'keyring_listAccounts':
      return await listAccounts();

    case 'keyring_createAccount':
      return await createAccount(request.params as any);

    case 'keyring_exportAccount':
      return await exportAccount(request.params as any);

    case 'keyring_importAccount':
      return await importAccount(request.params as any);

    case 'keyring_importAccountFromMnemonic':
      return await importAccountFromMnemonic(request.params as any);

    case 'keyring_getAccountMnemonic':
      return await getAccountMnemonic(request.params as any);

    case 'keyring_deleteAccount':
      return await deleteAccount(request.params as any);

    case 'keyring_listRequests':
      return [];

    case 'keyring_getRequest':
      throw new Error('Request retrieval not implemented yet');

    case 'keyring_submitRequest':
      throw new Error('Request submission not implemented yet');

    case 'keyring_getSupportedNetworks': {
      const networks = await getSupportedNetworks();
      return networks.map((network) => ({
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        explorerUrl: network.explorerUrl,
      }));
    }

    case 'keyring_switchNetwork':
      return await switchNetwork(request.params as any);

    case 'keyring_getCurrentNetwork':
      return await getCurrentNetwork();

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};


