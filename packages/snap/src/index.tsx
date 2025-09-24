import type {
  OnRpcRequestHandler,
  OnKeyringRequestHandler,
} from '@metamask/snaps-sdk';
import { Box, Text, Bold } from '@metamask/snaps-sdk/jsx';

import {
  getStoredAccounts,
  addAccount,
  removeAccount,
  getAccountById,
  StoredAccount,
} from './utils/account-storage';
import { 
  getAccountInfo, 
  getAccountBalance, 
  broadcastTransaction,
  getTransactionInfo,
  getAccountResources 
} from './utils/orgon-api';
import {
  generateOrgonAccount,
  generateOrgonAccountWithMnemonic,
  createOrgonAccountFromMnemonic,
  isValidOrgonAddress,
  createOrgonAccountFromPrivateKey,
  getDefaultNetwork,
  ORGON_NETWORKS,
  getNetworkConfig,
  createOrgonTransaction,
  signOrgonTransaction,
  validateTransactionParams,
  OrgonTransactionRequest,
} from './utils/orgon-crypto';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Text>
                Hello, <Bold>{origin}</Bold>!
              </Text>
              <Text>This is Orgon Snap for MetaMask.</Text>
              <Text>Ready to manage your Orgon accounts!</Text>
            </Box>
          ),
        },
      });

    case 'orgon_getBalance':
      return await getOrgonBalance(request.params);

    case 'orgon_getAccountInfo':
      return await getOrgonAccountInfo(request.params);

    case 'orgon_getNetworks':
      return await getOrgonNetworks();

    case 'orgon_sendTransaction':
      return await sendOrgonTransaction(request.params);

    case 'orgon_getTransactionInfo':
      return await getOrgonTransactionInfo(request.params);

    case 'orgon_getAccountResources':
      return await getOrgonAccountResources(request.params);

    case 'orgon_getAllNodes':
      return await getAllOrgonNodes();

    // Expose keyring methods through RPC interface for frontend compatibility
    case 'keyring_listAccounts':
      return await listAccounts();

    case 'keyring_createAccount':
      return await createAccount(request.params);

    case 'keyring_exportAccount':
      return await exportAccount(request.params);

    case 'keyring_importAccount':
      return await importAccount(request.params);

    case 'keyring_deleteAccount':
      return await deleteAccount(request.params);

    case 'keyring_listRequests':
      return await listRequests();

    case 'keyring_getRequest':
      return await getRequest(request.params);

    case 'keyring_submitRequest':
      return await submitRequest(request.params);

    case 'keyring_getSupportedNetworks':
      return await getSupportedNetworks();

    case 'keyring_switchNetwork':
      return await switchNetwork(request.params);

    case 'keyring_getCurrentNetwork':
      return await getCurrentNetwork();

    default:
      throw new Error('Method not found.');
  }
};

/**
 * Handle keyring requests for Orgon account management.
 *
 * @param args - The keyring request handler args.
 * @param args.request - The keyring request object.
 * @returns The result of the keyring operation.
 */
export const onKeyringRequest: OnKeyringRequestHandler = async ({
  request,
}): Promise<any> => {
  switch (request.method) {
    case 'keyring_listAccounts':
      return await listAccounts();

    case 'keyring_createAccount':
      return await createAccount(request.params);

    case 'keyring_exportAccount':
      return await exportAccount(request.params);

    case 'keyring_importAccount':
      return await importAccount(request.params);

    case 'keyring_importAccountFromMnemonic':
      return await importAccountFromMnemonic(request.params);

    case 'keyring_getAccountMnemonic':
      return await getAccountMnemonic(request.params);

    case 'keyring_deleteAccount':
      return await deleteAccount(request.params);

    case 'keyring_listRequests':
      return await listRequests();

    case 'keyring_getRequest':
      return await getRequest(request.params);

    case 'keyring_submitRequest':
      return await submitRequest(request.params);

    case 'keyring_getSupportedNetworks':
      return await getSupportedNetworks();

    case 'keyring_switchNetwork':
      return await switchNetwork(request.params);

    case 'keyring_getCurrentNetwork':
      return await getCurrentNetwork();

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};

/**
 * List all Orgon accounts managed by this snap.
 */
async function listAccounts() {
  const storedAccounts = await getStoredAccounts();

  return storedAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    address: account.account.address
  }));
}

/**
 * Create a new Orgon account with mnemonic phrase confirmation.
 *
 * @param params
 */
async function createAccount(params: any) {
  const { name } = params || {};

  // Generate new Orgon account with mnemonic
  const orgonAccount = generateOrgonAccountWithMnemonic();

  // Show mnemonic phrase to user for confirmation
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>🔐 Secure Your Wallet</Bold>
          </Text>
          <Text>Your wallet has been generated with the following recovery phrase:</Text>
          <Text>
            <Bold>{orgonAccount.mnemonic}</Bold>
          </Text>
          <Text>
            ⚠️ <Bold>IMPORTANT:</Bold> Write down these words in the exact order shown above.
            Store them in a safe place. Anyone with these words can access your wallet.
          </Text>
          <Text>
            📝 <Bold>Next steps:</Bold>
          </Text>
          <Text>1. Write down the phrase on paper</Text>
          <Text>2. Store it in a secure location</Text>
          <Text>3. Never share it with anyone</Text>
          <Text>4. Confirm you have saved it safely</Text>
        </Box>
      ),
    },
  });

  if (!confirmed) {
    throw new Error('Wallet creation cancelled - you must confirm you have saved the recovery phrase');
  }

  // Show second confirmation dialog
  const finalConfirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>✅ Final Confirmation</Bold>
          </Text>
          <Text>Have you securely saved your recovery phrase?</Text>
          <Text>
            <Bold>Address:</Bold> {orgonAccount.address}
          </Text>
          <Text>
            ⚠️ If you lose your recovery phrase, you will permanently lose access to this wallet and all funds.
          </Text>
        </Box>
      ),
    },
  });

  if (!finalConfirmed) {
    throw new Error('Wallet creation cancelled - please ensure you have saved the recovery phrase');
  }

  // Store the account
  const storedAccount = await addAccount(orgonAccount, name);

  return {
    id: storedAccount.id,
    name: storedAccount.name,
    address: storedAccount.account.address,
    mnemonic: orgonAccount.mnemonic
  };
}

/**
 * Export an Orgon account's private key.
 *
 * @param params
 */
async function exportAccount(params: any) {
  const { accountId } = params;

  if (!accountId) {
    throw new Error('Account ID is required');
  }
  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error('Account not found');
  }
  // Show confirmation dialog before exporting private key
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>Export Private Key</Bold>
          </Text>
          <Text>You are about to export the private key for account:</Text>
          <Text>
            <Bold>{storedAccount.account.address}</Bold>
          </Text>
          <Text>
            ⚠️ Keep this private key secure and never share it with anyone!
          </Text>
        </Box>
      ),
    },
  });
  if (!confirmed) {
    throw new Error('Export cancelled by user');
  }
  return {
    privateKey: storedAccount.account.privateKey,
    address: storedAccount.account.address,
  };
}

/**
 * Import an existing Orgon account.
 *
 * @param params
 */
async function importAccount(params: any) {
  const { privateKey, name } = params;

  if (!privateKey) {
    throw new Error('Private key is required');
  }

  // Validate private key format (should be 64 hex characters)
  if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error('Invalid private key format');
  }

  try {
    // Create Orgon account from private key using proper cryptography
    const orgonAccount = createOrgonAccountFromPrivateKey(privateKey);

    // Store the account
    const storedAccount = await addAccount(orgonAccount, name);

    return {
      id: storedAccount.id,
      name: storedAccount.name,
      address: storedAccount.account.address
    };
  } catch (error) {
    throw new Error(
      `Failed to import account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Import an existing Orgon account from mnemonic phrase.
 *
 * @param params
 */
async function importAccountFromMnemonic(params: any) {
  const { mnemonic, name } = params;

  if (!mnemonic) {
    throw new Error('Mnemonic phrase is required');
  }

  // Basic validation - mnemonic should be a string with words separated by spaces
  if (typeof mnemonic !== 'string' || mnemonic.trim().split(' ').length < 12) {
    throw new Error('Invalid mnemonic phrase format');
  }

  try {
    // Create Orgon account from mnemonic
    const orgonAccount = createOrgonAccountFromMnemonic(mnemonic.trim());

    // Store the account
    const storedAccount = await addAccount(orgonAccount, name);

    return {
      id: storedAccount.id,
      name: storedAccount.name,
      address: storedAccount.account.address,
      mnemonic: orgonAccount.mnemonic
    };
  } catch (error) {
    throw new Error(
      `Failed to import account from mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get the mnemonic phrase for a specific account.
 *
 * @param params
 */
async function getAccountMnemonic(params: any) {
  const { accountId } = params;

  if (!accountId) {
    throw new Error('Account ID is required');
  }

  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error('Account not found');
  }

  // Check if the account has a mnemonic phrase
  if (!storedAccount.mnemonic) {
    throw new Error('This account was not created with a mnemonic phrase');
  }

  // Show confirmation dialog before showing mnemonic phrase
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>⚠️ Security Warning</Bold>
          </Text>
          <Text>You are about to view the recovery phrase for account:</Text>
          <Text>
            <Bold>{storedAccount.account.address}</Bold>
          </Text>
          <Text>
            ⚠️ <Bold>IMPORTANT:</Bold> Anyone with this phrase can access your wallet and steal your funds!
          </Text>
          <Text>
            Only view this phrase in a secure, private location.
          </Text>
        </Box>
      ),
    },
  });

  if (!confirmed) {
    throw new Error('Mnemonic phrase access cancelled');
  }

  return {
    accountId: storedAccount.id,
    address: storedAccount.account.address,
    mnemonic: storedAccount.mnemonic
  };
}

/**
 * Delete an Orgon account.
 *
 * @param params
 */
async function deleteAccount(params: any) {
  const { accountId } = params;

  if (!accountId) {
    throw new Error('Account ID is required');
  }

  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error('Account not found');
  }

  // Show confirmation dialog before deleting account
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>Delete Account</Bold>
          </Text>
          <Text>Are you sure you want to delete this account?</Text>
          <Text>
            <Bold>{storedAccount.name}</Bold>
          </Text>
          <Text>
            <Bold>{storedAccount.account.address}</Bold>
          </Text>
          <Text>⚠️ This action cannot be undone!</Text>
        </Box>
      ),
    },
  });

  if (!confirmed) {
    throw new Error('Deletion cancelled by user');
  }

  await removeAccount(accountId);

  return { success: true };
}

/**
 * List pending requests.
 */
async function listRequests() {
  // TODO: Implement request listing
  return [];
}

/**
 * Get a specific request.
 *
 * @param params
 */
async function getRequest(params: any) {
  // TODO: Implement request retrieval
  throw new Error('Request retrieval not implemented yet');
}

/**
 * Submit a request for approval.
 *
 * @param params
 */
async function submitRequest(params: any) {
  // TODO: Implement request submission
  throw new Error('Request submission not implemented yet');
}

/**
 * Get supported Orgon networks.
 */
async function getSupportedNetworks() {
  return Object.values(ORGON_NETWORKS).map((network) => ({
    chainId: network.chainId,
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl,
  }));
}

/**
 * Get the current network.
 */
async function getCurrentNetwork() {
  try {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get'
      }
    }) as any;
    
    const currentNetworkId = state?.currentNetwork;
    
    if (currentNetworkId) {
      const networkConfig = Object.values(ORGON_NETWORKS).find(
        (network) => network.chainId === currentNetworkId,
      );
      
      if (networkConfig) {
        return {
          success: true,
          network: networkConfig,
        };
      }
    }
    
    // Return default network if no current network is set
    const defaultNetwork = getDefaultNetwork();
    return {
      success: true,
      network: defaultNetwork,
    };
  } catch (error) {
    console.error('Error getting current network:', error);
    // Return default network as fallback
    const defaultNetwork = getDefaultNetwork();
    return {
      success: true,
      network: defaultNetwork,
    };
  }
}

/**
 * Switch to a different Orgon network.
 *
 * @param params
 */
async function switchNetwork(params: any) {
  const { chainId } = params;

  if (!chainId) {
    throw new Error('Chain ID is required');
  }

  const networkConfig = Object.values(ORGON_NETWORKS).find(
    (network) => network.chainId === chainId,
  );

  if (!networkConfig) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  // Store the current network preference
  // Get current state to preserve other data
  const currentState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get'
    }
  }) as any || {};
  
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: {
        ...currentState,
        currentNetwork: chainId,
      },
    },
  });

  return {
    success: true,
    network: networkConfig,
  };
}

/**
 * Get Orgon account balance
 *
 * @param params
 */
async function getOrgonBalance(params: any) {
  const { address, networkId } = params;

  console.log('getOrgonBalance called with params:', params);

  if (!address) {
    throw new Error('Address is required');
  }

  if (!isValidOrgonAddress(address)) {
    throw new Error('Invalid Orgon address');
  }

  console.log('Looking up network for chainId:', networkId);
  const network = networkId
    ? getNetworkConfig(networkId)
    : getDefaultNetwork();

  console.log('Found network:', network);

  if (!network) {
    console.error('No network found for chainId:', networkId);
    throw new Error(`Invalid network: ${networkId}`);
  }

  try {
    console.log('Fetching balance for address:', address, 'on network:', network.name);
    const balance = await getAccountBalance(address, network);
    console.log('Balance fetched successfully:', balance);
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error(
      `Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get complete Orgon account information
 *
 * @param params
 */
async function getOrgonAccountInfo(params: any) {
  const { address, networkId } = params;

  if (!address) {
    throw new Error('Address is required');
  }

  if (!isValidOrgonAddress(address)) {
    throw new Error('Invalid Orgon address');
  }

  const network = networkId
    ? getNetworkConfig(networkId)
    : getDefaultNetwork();

  if (!network) {
    throw new Error('Invalid network');
  }

  try {
    const accountInfo = await getAccountInfo(address, network);
    return accountInfo;
  } catch (error) {
    throw new Error(
      `Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get available Orgon networks
 */
async function getOrgonNetworks() {
  return Object.values(ORGON_NETWORKS).map((network) => ({
    chainId: network.chainId,
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl,
  }));
}

/**
 * Send an Orgon transaction
 */
async function sendOrgonTransaction(params: any) {
  const { from, to, amount, memo, networkId, accountId } = params;

  if (!from || !to || !amount) {
    throw new Error('Missing required parameters: from, to, amount');
  }

  if (!accountId) {
    throw new Error('Account ID is required for signing');
  }

  // Validate transaction parameters
  const transactionParams: OrgonTransactionRequest = {
    from,
    to,
    amount,
    memo,
  };
  
  validateTransactionParams(transactionParams);

  // Get network configuration
  const network = networkId
    ? getNetworkConfig(networkId)
    : getDefaultNetwork();

  if (!network) {
    throw new Error('Invalid network');
  }

  // Get account for signing
  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error('Account not found');
  }

  if (storedAccount.account.address !== from) {
    throw new Error('Account address mismatch '+ storedAccount.account.address);
  }

  try {
    console.log('Starting transaction process:', { from, to, amount, memo, networkId, accountId });
    
    // Show confirmation dialog
    console.log('Showing confirmation dialog...');
    const confirmed = await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: (
          <Box>
            <Text>
              <Bold>Send ORG Transaction</Bold>
            </Text>
            <Text>From: {from}</Text>
            <Text>To: {to}</Text>
            <Text>Amount: {amount} ORG</Text>
            {memo && <Text>Memo: {memo}</Text>}
            <Text>Network: {network.name}</Text>
            <Text>⚠️ Please verify the details before confirming!</Text>
          </Box>
        ),
      },
    });

    if (!confirmed) {
      throw new Error('Transaction cancelled by user');
    }

    console.log('User confirmed transaction, creating transaction...');
    // Create transaction
    const transaction = await createOrgonTransaction(from, to, amount, memo, network);
    console.log('Transaction created, signing...');

    // Sign transaction
    const signedTransaction = await signOrgonTransaction(transaction, storedAccount.account.privateKey, network);
    console.log('Transaction signed, broadcasting...');

    // Broadcast transaction
    const txId = await broadcastTransaction(signedTransaction, network);
    console.log('Transaction broadcasted successfully:', txId);

    return {
      success: true,
      txId,
      transaction: signedTransaction,
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(
      `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get transaction information
 */
async function getOrgonTransactionInfo(params: any) {
  const { txId, networkId } = params;

  if (!txId) {
    throw new Error('Transaction ID is required');
  }

  const network = networkId
    ? getNetworkConfig(networkId)
    : getDefaultNetwork();

  if (!network) {
    throw new Error('Invalid network');
  }

  try {
    const txInfo = await getTransactionInfo(txId, network);
    return txInfo;
  } catch (error) {
    throw new Error(
      `Failed to get transaction info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get account resources (bandwidth, energy)
 */
async function getOrgonAccountResources(params: any) {
  const { address, networkId } = params;

  if (!address) {
    throw new Error('Address is required');
  }

  if (!isValidOrgonAddress(address)) {
    throw new Error('Invalid Orgon address');
  }

  const network = networkId
    ? getNetworkConfig(networkId)
    : getDefaultNetwork();

  if (!network) {
    throw new Error('Invalid network');
  }

  try {
    const resources = await getAccountResources(address, network);
    return resources;
  } catch (error) {
    throw new Error(
      `Failed to get account resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}


/**
 * Get all available Orgon nodes
 */
async function getAllOrgonNodes() {
  return Object.values(ORGON_NETWORKS).map((network) => ({
    chainId: network.chainId,
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl,
  }));
}
