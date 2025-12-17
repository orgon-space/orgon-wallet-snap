/**
 * Wallet Layer - Complete wallet functionality
 * Combines: WalletService, WalletStore, and useWalletManager
 */

import { useCallback, useMemo, useRef } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrgonAccount, OrgonBalance } from '../types';
import { useInvokeSnap, useRequest } from './metamask';
import { useNetworkStore } from './network';

// ============================================================================
// Token Balance Utilities
// ============================================================================

export interface TokenBalance {
  type: 'native' | 'orc10' | 'orc20';
  symbol: string;
  address?: string;
  decimals: number;
  value: number;
}

/**
 * Parse wallet balance into a standardized token balance array
 */
export function parseTokenBalances(balance?: OrgonBalance): TokenBalance[] {
  const tokenBalances: TokenBalance[] = [];

  // Add native ORGON token
  if (balance) {
    tokenBalances.push({
      type: 'native',
      symbol: 'ORGON',
      decimals: 6,
      value: balance.balance || 0,
    });
  }

  // Parse AssetV2 tokens (ORC10)
  if (balance?.assetV2 && Array.isArray(balance.assetV2)) {
    balance.assetV2.forEach((asset: any) => {
      tokenBalances.push({
        type: 'orc10',
        symbol: asset.key,
        address: asset.key,
        decimals: 6,
        value: asset.value || 0,
      });
    });
  }

  // Parse ORC20 tokens
  if (balance?.orc20 && Array.isArray(balance.orc20)) {
    balance.orc20.forEach((tokenObj: any) => {
      Object.entries(tokenObj).forEach(([address, tokenValue]) => {
        tokenBalances.push({
          type: 'orc20',
          symbol: address,
          address: address,
          decimals: 4,
          value: Number(tokenValue) || 0,
        });
      });
    });
  }

  return tokenBalances;
}

/**
 * Hook to get formatted token balances from a wallet account
 */
export function useTokenBalances(account?: OrgonAccount): TokenBalance[] {
  return useMemo(() => {
    if (!account?.balance) return [];
    return parseTokenBalances(account.balance);
  }, [account?.balance]);
}

// ============================================================================
// Wallet Service - Snap Communication
// ============================================================================

export interface WalletServiceInterface {
  getAccounts(): Promise<OrgonAccount[]>;
  createAccount(name?: string): Promise<OrgonAccount>;
  importAccount(privateKey: string, name?: string): Promise<OrgonAccount>;
  importAccountFromMnemonic(mnemonic: string, name?: string): Promise<OrgonAccount>;
  deleteAccount(accountId: string): Promise<void>;
  exportAccount(accountId: string): Promise<{ privateKey: string; address: string }>;
  getAccountMnemonic(accountId: string): Promise<{ accountId: string; address: string; mnemonic: string }>;
  getBalance(address: string, networkId?: string): Promise<any>;
}

export class WalletService implements WalletServiceInterface {
  constructor(
    private invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>,
    private request: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
  ) {}

  async getAccounts(): Promise<OrgonAccount[]> {
    try {
      const accounts = await this.invokeSnap({
        method: 'keyring_listAccounts',
      });
      return accounts as OrgonAccount[];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      throw new Error('Failed to get accounts');
    }
  }

  async createAccount(name?: string): Promise<OrgonAccount> {
    try {
      console.log('Creating account with name:', name);

      const account = await this.invokeSnap({
        method: 'keyring_createAccount',
        params: { name },
      });

      console.log('Account created successfully:', account);
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Error creating account:', error);

      // Check if it's a permissions error
      if (error?.message?.includes('Unauthorized') || error?.code === 4100) {
        try {
          console.log('Requesting keyring permissions...');
          await this.requestKeyringPermissions();

          // Retry the account creation after requesting permissions
          const account = await this.invokeSnap({
            method: 'keyring_createAccount',
            params: { name },
          });

          console.log('Account created successfully after permission request:', account);
          return account as OrgonAccount;
        } catch (permissionError) {
          throw new Error('Please grant the required permissions to create Orgon accounts. You may need to reinstall the snap.');
        }
      } else {
        throw new Error(error?.message || 'Failed to create account');
      }
    }
  }

  async importAccount(privateKey: string, name?: string): Promise<OrgonAccount> {
    try {
      const account = await this.invokeSnap({
        method: 'keyring_importAccount',
        params: { privateKey, name },
      });
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Failed to import account:', error);
      throw new Error(error?.message || 'Failed to import account');
    }
  }

  async importAccountFromMnemonic(mnemonic: string, name?: string): Promise<OrgonAccount> {
    try {
      const account = await this.invokeSnap({
        method: 'keyring_importAccountFromMnemonic',
        params: { mnemonic, name },
      });
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Failed to import account from mnemonic:', error);
      throw new Error(error?.message || 'Failed to import account from mnemonic');
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      await this.invokeSnap({
        method: 'keyring_deleteAccount',
        params: { accountId },
      });
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      throw new Error(error?.message || 'Failed to delete account');
    }
  }

  async exportAccount(accountId: string): Promise<{ privateKey: string; address: string }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_exportAccount',
        params: { accountId },
      });
      return result as { privateKey: string; address: string };
    } catch (error: any) {
      console.error('Failed to export account:', error);
      throw new Error(error?.message || 'Failed to export account');
    }
  }

  async getAccountMnemonic(accountId: string): Promise<{ accountId: string; address: string; mnemonic: string }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_getAccountMnemonic',
        params: { accountId },
      });
      return result as { accountId: string; address: string; mnemonic: string };
    } catch (error: any) {
      console.error('Failed to get account mnemonic:', error);
      throw new Error(error?.message || 'Failed to get account mnemonic');
    }
  }

  async getBalance(address: string, networkId?: string): Promise<any> {
    try {
      console.log('Getting balance for:', { address, networkId });
      const data = await this.invokeSnap({
        method: 'orgon_getAccountV1',
        params: { address, networkId },
      }) as { data: any };
      console.log('Balance result:', data?.data);

      return data?.data;
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      throw new Error(error?.message || 'Failed to get balance');
    }
  }

  private async requestKeyringPermissions(): Promise<void> {
    try {
      await this.request({
        method: 'wallet_requestPermissions',
        params: [{
          'wallet_snap': {}
        }] as any
      });
    } catch (error) {
      console.error('Error requesting keyring permissions:', error);
      throw error;
    }
  }
}

// ============================================================================
// Wallet Store - Zustand State Management
// ============================================================================

interface WalletState {
  // State
  accounts: OrgonAccount[];
  balances: Record<string, any>;
  loading: boolean;
  error: string | null;
  refreshingWallets: Set<string>;
  refreshingAllBalances: boolean;

  // Actions
  setAccounts: (accounts: OrgonAccount[]) => void;
  addAccount: (account: OrgonAccount) => void;
  removeAccount: (accountId: string) => void;
  updateBalance: (accountId: string, balance: any) => void;
  updateBalances: (balances: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshingWallet: (accountId: string, refreshing: boolean) => void;
  setRefreshingAllBalances: (refreshing: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      // Initial state
      accounts: [],
      balances: {},
      loading: false,
      error: null,
      refreshingWallets: new Set(),
      refreshingAllBalances: false,

      // Actions
      setAccounts: (accounts) => set({ accounts }, false, 'setAccounts'),

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account]
        }), false, 'addAccount'),

      removeAccount: (accountId) =>
        set((state) => ({
          accounts: state.accounts.filter(acc => acc.id !== accountId),
          balances: Object.fromEntries(
            Object.entries(state.balances).filter(([id]) => id !== accountId)
          ),
          refreshingWallets: new Set(
            Array.from(state.refreshingWallets).filter(id => id !== accountId)
          )
        }), false, 'removeAccount'),

      updateBalance: (accountId, balance) =>
        set((state) => ({
          balances: { ...state.balances, [accountId]: balance }
        }), false, 'updateBalance'),

      updateBalances: (balances) =>
        set({ balances }, false, 'updateBalances'),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      setRefreshingWallet: (accountId, refreshing) =>
        set((state) => {
          const newSet = new Set(state.refreshingWallets);
          if (refreshing) {
            newSet.add(accountId);
          } else {
            newSet.delete(accountId);
          }
          return { refreshingWallets: newSet };
        }, false, 'setRefreshingWallet'),

      setRefreshingAllBalances: (refreshing) =>
        set({ refreshingAllBalances: refreshing }, false, 'setRefreshingAllBalances'),

      clearError: () => set({ error: null }, false, 'clearError'),

      reset: () => set({
        accounts: [],
        balances: {},
        loading: false,
        error: null,
        refreshingWallets: new Set(),
        refreshingAllBalances: false
      }, false, 'reset')
    }),
    { name: 'wallet-store' }
  )
);

// Selectors for better performance
export const useWalletAccounts = () => useWalletStore(state => state.accounts);
export const useWalletBalances = () => useWalletStore(state => state.balances);
export const useWalletLoading = () => useWalletStore(state => state.loading);
export const useWalletError = () => useWalletStore(state => state.error);
export const useWalletActions = () => {
  const setAccounts = useWalletStore(state => state.setAccounts);
  const addAccount = useWalletStore(state => state.addAccount);
  const removeAccount = useWalletStore(state => state.removeAccount);
  const updateBalance = useWalletStore(state => state.updateBalance);
  const updateBalances = useWalletStore(state => state.updateBalances);
  const setLoading = useWalletStore(state => state.setLoading);
  const setError = useWalletStore(state => state.setError);
  const setRefreshingWallet = useWalletStore(state => state.setRefreshingWallet);
  const setRefreshingAllBalances = useWalletStore(state => state.setRefreshingAllBalances);
  const clearError = useWalletStore(state => state.clearError);
  const reset = useWalletStore(state => state.reset);

  return {
    setAccounts,
    addAccount,
    removeAccount,
    updateBalance,
    updateBalances,
    setLoading,
    setError,
    setRefreshingWallet,
    setRefreshingAllBalances,
    clearError,
    reset
  };
};

// ============================================================================
// Wallet Manager Hook - Main Interface
// ============================================================================

export const useWalletManager = () => {
  const invokeSnap = useInvokeSnap();
  const request = useRequest();

  // Store state
  const accounts = useWalletStore(state => state.accounts);
  const balances = useWalletStore(state => state.balances);
  const loading = useWalletStore(state => state.loading);
  const error = useWalletStore(state => state.error);
  const refreshingWallets = useWalletStore(state => state.refreshingWallets);
  const refreshingAllBalances = useWalletStore(state => state.refreshingAllBalances);

  const currentNetwork = useNetworkStore(state => state.currentNetwork);

  // Store actions
  const walletActions = useWalletActions();

  // Create wallet service (memoized to prevent recreation on every render)
  const walletService = useMemo(() => new WalletService(invokeSnap, request), [invokeSnap, request]);

  // Debounce refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshAllTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const accountsData = await walletService.getAccounts();
      walletActions.setAccounts(accountsData);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      walletActions.setError(err.message || 'Failed to load accounts');
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions]);

  const loadBalancesForAccounts = useCallback(async (accountsToLoad: OrgonAccount[], networkId?: string) => {
    if (!accountsToLoad || accountsToLoad.length === 0) {
      return;
    }

    try {
      const balanceResults = await Promise.all(
        accountsToLoad.filter(account => account && account.address).map(async (account) => {
          try {
            const balance = await walletService.getBalance(account.address, networkId);
            return { accountId: account.id, balance };
          } catch (err) {
            console.error(`Failed to get balance for ${account.address}:`, err);
            return { accountId: account.id, balance: null };
          }
        })
      );

      const newBalances: Record<string, any> = {};
      balanceResults.forEach(({ accountId, balance }) => {
        if (balance) {
          newBalances[accountId] = balance;
        }
      });

      walletActions.updateBalances(newBalances);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  }, [walletService, walletActions]);

  const createAccount = useCallback(async (name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const account = await walletService.createAccount(name);
      walletActions.addAccount(account);

      // Load balance for the new account
      if (currentNetwork) {
        const balance = await walletService.getBalance(account.address, currentNetwork.chainId);
        walletActions.updateBalance(account.id, balance);
      }

      return account;
    } catch (err: any) {
      console.error('Failed to create account:', err);
      walletActions.setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions, currentNetwork]);

  const importAccount = useCallback(async (privateKey: string, name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const account = await walletService.importAccount(privateKey, name);
      walletActions.addAccount(account);

      // Load balance for the imported account
      if (currentNetwork) {
        const balance = await walletService.getBalance(account.address, currentNetwork.chainId);
        walletActions.updateBalance(account.id, balance);
      }
      return account;
    } catch (err: any) {
      console.error('Failed to import account:', err);
      walletActions.setError(err.message || 'Failed to import account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions, currentNetwork]);

  const importAccountFromMnemonic = useCallback(async (mnemonic: string, name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const account = await walletService.importAccountFromMnemonic(mnemonic, name);
      walletActions.addAccount(account);

      // Load balance for the imported account
      if (currentNetwork) {
        const balance = await walletService.getBalance(account.address, currentNetwork.chainId);
        walletActions.updateBalance(account.id, balance);
      }

      return account;
    } catch (err: any) {
      console.error('Failed to import account from mnemonic:', err);
      walletActions.setError(err.message || 'Failed to import account from mnemonic');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions, currentNetwork]);

  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      await walletService.deleteAccount(accountId);
      walletActions.removeAccount(accountId);
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      walletActions.setError(err.message || 'Failed to delete account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions]);

  const exportAccount = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const result = await walletService.exportAccount(accountId);
      return result;
    } catch (err: any) {
      console.error('Failed to export account:', err);
      walletActions.setError(err.message || 'Failed to export account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions]);

  const getAccountMnemonic = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();

      const result = await walletService.getAccountMnemonic(accountId);
      return result;
    } catch (err: any) {
      console.error('Failed to get account mnemonic:', err);
      walletActions.setError(err.message || 'Failed to get account mnemonic');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [walletService, walletActions]);

  const refreshWalletBalance = useCallback(async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || !currentNetwork) return;

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debounce the refresh to prevent rapid successive calls
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        walletActions.setRefreshingWallet(accountId, true);
        walletActions.clearError();

        const balance = await walletService.getBalance(account.address, currentNetwork.chainId);
        walletActions.updateBalance(accountId, balance);
      } catch (err: any) {
        console.error(`Failed to refresh balance for ${accountId}:`, err);
        walletActions.setError(err.message || `Failed to refresh balance for ${accountId}`);
      } finally {
        walletActions.setRefreshingWallet(accountId, false);
      }
    }, 300); // 300ms debounce
  }, [accounts, currentNetwork, walletService, walletActions]);

  const refreshAllBalances = useCallback(async (networkChainId?: string) => {
    const chainIdToUse = networkChainId || currentNetwork?.chainId;
    if (!accounts || accounts.length === 0 || !chainIdToUse) return;

    // Clear any existing timeout
    if (refreshAllTimeoutRef.current) {
      clearTimeout(refreshAllTimeoutRef.current);
    }

    // Debounce the refresh to prevent rapid successive calls
    refreshAllTimeoutRef.current = setTimeout(async () => {
      try {
        walletActions.setRefreshingAllBalances(true);
        walletActions.clearError();

        await loadBalancesForAccounts(accounts, chainIdToUse);
      } catch (err: any) {
        console.error('Failed to refresh all balances:', err);
        walletActions.setError(err.message || 'Failed to refresh all balances');
      } finally {
        walletActions.setRefreshingAllBalances(false);
      }
    }, 500); // 500ms debounce for all balances
  }, [accounts, currentNetwork, loadBalancesForAccounts, walletActions]);

  return {
    // State
    accounts,
    balances,
    loading,
    error,
    refreshingWallets,
    refreshingAllBalances,
    currentNetwork,

    // Actions
    loadAccounts,
    loadBalancesForAccounts,
    createAccount,
    importAccount,
    importAccountFromMnemonic,
    deleteAccount,
    exportAccount,
    getAccountMnemonic,
    refreshWalletBalance,
    refreshAllBalances,
    clearError: walletActions.clearError,
  };
};

