import React from 'react';
import { AlertCircle, Check, ChevronDown, Globe, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useNetwork } from '../hooks/network-provider';

interface CompactNetworkSwitcherProps {
  className?: string;
  variant?: 'button' | 'select'; // button for dropdown, select for standard select
}

export const CompactNetworkSwitcher: React.FC<CompactNetworkSwitcherProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { networks, currentNetwork, loading, error, switching, switchNetwork } =
    useNetwork();

  const handleNetworkSwitch = async (chainId: string) => {
    if (chainId === currentNetwork?.chainId) return;

    try {
      await switchNetwork(chainId);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  const getNetworkIcon = (network: any) => {
    if (network.chainId.includes('mainnet')) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    } else if (
      network.chainId.includes('shasta') ||
      network.chainId.includes('nile')
    ) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
  };

  const getNetworkBadge = (network: any) => {
    if (network.chainId.includes('mainnet')) {
      return 'Mainnet';
    } else if (network.chainId.includes('shasta')) {
      return 'Shasta';
    } else if (network.chainId.includes('nile')) {
      return 'Nile';
    }
    return 'Custom';
  };

  const formatNetworkName = (name: string) => {
    return name.replace('Orgon ', '').replace(' (Alternative)', '');
  };

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${className}`}
        disabled
      >
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
        <span className="text-xs">Loading...</span>
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ${className}`}
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        <span className="text-xs">Error</span>
      </Button>
    );
  }

  if (variant === 'select') {
    return (
      <Select
        value={currentNetwork?.chainId || ''}
        onValueChange={handleNetworkSwitch}
        disabled={switching}
      >
        <SelectTrigger className={`h-8 w-auto min-w-[120px] ${className}`}>
          <SelectValue placeholder="Network">
            {currentNetwork && (
              <div className="flex items-center gap-1">
                {getNetworkIcon(currentNetwork)}
                <span className="text-xs font-medium">
                  {formatNetworkName(currentNetwork.name)}
                </span>
                {switching && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network.chainId} value={network.chainId}>
              <div className="flex items-center gap-2 w-full">
                {getNetworkIcon(network)}
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {formatNetworkName(network.name)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {getNetworkBadge(network)}
                  </span>
                </div>
                {currentNetwork?.chainId === network.chainId && (
                  <Check className="w-3 h-3 text-green-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Button variant with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className}`}
          disabled={switching}
        >
          <div className="flex items-center gap-1">
            {currentNetwork && getNetworkIcon(currentNetwork)}
            <Globe className="w-3 h-3" />
            <span className="text-xs font-medium">
              {currentNetwork
                ? formatNetworkName(currentNetwork.name)
                : 'Network'}
            </span>
            {switching && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.chainId}
            onClick={() => handleNetworkSwitch(network.chainId)}
            disabled={switching}
            className="flex items-center gap-2"
          >
            {getNetworkIcon(network)}
            <div className="flex-1">
              <div className="text-sm font-medium">
                {formatNetworkName(network.name)}
              </div>
              <div className="text-xs text-gray-500">
                {getNetworkBadge(network)} • {network.chainId}
              </div>
            </div>
            {currentNetwork?.chainId === network.chainId && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
