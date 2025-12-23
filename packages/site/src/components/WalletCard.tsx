import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Copy,
  Download,
  HelpCircle,
  RefreshCw,
  Trash2,
  Wallet,
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
import { copyToClipboard, formatAddress } from '../utils/helpers';
import {
  type BandwidthEnergyInfo,
  getEnhancedTokenBalances,
  type TokenBalance,
  useTokenBalances,
  type WalletService,
} from '../hooks/wallet';
import type { OrgonAccount } from '../types';

interface WalletCardProps {
  wallet: OrgonAccount;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  onWithdrawExpireUnfreeze?: (
    walletId: string,
    resourceType: 'BANDWIDTH' | 'ENERGY',
  ) => void;
  isRefreshing?: boolean;
  currentNetwork?: any;
  walletService?: WalletService;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onRefresh,
  onDelete,
  onExport,
  onWithdrawExpireUnfreeze,
  isRefreshing = false,
  currentNetwork,
  walletService,
}) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const displayAddress = (address: string) => {
    return address; // Always show full address
  };

  // Load token balances with enhanced metadata
  useEffect(() => {
    const loadTokens = async () => {
      if (!wallet?.balance) {
        setTokens([]);
        return;
      }

      setTokensLoading(true);
      try {
        const tokenBalances = await getEnhancedTokenBalances(
          wallet,
          currentNetwork?.rpcUrl,
          walletService,
        );
        setTokens(tokenBalances);
      } catch (error) {
        console.error('Failed to load enhanced token balances:', error);
        // Fallback to basic token parsing using the hook
        const basicTokens = useTokenBalances(wallet);
        setTokens(basicTokens);
      } finally {
        setTokensLoading(false);
      }
    };

    loadTokens();
  }, [wallet, currentNetwork?.rpcUrl, walletService]);

  // Get bandwidth and energy info
  const bandwidthEnergy: BandwidthEnergyInfo | null =
    (wallet.balance as any)?.bandwidthEnergy || null;

  // Helper function to format timestamp to date and time
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to check if unfreeze time has expired
  const isExpired = (expireTime: number) => {
    return Date.now() > expireTime;
  };

  // Helper functions for tooltip
  const showTooltipFor = (id: string) => setShowTooltip(id);
  const hideTooltip = () => setShowTooltip(null);
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
                <RefreshCw
                  className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
                />
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

        {/* Bandwidth & Energy Section */}
        {bandwidthEnergy && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                Bandwidth & Energy
              </span>
            </div>

            <div className="space-y-3">
              {/* Bandwidth */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Пропускная способность (Bandwidth)
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {bandwidthEnergy.bandwidth.available}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div>
                    Заморожено: {bandwidthEnergy.bandwidth.frozen} Bandwidth
                  </div>
                  {bandwidthEnergy.bandwidth.unfrozen.length > 0 && (
                    <div>
                      На разморозке:{' '}
                      {bandwidthEnergy.bandwidth.unfrozen.map((item, idx) => (
                        <div
                          key={idx}
                          className="ml-2 flex items-center justify-between"
                        >
                          <span>
                            {item.amount} Bandwidth (до{' '}
                            {formatDate(item.expireTime)})
                          </span>
                          {onWithdrawExpireUnfreeze && (
                            <div className="relative flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                disabled={!isExpired(item.expireTime)}
                                onClick={() =>
                                  onWithdrawExpireUnfreeze(
                                    wallet.id,
                                    'BANDWIDTH',
                                  )
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Забрать
                              </Button>
                              <HelpCircle
                                className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
                                onMouseEnter={() =>
                                  showTooltipFor(`bandwidth-${idx}`)
                                }
                                onMouseLeave={hideTooltip}
                              />
                              {showTooltip === `bandwidth-${idx}` && (
                                <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                  По истечении этого времени можно забрать
                                  размороженные ресурсы обратно на баланс
                                  аккаунта.
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Energy */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Энергия (Energy)
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {bandwidthEnergy.energy.frozen}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  {bandwidthEnergy.energy.unfrozen.length > 0 ? (
                    <div>
                      На разморозке:{' '}
                      {bandwidthEnergy.energy.unfrozen.map((item, idx) => (
                        <div
                          key={idx}
                          className="ml-2 flex items-center justify-between"
                        >
                          <span>
                            {item.amount} Energy (до{' '}
                            {formatDate(item.expireTime)})
                          </span>
                          {onWithdrawExpireUnfreeze && (
                            <div className="relative flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                disabled={!isExpired(item.expireTime)}
                                onClick={() =>
                                  onWithdrawExpireUnfreeze(wallet.id, 'ENERGY')
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Забрать
                              </Button>
                              <HelpCircle
                                className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
                                onMouseEnter={() =>
                                  showTooltipFor(`energy-${idx}`)
                                }
                                onMouseLeave={hideTooltip}
                              />
                              {showTooltip === `energy-${idx}` && (
                                <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                  {' '}
                                  По истечении этого времени можно забрать
                                  размороженные ресурсы обратно на баланс
                                  аккаунта.
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>Нет энергии на разморозке</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Tokens
            </span>
            {(isRefreshing || tokensLoading) && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>

          {wallet.balance && tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((token, index) => {
                const balance = (token.value / 10 ** token.decimals).toFixed(
                  token.decimals,
                );
                const displaySymbol =
                  token.name && token.name !== token.symbol
                    ? `${token.name} (${token.symbol})`
                    : token.type === 'orc20'
                      ? formatAddress(token.symbol)
                      : token.symbol;

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
                          <span
                            className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate"
                            title={token.name || token.symbol}
                          >
                            {displaySymbol}
                          </span>
                          {token.type === 'orc20' && token.address && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                              onClick={() => copyToClipboard(token.address!)}
                              title="Copy token address"
                            >
                              <Copy className="w-3 h-3 text-gray-500" />
                            </Button>
                          )}
                        </div>
                        {token.totalSupply && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Total Supply: {token.totalSupply.toLocaleString()}
                          </div>
                        )}
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
