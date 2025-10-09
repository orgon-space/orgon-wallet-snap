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
import { formatAddress, formatBalance, copyToClipboard } from '../utils/helpers';
import { useTokenBalances } from '../hooks/wallet';
import type { OrgonAccount, OrgonBalance } from '../types';

interface WalletCardProps {
  wallet: OrgonAccount;
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
  
  // Use the reusable hook to get token balances
  const tokens = useTokenBalances(wallet);
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="mb-4">
          {/* Header with wallet icon and name */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              {wallet.balance && (wallet.balance.balance ?? 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                {wallet.name || 'Unnamed Wallet'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30"
                onClick={() => onRefresh?.()}
                disabled={isRefreshing}
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30"
                onClick={() => onExport?.(wallet.id)}
                title="Export Private Key"
              >
                <Download className="w-4 h-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => onDelete?.(wallet.id)}
                title="Delete Wallet"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
          
          {/* Address section */}
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all flex-1">
              {displayAddress(wallet.address)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 flex-shrink-0"
              onClick={() => copyToClipboard(wallet.address)}
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Tokens Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Tokens
            </span>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
          
          {wallet.balance && tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((token, index) => {
                const balance = (token.value / (10 ** token.decimals)).toFixed(token.decimals);
                const displaySymbol = token.type === 'orc20' ? formatAddress(token.symbol) : token.symbol;
                
                return (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-lg text-gray-900 dark:text-white block">
                          {balance}
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate" title={token.symbol}>
                            {displaySymbol}
                          </span>
                          {token.type === 'orc20' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                              onClick={() => copyToClipboard(token.symbol)}
                              title="Copy token address"
                            >
                              <Copy className="w-3 h-3 text-gray-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md ml-3">
                        {token.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
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
