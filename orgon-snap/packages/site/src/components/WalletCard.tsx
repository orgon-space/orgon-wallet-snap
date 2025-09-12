import React, { useState } from 'react';
import { 
  Wallet, 
  Copy, 
  MoreVertical, 
  Download, 
  Trash2, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
// import {
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger,
//   DropdownMenuSeparator 
// } from './ui/dropdown-menu';
// import { Badge } from './ui/badge';
import { formatAddress, formatBalance, copyToClipboard } from '../utils/shared';
import type { OrgonAccount, OrgonBalance } from '../types/snap';

interface WalletCardProps {
  wallet: OrgonAccount & { balance?: OrgonBalance };
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  isRefreshing?: boolean;
  currentNetwork?: any;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onRefresh,
  onDelete,
  onExport,
  isRefreshing = false,
  currentNetwork
}) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const displayAddress = (address: string) => {
    return address; // Always show full address
  };

  const getBalanceColor = (balance: string) => {
    const num = parseFloat(balance);
    if (num > 1000) return 'text-green-600';
    if (num > 100) return 'text-blue-600';
    if (num > 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance: string) => {
    const num = parseFloat(balance);
    if (num > 1000) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (num > 100) return <TrendingUp className="w-4 h-4 text-blue-600" />;
    return <TrendingDown className="w-4 h-4 text-gray-600" />;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-purple-500">
      <CardContent className="p-6">
        <div className="mb-4">
          {/* Header with wallet icon and name */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              {wallet.balance && parseFloat(wallet.balance.trx) > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {wallet.name || 'Unnamed Wallet'}
              </h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onRefresh?.()}
                disabled={isRefreshing}
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onExport?.(wallet.id)}
                title="Export Private Key"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => onDelete?.(wallet.id)}
                title="Delete Wallet"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Address section */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 font-mono break-all">
              {displayAddress(wallet.address)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-100 transition-opacity flex-shrink-0"
              onClick={() => copyToClipboard(wallet.address)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Balance
            </span>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
          
          {wallet.balance ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getBalanceIcon(wallet.balance.trx)}
                <span className={`text-2xl font-bold ${getBalanceColor(wallet.balance.trx)}`}>
                  {wallet.balance.trx}
                </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    TRX
                  </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefresh?.()}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Load Balance
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
