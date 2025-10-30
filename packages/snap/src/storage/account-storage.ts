/**
 * Account storage utilities
 * Handles storing and retrieving Orgon accounts from snap state
 */

import type { OrgonAccount, StoredAccount } from '../types';
import { STORAGE_KEY_ACCOUNTS, STORAGE_KEY_ACCOUNT_COUNTER } from '../constants';
import { getState, updateState } from './state-storage';
import { StorageError } from '../utils/errors';

/**
 * Get all stored accounts
 * @returns Array of stored accounts
 */
export async function getStoredAccounts(): Promise<StoredAccount[]> {
  try {
    const state = await getState();
    const accounts = state[STORAGE_KEY_ACCOUNTS];
    return JSON.parse(accounts ?? '[]');
  } catch (error) {
    throw new StorageError(
      `Failed to get stored accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Save accounts to storage
 * @param accounts - Accounts to save
 */
export async function saveAccounts(accounts: StoredAccount[]): Promise<void> {
  try {
    const state = await getState();
    await updateState({
      ...state,
      [STORAGE_KEY_ACCOUNTS]: JSON.stringify(accounts),
    });
  } catch (error) {
    throw new StorageError(
      `Failed to save accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get the current account counter value
 * @returns Current counter value
 */
async function getAccountCounter(): Promise<number> {
  try {
    const state = await getState();
    const counter = state[STORAGE_KEY_ACCOUNT_COUNTER];
    return parseInt(counter ?? '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Set the account counter value
 * @param counter - New counter value
 */
async function setAccountCounter(counter: number): Promise<void> {
  const state = await getState();
  await updateState({
    ...state,
    [STORAGE_KEY_ACCOUNT_COUNTER]: counter.toString(),
  });
}

/**
 * Generate next available account ID
 * @param existingIds - Set of existing account IDs
 * @returns New unique account ID and counter value
 */
async function generateAccountId(
  existingIds: Set<string>,
): Promise<{ id: string; counter: number }> {
  let counter = await getAccountCounter();
  counter += 1;

  let id = `orgon_account_${counter}`;

  // Ensure uniqueness (safety check)
  while (existingIds.has(id)) {
    counter += 1;
    id = `orgon_account_${counter}`;
  }

  return { id, counter };
}

/**
 * Add a new account to storage
 * @param account - Orgon account to add
 * @param name - Optional account name
 * @returns Stored account with metadata
 */
export async function addAccount(
  account: OrgonAccount,
  name?: string,
): Promise<StoredAccount> {
  try {
    const accounts = await getStoredAccounts();
    const existingIds = new Set(accounts.map((acc) => acc.id));

    const { id, counter } = await generateAccountId(existingIds);
    await setAccountCounter(counter);

    const base: Omit<StoredAccount, 'mnemonic' | 'encryptedPrivateKey'> = {
      id,
      name: name ?? `Orgon Account ${counter}`,
      account,
      createdAt: Date.now(),
    };
    const storedAccount: StoredAccount = account.mnemonic
      ? { ...base, mnemonic: account.mnemonic }
      : { ...base } as StoredAccount;

    accounts.push(storedAccount);
    await saveAccounts(accounts);

    return storedAccount;
  } catch (error) {
    throw new StorageError(
      `Failed to add account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Remove an account from storage
 * @param accountId - ID of account to remove
 */
export async function removeAccount(accountId: string): Promise<void> {
  try {
    const accounts = await getStoredAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    await saveAccounts(filteredAccounts);
  } catch (error) {
    throw new StorageError(
      `Failed to remove account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get account by ID
 * @param accountId - Account ID to look up
 * @returns Stored account or null if not found
 */
export async function getAccountById(accountId: string): Promise<StoredAccount | null> {
  try {
    const accounts = await getStoredAccounts();
    return accounts.find((acc) => acc.id === accountId) ?? null;
  } catch (error) {
    throw new StorageError(
      `Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}



