import React from 'react';
import { WalletOverviewContainer } from './WalletOverviewContainer';
import type { OrgonAccount, OrgonBalance } from '../types';
import type { WalletService } from '../hooks/wallet';

interface WalletOverviewProps {
  // Actions
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onStaking: () => void;
  onDelegation: () => void;
  onNetworkChange?: (network: any) => void;
  onRefreshWallet?: (id: string) => void;
  onDeleteWallet?: (id: string) => void;
  onExportWallet?: (id: string) => void;
  onWithdrawExpireUnfreeze?: (
    walletId: string,
    resourceType: 'BANDWIDTH' | 'ENERGY',
  ) => void;
  onRefreshAll?: () => void;

  // Data
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
  loading: boolean;
  refreshingWallets: Set<string>;
  currentNetwork?: any;
  walletService?: WalletService;
}

/**
 * WalletOverview - Main wallet overview component
 *
 * Uses Container/Presentational pattern:
 * - WalletOverviewContainer: Business logic and state management
 * - WalletOverviewView: Pure UI presentation
 */
export const WalletOverview: React.FC<WalletOverviewProps> = (props) => {
  return <WalletOverviewContainer {...props} />;
};
