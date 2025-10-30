/**
 * Account service
 * Business logic for account management operations
 */

import type {
  AccountListItem,
  AccountCreationResult,
  AccountExportResult,
  MnemonicResult,
  CreateAccountParams,
  ImportAccountParams,
  ImportMnemonicParams,
  ExportAccountParams,
  DeleteAccountParams,
  GetMnemonicParams,
} from '../types';
import {
  getStoredAccounts,
  addAccount,
  removeAccount,
  getAccountById,
} from '../storage';
import {
  generateOrgonAccountWithMnemonic,
  createOrgonAccountFromPrivateKey,
  createOrgonAccountFromMnemonic,
} from '../blockchain';
import {
  showMnemonicBackupDialog,
  showAccountCreationConfirmDialog,
  showExportPrivateKeyDialog,
  showMnemonicViewDialog,
  showDeleteAccountDialog,
} from '../ui';
import { ERROR_MESSAGES } from '../constants';
import { validateRequired, isValidPrivateKey, isValidMnemonic, sanitizePrivateKey } from '../utils/validation';
import { UserCancelledError } from '../utils/errors';

/**
 * List all accounts
 * @returns Array of account list items
 */
export async function listAccounts(): Promise<AccountListItem[]> {
  const storedAccounts = await getStoredAccounts();

  return storedAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    address: account.account.address,
  }));
}

/**
 * Create a new account with mnemonic phrase
 * @param params - Creation parameters
 * @returns Created account result
 */
export async function createAccount(
  params: CreateAccountParams,
): Promise<AccountCreationResult> {
  const { name } = params || {};

  // Generate new Orgon account with mnemonic
  const orgonAccount = generateOrgonAccountWithMnemonic();

  // Show mnemonic phrase to user for confirmation
  if (!orgonAccount.mnemonic) {
    throw new Error('Mnemonic phrase is missing');
  }
  const confirmed = await showMnemonicBackupDialog(orgonAccount.mnemonic);

  if (!confirmed) {
    throw new UserCancelledError(
      'Wallet creation cancelled - you must confirm you have saved the recovery phrase',
    );
  }

  // Show second confirmation dialog
  const finalConfirmed = await showAccountCreationConfirmDialog(orgonAccount.address);

  if (!finalConfirmed) {
    throw new UserCancelledError(
      'Wallet creation cancelled - please ensure you have saved the recovery phrase',
    );
  }

  // Store the account
  const storedAccount = await addAccount(orgonAccount, name);

  const result: AccountCreationResult = {
    id: storedAccount.id,
    name: storedAccount.name,
    address: storedAccount.account.address,
  };

  if (orgonAccount.mnemonic) {
    result.mnemonic = orgonAccount.mnemonic;
  }

  return result;
}

/**
 * Import account from private key
 * @param params - Import parameters
 * @returns Created account result
 */
export async function importAccount(
  params: ImportAccountParams,
): Promise<AccountCreationResult> {
  const { privateKey, name } = params;

  validateRequired(privateKey, 'Private key');

  // Sanitize private key (remove 0x prefix if present and trim)
  const cleanPrivateKey = sanitizePrivateKey(privateKey.trim());

  if (!isValidPrivateKey(cleanPrivateKey)) {
    throw new Error(ERROR_MESSAGES.INVALID_PRIVATE_KEY);
  }

  const orgonAccount = createOrgonAccountFromPrivateKey(cleanPrivateKey);
  const storedAccount = await addAccount(orgonAccount, name);

  const result: AccountCreationResult = {
    id: storedAccount.id,
    name: storedAccount.name,
    address: storedAccount.account.address,
  };

  return result;
}

/**
 * Import account from mnemonic phrase
 * @param params - Import parameters
 * @returns Created account result
 */
export async function importAccountFromMnemonic(
  params: ImportMnemonicParams,
): Promise<AccountCreationResult> {
  const { mnemonic, name } = params;

  validateRequired(mnemonic, 'Mnemonic phrase');

  if (!isValidMnemonic(mnemonic)) {
    throw new Error(ERROR_MESSAGES.INVALID_MNEMONIC);
  }

  const orgonAccount = createOrgonAccountFromMnemonic(mnemonic);
  const storedAccount = await addAccount(orgonAccount, name);

  return {
    id: storedAccount.id,
    name: storedAccount.name,
    address: storedAccount.account.address,
    ...(orgonAccount.mnemonic && { mnemonic: orgonAccount.mnemonic }),
  };
}

/**
 * Export account private key
 * @param params - Export parameters
 * @returns Export result with private key
 */
export async function exportAccount(
  params: ExportAccountParams,
): Promise<AccountExportResult> {
  const { accountId } = params;

  validateRequired(accountId, 'Account ID');

  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  }

  // Show confirmation dialog before exporting private key
  const confirmed = await showExportPrivateKeyDialog(storedAccount.account.address);

  if (!confirmed) {
    throw new UserCancelledError(ERROR_MESSAGES.EXPORT_CANCELLED);
  }

  return {
    privateKey: storedAccount.account.privateKey,
    address: storedAccount.account.address,
  };
}

/**
 * Get account mnemonic phrase
 * @param params - Get mnemonic parameters
 * @returns Mnemonic result
 */
export async function getAccountMnemonic(
  params: GetMnemonicParams,
): Promise<MnemonicResult> {
  const { accountId } = params;

  validateRequired(accountId, 'Account ID');

  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  }

  // Check if the account has a mnemonic phrase
  if (!storedAccount.mnemonic) {
    throw new Error('This account was not created with a mnemonic phrase');
  }

  // Show confirmation dialog before showing mnemonic phrase
  const confirmed = await showMnemonicViewDialog(storedAccount.account.address);

  if (!confirmed) {
    throw new UserCancelledError(ERROR_MESSAGES.MNEMONIC_ACCESS_CANCELLED);
  }

  return {
    accountId: storedAccount.id,
    address: storedAccount.account.address,
    mnemonic: storedAccount.mnemonic,
  };
}

/**
 * Delete an account
 * @param params - Delete parameters
 * @returns Success status
 */
export async function deleteAccount(params: DeleteAccountParams): Promise<{ success: boolean }> {
  const { accountId } = params;

  validateRequired(accountId, 'Account ID');

  const storedAccount = await getAccountById(accountId);
  if (!storedAccount) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  }

  // Show confirmation dialog before deleting account
  const confirmed = await showDeleteAccountDialog(
    storedAccount.name,
    storedAccount.account.address,
  );

  if (!confirmed) {
    throw new UserCancelledError(ERROR_MESSAGES.DELETION_CANCELLED);
  }

  await removeAccount(accountId);

  return { success: true };
}

