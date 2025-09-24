import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrgonAccount, OrgonBalance } from '../types/snap';

interface WalletState {
  // State
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
  loading: boolean;
  error: string | null;
  refreshingWallets: Set<string>;
  refreshingAllBalances: boolean;

  // Actions
  setAccounts: (accounts: OrgonAccount[]) => void;
  addAccount: (account: OrgonAccount) => void;
  removeAccount: (accountId: string) => void;
  updateBalance: (accountId: string, balance: OrgonBalance) => void;
  updateBalances: (balances: Record<string, OrgonBalance>) => void;
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
