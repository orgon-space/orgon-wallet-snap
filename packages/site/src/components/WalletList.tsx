import React from 'react';
import { Card, CardContent } from './ui/card';
import { WalletCard } from './WalletCard';
import { RefreshButton } from './RefreshButton';
import type { OrgonAccount, OrgonBalance, OrgonNetwork } from '../types';
import type { WalletService } from '../hooks/wallet';

interface WalletListProps {
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
  loading: boolean;
  refreshingWallets: Set<string>;
  currentNetwork?: any;
  walletService?: WalletService | undefined;
  onRefreshWallet?: (id: string) => void;
  onDeleteWallet?: (id: string) => void;
  onExportWallet?: (id: string) => void;
  onWithdrawExpireUnfreeze?: (
    walletId: string,
    resourceType: 'BANDWIDTH' | 'ENERGY',
  ) => void;
  onRefreshAll?: () => void;
}

export const WalletList: React.FC<WalletListProps> = ({
  accounts,
  balances,
  loading,
  refreshingWallets,
  currentNetwork,
  walletService,
  onRefreshWallet,
  onDeleteWallet,
  onExportWallet,
  onWithdrawExpireUnfreeze,
  onRefreshAll,
}) => {
  if (!accounts || accounts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Your Wallets
        </h3>
        <RefreshButton
          onClick={onRefreshAll}
          loading={loading}
        />
      </div>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts
            .filter((account) => account && account.id)
            .map((account) => {
              const balance = balances[account.id];
              return (
                <WalletCard
                  key={account.id}
                  wallet={{ ...account, ...(balance && { balance }) }}
                  onRefresh={() => onRefreshWallet?.(account.id)}
                  {...(onDeleteWallet && { onDelete: onDeleteWallet })}
                  {...(onExportWallet && { onExport: onExportWallet })}
                  {...(onWithdrawExpireUnfreeze && {
                    onWithdrawExpireUnfreeze,
                  })}
                  isRefreshing={refreshingWallets.has(account.id)}
                  currentNetwork={currentNetwork}
                  {...(walletService && { walletService })}
                />
              );
            })}
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              <span>Updating balances...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
