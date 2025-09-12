import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Check, 
  ChevronDown, 
  Loader2, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { useNetworkManager } from '../hooks';

interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

interface NetworkSwitcherProps {
  onNetworkChange?: (network: Network) => void;
  className?: string;
  currentNetwork?: Network | null;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  onNetworkChange,
  className = '',
  currentNetwork: parentCurrentNetwork
}) => {
  const networkManager = useNetworkManager();

  const handleNetworkSwitch = async (chainId: string) => {
    if (chainId === networkManager.currentNetwork?.chainId) return;
    
    try {
      const result = await networkManager.switchNetwork(chainId);
      
      if (onNetworkChange && result) {
        onNetworkChange(result);
      }
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  const getNetworkIcon = (network: Network) => {
    if (network.chainId.includes('mainnet')) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    } else if (network.chainId.includes('shasta') || network.chainId.includes('nile')) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
  };

  const getNetworkBadge = (network: Network) => {
    if (network.chainId.includes('mainnet')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Mainnet</span>;
    } else if (network.chainId.includes('shasta')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Shasta</span>;
    } else if (network.chainId.includes('nile')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Nile</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Custom</span>;
  };

  const formatNetworkName = (name: string) => {
    return name.replace('Orgon ', '').replace(' (Alternative)', '');
  };

  if (networkManager.loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Loading networks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Network</span>
            {networkManager.switching && <Loader2 className="w-3 h-3 animate-spin" />}
          </div>

          {networkManager.error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400">{networkManager.error}</span>
            </div>
          )}

          <Select
            value={networkManager.currentNetwork?.chainId || ''}
            onValueChange={handleNetworkSwitch}
            disabled={networkManager.switching}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select network">
                {networkManager.currentNetwork && (
                  <div className="flex items-center gap-2">
                    {getNetworkIcon(networkManager.currentNetwork)}
                    <span className="text-sm">{formatNetworkName(networkManager.currentNetwork.name)}</span>
                    {getNetworkBadge(networkManager.currentNetwork)}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {networkManager.networks.map((network) => (
                <SelectItem key={network.chainId} value={network.chainId}>
                  <div className="flex items-center gap-3 w-full">
                    {getNetworkIcon(network)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatNetworkName(network.name)}
                        </span>
                        {getNetworkBadge(network)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {network.chainId}
                      </div>
                    </div>
                    {networkManager.currentNetwork?.chainId === network.chainId && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {networkManager.currentNetwork && (
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span>RPC: {networkManager.currentNetwork.rpcUrl}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Explorer: {networkManager.currentNetwork.explorerUrl}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
