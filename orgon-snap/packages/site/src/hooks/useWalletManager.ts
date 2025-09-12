import { useCallback, useMemo, useRef } from 'react';
import { useWalletStore, useWalletActions } from '../store/walletStore';
import { useNetworkStore, useNetworkActions } from '../store/networkStore';
import { createServices } from '../services';
import { useInvokeSnap } from './useInvokeSnap';
import { useRequest } from './useRequest';
import type { OrgonAccount, OrgonBalance } from '../types/snap';

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
  const networkActions = useNetworkActions();
  
  // Create services (memoized to prevent recreation on every render)
  const services = useMemo(() => createServices(invokeSnap, request), [invokeSnap, request]);
  
  // Debounce refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshAllTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const accountsData = await services.wallet.getAccounts();
      walletActions.setAccounts(accountsData);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      walletActions.setError(err.message || 'Failed to load accounts');
    } finally {
      walletActions.setLoading(false);
    }
  }, [services.wallet, walletActions]);

  const loadBalancesForAccounts = useCallback(async (accountsToLoad: OrgonAccount[], networkId?: string) => {
    if (!accountsToLoad || accountsToLoad.length === 0) {
      return;
    }
    
    try {
      const balanceResults = await Promise.all(
        accountsToLoad.map(async (account) => {
          try {
            const balance = await services.wallet.getBalance(account.address, networkId);
            return { accountId: account.id, balance };
          } catch (err) {
            console.error(`Failed to get balance for ${account.address}:`, err);
            return { accountId: account.id, balance: null };
          }
        })
      );
      
      const newBalances: Record<string, OrgonBalance> = {};
      balanceResults.forEach(({ accountId, balance }) => {
        if (balance) {
          newBalances[accountId] = balance;
        }
      });
      
      walletActions.updateBalances(newBalances);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  }, [services.wallet, walletActions]);

  const createAccount = useCallback(async (name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const account = await services.wallet.createAccount(name);
      walletActions.addAccount(account);
      
      // Load balance for the new account
      if (currentNetwork) {
        const balance = await services.wallet.getBalance(account.address, currentNetwork.chainId);
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
  }, [services.wallet, walletActions, currentNetwork]);

  const importAccount = useCallback(async (privateKey: string, name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const account = await services.wallet.importAccount(privateKey, name);
      walletActions.addAccount(account);
      
      // Load balance for the imported account
      if (currentNetwork) {
        const balance = await services.wallet.getBalance(account.address, currentNetwork.chainId);
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
  }, [services.wallet, walletActions, currentNetwork]);

  const importAccountFromMnemonic = useCallback(async (mnemonic: string, name?: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const account = await services.wallet.importAccountFromMnemonic(mnemonic, name);
      walletActions.addAccount(account);
      
      // Load balance for the imported account
      if (currentNetwork) {
        const balance = await services.wallet.getBalance(account.address, currentNetwork.chainId);
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
  }, [services.wallet, walletActions, currentNetwork]);

  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      await services.wallet.deleteAccount(accountId);
      walletActions.removeAccount(accountId);
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      walletActions.setError(err.message || 'Failed to delete account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [services.wallet, walletActions]);

  const exportAccount = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const result = await services.wallet.exportAccount(accountId);
      return result;
    } catch (err: any) {
      console.error('Failed to export account:', err);
      walletActions.setError(err.message || 'Failed to export account');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [services.wallet, walletActions]);

  const getAccountMnemonic = useCallback(async (accountId: string) => {
    try {
      walletActions.setLoading(true);
      walletActions.clearError();
      
      const result = await services.wallet.getAccountMnemonic(accountId);
      return result;
    } catch (err: any) {
      console.error('Failed to get account mnemonic:', err);
      walletActions.setError(err.message || 'Failed to get account mnemonic');
      throw err;
    } finally {
      walletActions.setLoading(false);
    }
  }, [services.wallet, walletActions]);

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
        
        const balance = await services.wallet.getBalance(account.address, currentNetwork.chainId);
        walletActions.updateBalance(accountId, balance);
      } catch (err: any) {
        console.error(`Failed to refresh balance for ${accountId}:`, err);
        walletActions.setError(err.message || `Failed to refresh balance for ${accountId}`);
      } finally {
        walletActions.setRefreshingWallet(accountId, false);
      }
    }, 300); // 300ms debounce
  }, [accounts, currentNetwork, services.wallet, walletActions]);

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
