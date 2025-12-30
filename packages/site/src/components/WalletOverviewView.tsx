import React from 'react';
import { WalletOverviewHeader } from './WalletOverviewHeader';
import { QuickActions } from './QuickActions';
import { WalletList } from './WalletList';
import type { OrgonAccount, OrgonBalance } from '../types';
import type { WalletService } from '../hooks/wallet';

interface WalletOverviewViewProps {
  // Computed data
  totalBalance: number;
  displayBalance: (balance: number) => string;
  hasWallets: boolean;

  // Raw data
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
  loading: boolean;
  refreshingWallets: Set<string>;
  currentNetwork?: any;
  walletService?: WalletService | undefined;

  // Action handlers
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onRefreshWallet: (walletId: string) => void;
  onDeleteWallet: (walletId: string) => void;
  onExportWallet: (walletId: string) => void;
  onWithdrawExpireUnfreeze: (walletId: string, resourceType: 'BANDWIDTH' | 'ENERGY') => void;
  onRefreshAll: () => void;
}

/**
 * WalletOverviewView - Pure presentation component
 *
 * Receives all data and handlers as props, contains no business logic.
 * Responsible only for rendering the UI.
 */
export const WalletOverviewView: React.FC<WalletOverviewViewProps> = ({
  hasWallets,
  accounts,
  balances,
  loading,
  refreshingWallets,
  currentNetwork,
  walletService,
  onCreateWallet,
  onSendTransaction,
  onImportWallet,
  onRefreshWallet,
  onDeleteWallet,
  onExportWallet,
  onWithdrawExpireUnfreeze,
  onRefreshAll,
}) => {
  return (
    <div className="space-y-6">
      <WalletOverviewHeader />

      <QuickActions
        onCreateWallet={onCreateWallet}
        onSendTransaction={onSendTransaction}
        onImportWallet={onImportWallet}
        hasWallets={hasWallets}
      />

      <WalletList
        accounts={accounts}
        balances={balances}
        loading={loading}
        refreshingWallets={refreshingWallets}
        currentNetwork={currentNetwork}
        walletService={walletService}
        onRefreshWallet={onRefreshWallet}
        onDeleteWallet={onDeleteWallet}
        onExportWallet={onExportWallet}
        onWithdrawExpireUnfreeze={onWithdrawExpireUnfreeze}
        onRefreshAll={onRefreshAll}
      />
    </div>
  );
};
