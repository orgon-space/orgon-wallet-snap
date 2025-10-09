/**
 * UI Dialog components
 * All user-facing confirmation and information dialogs
 */

import { Box, Text, Bold } from '@metamask/snaps-sdk/jsx';
import type { OrgonNetworkConfig } from '../types';

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
 * @param to - Recipient address
 * @param amount - Amount in ORG
 * @param memo - Optional memo
 * @param network - Network configuration
 */
export async function showTransactionConfirmDialog(
  from: string,
  to: string,
  amount: string,
  memo: string | undefined,
  network: OrgonNetworkConfig,
): Promise<boolean> {
  return (await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Text>
            <Bold>Send Transaction</Bold>
          </Text>
          <Text>From: {from}</Text>
          <Text>To: {to}</Text>
          <Text>Amount: {amount}</Text>
          {memo ? (
            <Text>Memo: {memo}</Text>
          ) : null}
          <Text>Network: {network.name}</Text>
          <Text>⚠️ Please verify the details before confirming!</Text>
        </Box>
      ),
    },
  })) as boolean;
}


