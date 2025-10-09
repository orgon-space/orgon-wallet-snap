/**
 * Blockchain cryptography operations
 * Handles account generation, address validation, and transaction operations
 */

import type {
  OrgonAccount,
  OrgonNetworkConfig,
  OrgonSignedTransaction,
  OrgonTransactionRequest,
} from '../types';
import {
  ORGON_NETWORKS,
  DEFAULT_NETWORK_KEY,
  ORGON_TO_SUN_MULTIPLIER,
  ERROR_MESSAGES,
} from '../constants';
import {
  isValidOrgonAddress,
  isValidPrivateKey,
  sanitizePrivateKey,
  sanitizeMnemonic,
  validateTransactionParams,
} from '../utils/validation';
import { BlockchainError } from '../utils/errors';

// Import TronWeb/OrgonWeb
let TronWeb: any;
try {
  const tronwebModule = require('orgonweb');
  TronWeb = tronwebModule.TronWeb || tronwebModule.default || tronwebModule;
} catch (error) {
  throw new BlockchainError('Failed to import OrgonWeb library');
}


/**
 * Generate a new Orgon account with mnemonic phrase (BIP39)
 * @returns New Orgon account with mnemonic
 */
export function generateOrgonAccountWithMnemonic(): OrgonAccount {
  try {
    if (!TronWeb) {
      throw new BlockchainError(ERROR_MESSAGES.TRONWEB_NOT_AVAILABLE);
    }

    const accountData = TronWeb.createRandom();

    return {
      address: accountData.address,
      privateKey: accountData.privateKey,
      mnemonic: accountData.mnemonic?.phrase,
    };
  } catch (error) {
    throw new BlockchainError(
      `${ERROR_MESSAGES.ACCOUNT_GENERATION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create Orgon account from mnemonic phrase
 * @param mnemonic - BIP39 mnemonic phrase
 * @returns Orgon account created from mnemonic
 */
export function createOrgonAccountFromMnemonic(mnemonic: string): OrgonAccount {
  try {
    if (!TronWeb) {
      throw new BlockchainError(ERROR_MESSAGES.TRONWEB_NOT_AVAILABLE);
    }

    const sanitized = sanitizeMnemonic(mnemonic);
    const accountData = TronWeb.fromMnemonic(sanitized);

    return {
      address: accountData.address,
      privateKey: accountData.privateKey,
      mnemonic: accountData.mnemonic?.phrase || sanitized,
    };
  } catch (error) {
    throw new BlockchainError(
      `${ERROR_MESSAGES.ACCOUNT_CREATION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create Orgon account from private key
 * @param privateKey - Private key (64 hex characters)
 * @returns Orgon account created from private key
 */
export function createOrgonAccountFromPrivateKey(privateKey: string): OrgonAccount {
  const sanitized = sanitizePrivateKey(privateKey);

  if (!isValidPrivateKey(sanitized)) {
    throw new BlockchainError(ERROR_MESSAGES.INVALID_PRIVATE_KEY);
  }

  try {
    if (!TronWeb) {
      throw new BlockchainError(ERROR_MESSAGES.TRONWEB_NOT_AVAILABLE);
    }

    // Use default network config to avoid "Invalid URL" error
    const networkConfig = getDefaultNetwork();
    const tronWebInstance = new TronWeb({
      fullHost: networkConfig.rpcUrl,
    });
    const address = tronWebInstance.address.fromPrivateKey(sanitized);

    return {
      address,
      privateKey: sanitized,
    };
  } catch (error) {
    throw new BlockchainError(
      `${ERROR_MESSAGES.ACCOUNT_CREATION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}


/**
 * Get network configuration by chain ID
 * @param chainId - Chain ID to look up
 * @returns Network configuration or null if not found
 */
export function getNetworkConfig(chainId: string): OrgonNetworkConfig | null {
  for (const config of Object.values(ORGON_NETWORKS)) {
    if (config.chainId === chainId) {
      return config;
    }
  }
  return null;
}

/**
 * Get default network (mainnet)
 * @returns Default network configuration
 */
export function getDefaultNetwork(): OrgonNetworkConfig {
  const network = ORGON_NETWORKS[DEFAULT_NETWORK_KEY];
  if (!network) {
    throw new BlockchainError('Default network configuration not found');
  }
  return network;
}


/**
 * Create an Orgon native transaction (ORGON/TRX)
 * @param from - Sender address
 * @param to - Recipient address
 * @param amount - Amount in ORG
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
/**
 * Sign an Orgon transaction
 * @param transaction - Unsigned transaction object
 * @param privateKey - Private key for signing
 * @param network - Network configuration
 * @returns Signed transaction ready for broadcast
 */
export async function signOrgonTransaction(
  transaction: any,
  privateKey: string,
  network?: OrgonNetworkConfig,
): Promise<OrgonSignedTransaction> {
  try {
    const networkConfig = network || getDefaultNetwork();

    // Create TronWeb instance with proper configuration
    const tronWebConfig: any = {
      fullHost: networkConfig.rpcUrl,
    };

    if (networkConfig.apiKey) {
      tronWebConfig.headers = { 'ORGON-PRO-API-KEY': networkConfig.apiKey };
    }

    const tronWeb = new TronWeb(tronWebConfig);

    // Remove 0x prefix from private key if present
    const cleanPrivateKey = sanitizePrivateKey(privateKey);

    const signedTransaction = await tronWeb.trx.sign(transaction, cleanPrivateKey);

    if (
      !signedTransaction ||
      !signedTransaction.raw_data_hex ||
      !signedTransaction.signature
    ) {
      throw new BlockchainError(ERROR_MESSAGES.TRANSACTION_SIGNING_FAILED);
    }

    // Ensure signature is an array
    const signatureArray = Array.isArray(signedTransaction.signature)
      ? signedTransaction.signature
      : [signedTransaction.signature];

    return {
      visible: signedTransaction.visible || false,
      txID: signedTransaction.txID,
      raw_data_hex: signedTransaction.raw_data_hex,
      raw_data: signedTransaction.raw_data,
      signature: signatureArray,
    };
  } catch (error) {
    throw new BlockchainError(
      `${ERROR_MESSAGES.TRANSACTION_SIGNING_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Export all networks
 * @returns Array of all network configurations
 */
export function getAllNetworks(): OrgonNetworkConfig[] {
  return Object.values(ORGON_NETWORKS);
}

