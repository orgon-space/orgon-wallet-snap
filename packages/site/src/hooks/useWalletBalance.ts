import { useMemo } from 'react';
import type { OrgonAccount, OrgonBalance } from '../types';

interface UseWalletBalanceProps {
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
}

export const useWalletBalance = ({ accounts, balances }: UseWalletBalanceProps) => {
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => {
      if (!account || !account.id) {
        return sum;
      }
      const balance = balances[account.id];
      return sum + (balance?.balance ? parseFloat(balance.balance.toString()) : 0);
    }, 0);
  }, [accounts, balances]);

  const formatBalance = (balance: number) => {
    return balance.toString();
  };

  const displayBalance = (balance: number) => {
    return formatBalance(balance);
  };

  return {
    totalBalance,
    formatBalance,
    displayBalance,
  };
};
