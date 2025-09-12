import { OrgonAccount } from './orgon-crypto';

export interface StoredAccount {
  id: string;
  name: string;
  account: OrgonAccount;
  createdAt: number;
  encryptedPrivateKey?: string;
  mnemonic?: string;
}

/**
 * Account storage utilities using Snap's state management
 */

const ACCOUNTS_KEY = 'orgon_accounts';
const ACCOUNT_COUNTER_KEY = 'orgon_account_counter';

/**
 * Get all stored accounts
 */
export async function getStoredAccounts(): Promise<StoredAccount[]> {
  try {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get'
      }
    }) as any;
    
    const accounts = state?.[ACCOUNTS_KEY];
    return accounts ? JSON.parse(accounts) : [];
  } catch (error) {
    console.error('Error getting stored accounts:', error);
    return [];
  }
}

/**
 * Save accounts to storage
 */
export async function saveAccounts(accounts: StoredAccount[]): Promise<void> {
  try {
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
          [ACCOUNTS_KEY]: JSON.stringify(accounts)
        }
      }
    });
  } catch (error) {
    console.error('Error saving accounts:', error);
    throw error;
  }
}

/**
 * Add a new account
 */
export async function addAccount(account: OrgonAccount, name?: string): Promise<StoredAccount> {
  const accounts = await getStoredAccounts();
  
  // Get the current counter and increment it
  const currentCounter = await getAccountCounter();
  const newCounter = currentCounter + 1;
  const newId = `orgon_account_${newCounter}`;
  
  // Double-check that this ID doesn't exist (safety check)
  const existingIds = new Set(accounts.map(acc => acc.id));
  if (existingIds.has(newId)) {
    // If there's a conflict, find the next available ID
    let counter = newCounter;
    let id = newId;
    while (existingIds.has(id)) {
      counter++;
      id = `orgon_account_${counter}`;
    }
    // Update the counter to the highest value found
    await setAccountCounter(counter);
    
    const storedAccount: StoredAccount = {
      id: id,
      name: name || `Orgon Account ${counter}`,
      account,
      createdAt: Date.now(),
      mnemonic: account.mnemonic
    };
    
    accounts.push(storedAccount);
    await saveAccounts(accounts);
    
    return storedAccount;
  }
  
  // Update the counter to the new value
  await setAccountCounter(newCounter);
  
  const storedAccount: StoredAccount = {
    id: newId,
    name: name || `Orgon Account ${newCounter}`,
    account,
    createdAt: Date.now(),
    mnemonic: account.mnemonic
  };
  
  accounts.push(storedAccount);
  await saveAccounts(accounts);
  
  return storedAccount;
}

/**
 * Remove an account by ID
 */
export async function removeAccount(accountId: string): Promise<void> {
  const accounts = await getStoredAccounts();
  const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
  await saveAccounts(filteredAccounts);
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId: string): Promise<StoredAccount | null> {
  const accounts = await getStoredAccounts();
  return accounts.find(acc => acc.id === accountId) || null;
}

/**
 * Update account name
 */
export async function updateAccountName(accountId: string, name: string): Promise<void> {
  const accounts = await getStoredAccounts();
  const accountIndex = accounts.findIndex(acc => acc.id === accountId);
  
  if (accountIndex !== -1) {
    accounts[accountIndex].name = name;
    await saveAccounts(accounts);
  }
}

/**
 * Get account counter
 */
async function getAccountCounter(): Promise<number> {
  try {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get'
      }
    }) as any;
    
    const counter = state?.[ACCOUNT_COUNTER_KEY];
    return counter ? parseInt(counter, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Set account counter
 */
async function setAccountCounter(counter: number): Promise<void> {
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
        [ACCOUNT_COUNTER_KEY]: counter.toString()
      }
    }
  });
}

/**
 * Clear all accounts (for testing/reset)
 */
export async function clearAllAccounts(): Promise<void> {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'clear'
    }
  });
}
