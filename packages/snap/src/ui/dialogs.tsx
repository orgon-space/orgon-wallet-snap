/**
 * UI Dialog components
 * All user-facing confirmation and information dialogs
 */

import { Box, Text, Bold } from '@metamask/snaps-sdk/jsx';
import type { OrgonNetworkConfig } from '../types';

// Import TronWeb/OrgonWeb for address conversion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TronWeb: any;
try {
  const tronwebModule = require('orgonweb');
  TronWeb = tronwebModule.TronWeb || tronwebModule.default || tronwebModule;
} catch (error) {
  // Silently ignore; address conversion will fallback gracefully
}

/**
 * Convert hex address to base58 format
 * @param hexAddress - Hex address to convert
 * @returns Base58 address or original if conversion fails
 */
function convertHexToAddress(hexAddress: string): string {
  try {
    if (!TronWeb || !hexAddress) {
      return hexAddress;
    }
    
    // Create a minimal TronWeb instance for address conversion
    const tronWeb = new TronWeb({
      fullHost: 'https://gate.orgon.space',
    });
    
    // Convert from hex to base58
    return tronWeb.address.fromHex(hexAddress);
  } catch (error) {
    // If conversion fails, return original
    return hexAddress;
  }
}

// Словарь популярных методов смарт-контрактов
const METHOD_SIGNATURES: Record<string, string> = {
  'a9059cbb': 'transfer(address,uint256)',
  '095ea7b3': 'approve(address,uint256)',
  '23b872dd': 'transferFrom(address,address,uint256)',
  '70a08231': 'balanceOf(address)',
  'dd62ed3e': 'allowance(address,address)',
  '18160ddd': 'totalSupply()',
  '313ce567': 'decimals()',
  '95d89b41': 'symbol()',
  '06fdde03': 'name()',
};

/**
 * Декодирует data для transfer(address,uint256)
 * @param {string} dataHex - hex строка (может начинаться с "0x")
 * @returns {string} - расшифрованные данные транзакции
 */
function decodeTransferManual(dataHex: string): string {
  try {
    let d = dataHex.startsWith('0x') ? dataHex.slice(2) : dataHex;
    
    if (d.length < 8) {
      return `Unknown data: ${d.substring(0, 40)}...`;
    }
    
    const methodId = d.slice(0, 8);
    const methodName = METHOD_SIGNATURES[methodId] || `Unknown (0x${methodId})`;
    const params = d.slice(8);

    // Для методов с параметрами (transfer, approve, transferFrom)
    if (methodId === 'a9059cbb' || methodId === '095ea7b3') {
      // transfer(address,uint256) или approve(address,uint256)
      if (params.length < 128) {
        return `Method: ${methodName}`;
      }
      
      // первый параметр (32 байта) — адрес, справа выровненный: берем последние 40 hex (20 байт)
      const toHex = '0x' + params.slice(24, 64);
      const toAddress = convertHexToAddress(toHex);
      
      // второй параметр (следующие 32 байта) — value
      const valueHex = params.slice(64, 128);
      const value = BigInt('0x' + valueHex).toString();
      
      return `${methodName}\nTo: ${toAddress}\nAmount: ${value}`;
      
    } else if (methodId === '23b872dd') {
      // transferFrom(address,address,uint256)
      if (params.length < 192) {
        return `Method: ${methodName}`;
      }
      
      const fromHex = '0x' + params.slice(24, 64);
      const fromAddress = convertHexToAddress(fromHex);
      
      const toHex = '0x' + params.slice(88, 128);
      const toAddress = convertHexToAddress(toHex);
      
      const valueHex = params.slice(128, 192);
      const value = BigInt('0x' + valueHex).toString();
      
      return `${methodName}\nFrom: ${fromAddress}\nTo: ${toAddress}\nAmount: ${value}`;
      
    } else if (methodId === '70a08231') {
      // balanceOf(address)
      if (params.length < 64) {
        return `Method: ${methodName}`;
      }
      
      const addressHex = '0x' + params.slice(24, 64);
      const address = convertHexToAddress(addressHex);
      
      return `${methodName}\nAddress: ${address}`;
      
    } else {
      // Для остальных методов просто показываем название
      return `Method: ${methodName}`;
    }
  } catch (error) {
    return `Unable to decode: ${dataHex.substring(0, 40)}...`;
  }
}

/**
 * Show hello/welcome dialog
 * @param origin - Origin domain of the request
 */
export async function showHelloDialog(origin: string): Promise<boolean> {
  return (await snap.request({
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
  })) as boolean;
}

/**
 * Show mnemonic backup confirmation dialog (first step)
 * @param mnemonic - Mnemonic phrase to display
 */
export async function showMnemonicBackupDialog(mnemonic: string): Promise<boolean> {
  return (await snap.request({
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
            <Bold>{mnemonic}</Bold>
          </Text>
          <Text>
            ⚠️ <Bold>IMPORTANT:</Bold> Write down these words in the exact order shown
            above. Store them in a safe place. Anyone with these words can access your
            wallet.
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
  })) as boolean;
}

/**
 * Show final account creation confirmation
 * @param address - Created account address
 */
export async function showAccountCreationConfirmDialog(
  address: string,
): Promise<boolean> {
  return (await snap.request({
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
            <Bold>Address:</Bold> {address}
          </Text>
          <Text>
            ⚠️ If you lose your recovery phrase, you will permanently lose access to this
            wallet and all funds.
          </Text>
        </Box>
      ),
    },
  })) as boolean;
}

/**
 * Show private key export confirmation
 * @param address - Account address
 */
export async function showExportPrivateKeyDialog(address: string): Promise<boolean> {
  return (await snap.request({
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
            <Bold>{address}</Bold>
          </Text>
          <Text>⚠️ Keep this private key secure and never share it with anyone!</Text>
        </Box>
      ),
    },
  })) as boolean;
}

/**
 * Show mnemonic phrase view confirmation
 * @param address - Account address
 */
export async function showMnemonicViewDialog(address: string): Promise<boolean> {
  return (await snap.request({
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
            <Bold>{address}</Bold>
          </Text>
          <Text>
            ⚠️ <Bold>IMPORTANT:</Bold> Anyone with this phrase can access your wallet and
            steal your funds!
          </Text>
          <Text>Only view this phrase in a secure, private location.</Text>
        </Box>
      ),
    },
  })) as boolean;
}

/**
 * Show account deletion confirmation
 * @param name - Account name
 * @param address - Account address
 */
export async function showDeleteAccountDialog(
  name: string,
  address: string,
): Promise<boolean> {
  return (await snap.request({
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
            <Bold>{name}</Bold>
          </Text>
          <Text>
            <Bold>{address}</Bold>
          </Text>
          <Text>⚠️ This action cannot be undone!</Text>
        </Box>
      ),
    },
  })) as boolean;
}

/**
 * Show transaction confirmation dialog
 * @param from - Sender address
 * @param transaction - Full transaction object
 * @param network - Network configuration
 */
export async function showTransactionConfirmDialog(
  from: string,
  transaction: {
    raw_data?: {
      contract?: Array<{
        type?: string;
        parameter?: { value?: Record<string, unknown> };
      }>;
      expiration?: number;
      data?: string;
    };
  },
  network: OrgonNetworkConfig,
): Promise<boolean> {
  // Extract transaction parameters
  const txType = transaction.raw_data?.contract?.[0]?.type || 'Unknown';
  const contractParam = transaction.raw_data?.contract?.[0]?.parameter?.value;
  
  // Determine recipient address based on transaction type
  let toAddress = '';
  let amount = '';
  let tokenInfo = '';
  let dataInfo = '';
  if (txType === 'TransferContract') {
    // Native ORGON transfer
    const p = contractParam as any;
    toAddress = p?.to_address ? convertHexToAddress(p.to_address as string) : 'N/A';
    amount = p?.amount ? String(p.amount) : 'N/A';
    tokenInfo = "ORGON";
  } else if (txType === 'TransferAssetContract') {
    // ORC10 token transfer
    const p = contractParam as any;
    toAddress = p?.to_address ? convertHexToAddress(p.to_address as string) : 'N/A';
    amount = p?.amount ? String(p.amount) : 'N/A';
    tokenInfo = p?.asset_name 
      ? String(p.asset_name) 
      : (p?.asset_id ? String(p.asset_id) : '');
  } else if (txType === 'TriggerSmartContract') {
    // ORC20 or smart contract call
    const p = contractParam as any;
    toAddress = p?.contract_address ? convertHexToAddress(p.contract_address as string) : 'N/A';
    tokenInfo = 'Smart Contract';
    if (p?.data) {
      dataInfo = decodeTransferManual(String(p.data));
    }
  }
  
  // Extract other parameters (convert all to strings for JSX compatibility)
  const expiration = transaction.raw_data?.expiration 
    ? new Date(transaction.raw_data.expiration).toLocaleString()
    : 'N/A';

  const data = transaction.raw_data?.data 
    ? Buffer.from(transaction.raw_data.data, 'hex').toString('utf8')
    : undefined;

  return (await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>📤 Confirm Transaction</Bold>
          </Text>
          
          <Text>
            <Bold>Type:</Bold> {txType}
          </Text>
          <Text>
            <Bold>From:</Bold> {from}
          </Text>
          
          {txType === 'TriggerSmartContract' ? (
            <Text>
              <Bold>Contract:</Bold> {toAddress}
            </Text>
          ) : (
            <Text>
              <Bold>To:</Bold> {toAddress}
            </Text>
          )}
          
          {amount ? (
            <Text>
              <Bold>Amount:</Bold> {amount}
            </Text>
          ) : null}
          
          {tokenInfo ? (
            <Text>
              <Bold>Token:</Bold> {tokenInfo}
            </Text>
          ) : null}
          
          {dataInfo ? (
            <Text>
              <Bold>Call Data:</Bold> {dataInfo}
            </Text>
          ) : null}
          
          {data ? (
            <Text>
              <Bold>Memo:</Bold> {data}
            </Text>
          ) : null}
          
          <Text>
            <Bold>Expiration:</Bold> {expiration}
          </Text>
          <Text>
            <Bold>Network:</Bold> {network.name}
          </Text>
          
          
          <Text>⚠️ Please verify all details before confirming!</Text>
        </Box>
      ),
    },
  })) as boolean;
}


