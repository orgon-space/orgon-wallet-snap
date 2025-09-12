// Import TronWeb using require to avoid TypeScript issues
console.log('Attempting to import TronWeb...');
let TronWeb;
try {
  const tronwebModule = require('orgonweb');
  console.log('TronWeb module loaded:', !!tronwebModule);
  console.log('TronWeb module keys:', Object.keys(tronwebModule || {}));
  TronWeb = tronwebModule.TronWeb || tronwebModule.default || tronwebModule;
  console.log('TronWeb extracted:', !!TronWeb, typeof TronWeb);
} catch (error) {
  console.error('Failed to import TronWeb:', error);
  throw error;
}

/**
 * Orgon address utilities and cryptographic functions
 */

export interface OrgonAccount {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface OrgonNetworkConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  apiKey?: string;
}

export interface OrgonTransaction {
  to: string;
  amount: string; // in ORG
  data?: string;
  feeLimit?: number;
  memo?: string;
}

export interface OrgonSignedTransaction {
  visible?: boolean;
  txID: string;
  raw_data_hex: string;
  raw_data: any;
  signature: string[];
}

export interface OrgonTransactionRequest {
  from: string;
  to: string;
  amount: string;
  data?: string;
  feeLimit?: number;
  memo?: string;
}

/**
 * Orgon network configurations
 */
export const ORGON_NETWORKS: Record<string, OrgonNetworkConfig> = {
  mainnet: {
    name: 'Orgon Mainnet',
    chainId: 'orgon:mainnet',
    rpcUrl: 'https://gate.orgon.space',
    explorerUrl: 'https://orgonscan.org'
  },
  quasar: {
    name: 'Orgon quasar Testnet',
    chainId: 'orgon:quasar',
    rpcUrl: 'http://5.35.81.72:19667',
    explorerUrl: 'https://quasar.orgonscan.org'
  },
};

/**
 * Generate a new Orgon account with private key, public key, and address
 */
export function generateOrgonAccount(): OrgonAccount {
  try {
    console.log('Starting account generation...');
    console.log('TronWeb available:', !!TronWeb, typeof TronWeb);

    if (!TronWeb) {
      throw new Error('TronWeb is not available');
    }

    // Create a TronWeb instance to ensure utils are available
    const tronWebInstance = new TronWeb();


    console.log('TronWeb instance created:', !!tronWebInstance);
    console.log('TronWeb.utils available:', !!tronWebInstance.utils);
    console.log('TronWeb.utils.accounts available:', !!tronWebInstance.utils?.accounts);

    // Use TronWeb to generate a new account
    const account = tronWebInstance.utils.accounts.generateAccount();
    console.log('Account generated successfully:', !!account);

    return {
      address: account.address.base58,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Error generating Orgon account:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to generate Orgon account: ${error.message}`);
  }
}

/**
 * Generate a new Orgon account with mnemonic phrase (BIP39)
 */
export function generateOrgonAccountWithMnemonic(): OrgonAccount {
  try {
    console.log('Starting account generation with mnemonic...');
    console.log('TronWeb available:', !!TronWeb, typeof TronWeb);

    if (!TronWeb) {
      throw new Error('TronWeb is not available');
    }

    // Use TronWeb.createRandom() to generate account with mnemonic
    const accountData = TronWeb.createRandom();
    console.log('Account generated successfully:', !!accountData);
    console.log('Account data:', {
      hasAddress: !!accountData.address,
      hasPrivateKey: !!accountData.privateKey,
      hasMnemonic: !!accountData.mnemonic,
      mnemonicPhrase: accountData.mnemonic?.phrase
    });

    return {
      address: accountData.address,
      privateKey: accountData.privateKey,
      mnemonic: accountData.mnemonic?.phrase
    };
  } catch (error) {
    console.error('Error generating Orgon account with mnemonic:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to generate Orgon account with mnemonic: ${error.message}`);
  }
}

/**
 * Create Orgon account from mnemonic phrase
 */
export function createOrgonAccountFromMnemonic(mnemonic: string): OrgonAccount {
  try {
    console.log('Creating account from mnemonic...');

    if (!TronWeb) {
      throw new Error('TronWeb is not available');
    }

    // Validate mnemonic format (basic check)
    if (!mnemonic || typeof mnemonic !== 'string') {
      throw new Error('Invalid mnemonic format');
    }

    // Use TronWeb.fromMnemonic() to create account from mnemonic
    const accountData = TronWeb.fromMnemonic(mnemonic.trim());
    console.log('Account created from mnemonic successfully:', !!accountData);
    console.log('Account data:', {
      hasAddress: !!accountData.address,
      hasPrivateKey: !!accountData.privateKey,
      hasMnemonic: !!accountData.mnemonic,
      mnemonicPhrase: accountData.mnemonic?.phrase
    });

    return {
      address: accountData.address,
      privateKey: accountData.privateKey,
      mnemonic: accountData.mnemonic?.phrase || mnemonic.trim()
    };
  } catch (error) {
    console.error('Error creating Orgon account from mnemonic:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to create Orgon account from mnemonic: ${error.message}`);
  }
}

/**
 * Validate an Orgon address format
 */
export function isValidOrgonAddress(address: string): boolean {
  try {
    // Create a TronWeb instance to ensure utils are available
    const tronWebInstance = new TronWeb();


    // Use TronWeb's address validation
    return tronWebInstance.isAddress(address);
  } catch (error) {
    console.error('Error validating Orgon address:', JSON.stringify(error));
    // Fallback to basic validation
    return /^o[A-Za-z1-9]{33}$/.test(address);
  }
}

/**
 * Create Orgon account from private key
 */
export function createOrgonAccountFromPrivateKey(privateKey: string): OrgonAccount {
  // Validate private key format
  if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error('Invalid private key format');
  }

  try {
    // Create a TronWeb instance to ensure utils are available
    const tronWebInstance = new TronWeb();

    // Use TronWeb to create account from private key
    const address = tronWebInstance.address.fromPrivateKey(privateKey);

    return {
      address,
      privateKey
    };
  } catch (error) {
    console.error('Error creating Orgon account from private key:', error);
    throw new Error('Failed to create Orgon account from private key');
  }
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkConfig(chainId: string): OrgonNetworkConfig | null {
  for (const [key, config] of Object.entries(ORGON_NETWORKS)) {
    if (config.chainId === chainId) {
      return config;
    }
  }
  return null;
}

/**
 * Get default network (mainnet)
 */
export function getDefaultNetwork(): OrgonNetworkConfig {
  return ORGON_NETWORKS.mainnet || {
    name: 'Orgon Mainnet',
    chainId: 'orgon:mainnet',
    rpcUrl: 'https://api.orgongrid.io',
    explorerUrl: 'https://orgonscan.org'
  };
}

/**
 * Convert ORG to sun (1 ORG = 1,000,000 sun)
 */
export function orgToSun(org: string): number {
  try {
    const tronWebInstance = new TronWeb();

    return tronWebInstance.toSun(org);
  } catch (error) {
    console.error('Error converting ORG to sun:', error);
    // Fallback to manual calculation
    return Math.floor(parseFloat(org) * 1000000);
  }
}

/**
 * Convert sun to ORG (1 ORG = 1,000,000 sun)
 */
export function sunToOrg(sun: number): string {
  try {
    const tronWebInstance = new TronWeb();

    return tronWebInstance.fromSun(sun);
  } catch (error) {
    console.error('Error converting sun to ORG:', error);
    // Fallback to manual calculation
    return (sun / 1000000).toString();
  }
}

/**
 * Create an Orgon transaction
 */
export async function createOrgonTransaction(
  from: string,
  to: string,
  amount: string,
  memo?: string,
  network?: OrgonNetworkConfig
): Promise<any> {
  try {
    console.log('Creating Orgon transaction:', { from, to, amount, memo, network });

    // Validate addresses
    if (!isValidOrgonAddress(from)) {
      throw new Error(`Invalid from address: ${from}`);
    }
    if (!isValidOrgonAddress(to)) {
      throw new Error(`Invalid to address: ${to}`);
    }

    // Use the provided network or default to mainnet
    const networkConfig = network || getDefaultNetwork();
    console.log('Using network config:', networkConfig);

    // Create TronWeb instance with proper configuration (no private key for transaction creation)
    const tronWebConfig: any = {
      fullHost: networkConfig.rpcUrl
    };

    // Add headers if API key is provided
    if (networkConfig.apiKey) {
      tronWebConfig.headers = { "TRON-PRO-API-KEY": networkConfig.apiKey };
    }

    console.log('Creating TronWeb instance with config:', tronWebConfig);
    const tronWeb = new TronWeb(tronWebConfig);
    console.log('TronWeb instance created successfully');

    // Convert amount to sun
    console.log('Converting amount to sun:', amount);
    const amountSun = tronWeb.toSun(amount);
    console.log('Amount in sun:', amountSun);

    // Create transaction
    console.log('Building transaction...');
    const transaction = await tronWeb.transactionBuilder.sendTrx(to, amountSun, from, memo);
    console.log('Transaction created successfully:', !!transaction);
    console.log('Transaction object:', JSON.stringify(transaction, null, 2));
    console.log('Transaction object keys:', transaction ? Object.keys(transaction) : []);
    console.log('Transaction raw_data:', transaction?.raw_data);
    console.log('Transaction txID:', transaction?.txID);

    if (!transaction || !transaction.raw_data) {
      throw new Error('Transaction creation failed - invalid transaction returned');
    }

    // Add additional transaction properties that might be required
    if (!transaction.raw_data.contract) {
      console.log('Warning: Transaction missing contract data');
    }

    // Ensure transaction has proper structure
    if (!transaction.raw_data.contract || !Array.isArray(transaction.raw_data.contract)) {
      console.log('Warning: Transaction contract data is invalid');
    }

    return transaction;
  } catch (error) {
    console.error('Error creating Orgon transaction:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to create Orgon transaction: ${error.message}`);
  }
}

/**
 * Sign an Orgon transaction
 */
export async function signOrgonTransaction(
  transaction: any,
  privateKey: string,
  network?: OrgonNetworkConfig
): Promise<OrgonSignedTransaction> {
  try {
    console.log('Signing Orgon transaction:', { transaction: !!transaction, privateKey: privateKey, network });

    // Use the provided network or default to mainnet
    const networkConfig = network || getDefaultNetwork();
    console.log('Using network config for signing:', networkConfig);

    // Create TronWeb instance with proper configuration (no private key in config, we'll pass it to sign method)
    const tronWebConfig: any = {
      fullHost: networkConfig.rpcUrl
    };

    if (networkConfig.apiKey) {
      tronWebConfig.headers = { "TRON-PRO-API-KEY": networkConfig.apiKey };
    }

    console.log('Creating TronWeb instance for signing with config:', tronWebConfig);
    const tronWeb = new TronWeb(tronWebConfig);
    console.log('TronWeb instance created for signing');

    console.log('Signing transaction with private key...');
    console.log('Transaction object before signing:', {
      hasTransaction: !!transaction,
      transactionKeys: transaction ? Object.keys(transaction) : [],
      transactionType: typeof transaction
    });
    console.log('Private key length:', privateKey ? privateKey.length : 0);

    const signedTransaction = await tronWeb.trx.sign(transaction, privateKey);
    console.log('Raw signed transaction:', JSON.stringify(signedTransaction, null, 2));
    console.log('Transaction signed successfully:', !!signedTransaction);
    console.log('Signed transaction properties:', {
      hasRawData: !!signedTransaction?.raw_data_hex,
      hasSignature: !!signedTransaction?.signature,
      hasTxId: !!signedTransaction?.txID,
      signatureLength: signedTransaction?.signature?.length
    });

    if (!signedTransaction || !signedTransaction.raw_data_hex || !signedTransaction.signature) {
      throw new Error('Transaction signing failed - invalid signed transaction returned');
    }

    // Ensure signature is an array (TronWeb sometimes returns a single string)
    const signatureArray = Array.isArray(signedTransaction.signature)
      ? signedTransaction.signature
      : [signedTransaction.signature];

    // Return the complete transaction object as required by Tron network
    const result = {
      visible: signedTransaction.visible || false,
      txID: signedTransaction.txID,
      raw_data_hex: signedTransaction.raw_data_hex,
      raw_data: signedTransaction.raw_data,
      signature: signatureArray,
    };

    console.log('Final signed transaction for broadcast:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error signing transaction:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to sign transaction: ${error.message}`);
  }
}

/**
 * Validate transaction parameters
 */
export function validateTransactionParams(params: OrgonTransactionRequest): void {
  if (!params.from || !isValidOrgonAddress(params.from)) {
    throw new Error('Invalid from address');
  }

  if (!params.to || !isValidOrgonAddress(params.to)) {
    throw new Error('Invalid to address');
  }

  if (!params.amount || parseFloat(params.amount) <= 0) {
    throw new Error('Invalid amount');
  }

  // Check if amount is within reasonable limits
  const amount = parseFloat(params.amount);
  if (amount > 1000000) { // 1 million ORG limit
    throw new Error('Amount too large');
  }
}
