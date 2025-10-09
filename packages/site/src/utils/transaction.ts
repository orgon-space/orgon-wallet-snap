/**
 * Transaction creation utilities
 * Creates raw unsigned transactions using OrgonWeb
 */

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  try {
    const { Buffer } = require('buffer');
    if (typeof (window as any).Buffer === 'undefined') {
      (window as any).Buffer = Buffer;
    }
    if (typeof (globalThis as any).Buffer === 'undefined') {
      (globalThis as any).Buffer = Buffer;
    }
  } catch (error) {
    console.error('Failed to load Buffer polyfill:', error);
  }
}

// Import OrgonWeb (TronWeb)
// Note: Make sure orgonweb is installed: yarn add orgonweb
let TronWeb: any;
try {
  const tronwebModule = require('orgonweb');
  TronWeb = tronwebModule.TronWeb || tronwebModule.default || tronwebModule;
} catch (error) {
  console.error('Failed to import OrgonWeb library:', error);
}

/**
 * Network configuration interface
 */
interface NetworkConfig {
  rpcUrl: string;
  apiKey?: string;
}

/**
 * Convert string to hex
 * @param str - String to convert
 * @returns Hex string with 0x prefix
 */
function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);
    hex += hexValue.padStart(2, '0');
  }
  return '0x' + hex;
}

/**
 * Create a native ORGON transaction (TRX)
 * @param from - Sender address
 * @param to - Recipient address
 * @param amount - Amount in ORGON (will be converted to SUN)
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createOrgonTransaction(
  from: string,
  to: string,
  amount: string,
  memo?: string,
  network?: NetworkConfig,
): Promise<any> {
  if (!TronWeb) {
    throw new Error('OrgonWeb library not available');
  }

  try {
    const tronWebConfig: any = {
      fullHost: network?.rpcUrl || 'https://gate.orgon.space',
    };

    if (network?.apiKey) {
      tronWebConfig.headers = { 'ORGON-PRO-API-KEY': network.apiKey };
    }

    const tronWeb = new TronWeb(tronWebConfig);

    // Convert amount to sun
    const amountSun = tronWeb.toSun(amount);

    // Create transaction
    let transaction = await tronWeb.transactionBuilder.sendTrx(to, amountSun, from);

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create transaction');
    }

    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transaction = await tronWeb.transactionBuilder.addUpdateData(
        transaction,
        tronWeb.toHex(memo.trim()),
        'utf8',
      );
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create ORGON transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an ORC10 token transaction (TRC10/AssetV2)
 * @param from - Sender address
 * @param to - Recipient address
 * @param amount - Amount in smallest unit (already converted)
 * @param tokenId - Token ID
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createOrc10Transaction(
  from: string,
  to: string,
  amount: string,
  tokenId: string,
  memo?: string,
  network?: NetworkConfig,
): Promise<any> {
  if (!TronWeb) {
    throw new Error('OrgonWeb library not available');
  }

  try {
    const tronWebConfig: any = {
      fullHost: network?.rpcUrl || 'https://gate.orgon.space',
    };

    if (network?.apiKey) {
      tronWebConfig.headers = { 'ORGON-PRO-API-KEY': network.apiKey };
    }

    const tronWeb = new TronWeb(tronWebConfig);

    // Create TRC10 token transaction
    let transaction = await tronWeb.transactionBuilder.sendToken(
      to,
      Number(amount),
      tokenId,
      from,
    );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create transaction');
    }

    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transaction = await tronWeb.transactionBuilder.addUpdateData(
        transaction,
        tronWeb.toHex(memo.trim()),
        'utf8',
      );
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create ORC10 transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an ORC20 token transaction (TRC20)
 * @param from - Sender address
 * @param to - Recipient address
 * @param amount - Amount in smallest unit (already converted)
 * @param contractAddress - Token contract address
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createOrc20Transaction(
  from: string,
  to: string,
  amount: string,
  contractAddress: string,
  memo?: string,
  network?: NetworkConfig,
): Promise<any> {
  if (!TronWeb) {
    throw new Error('OrgonWeb library not available');
  }

  try {
    const tronWebConfig: any = {
      fullHost: network?.rpcUrl || 'https://gate.orgon.space',
    };

    if (network?.apiKey) {
      tronWebConfig.headers = { 'ORGON-PRO-API-KEY': network.apiKey };
    }

    const tronWeb = new TronWeb(tronWebConfig);

    // Encode transfer function call
    const parameter = [
      { type: 'address', value: to },
      { type: 'uint256', value: amount },
    ];

    // Create TRC20 transaction using triggerSmartContract
    const txResponse = await tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      'transfer(address,uint256)',
      { feeLimit: 100000000 }, // 100 TRX fee limit
      parameter,
      from,
    );

    if (!txResponse || !txResponse.transaction || !txResponse.transaction.raw_data) {
      throw new Error('Failed to create transaction');
    }

    let transaction = txResponse.transaction;
    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transaction = await tronWeb.transactionBuilder.addUpdateData(
        transaction,
        tronWeb.toHex(memo.trim()),
        'utf8',
      );
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create ORC20 transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

