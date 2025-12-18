import React from 'react';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CompactNetworkSwitcher } from './CompactNetworkSwitcher';

interface DesktopHeaderProps {
  onReconnect?: () => void;
  showReconnect?: boolean;
  error?: Error | null;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onReconnect,
  showReconnect = false,
  error
}) => {
  return (
    <div className="hidden lg:block">
      {/* Desktop Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Orgon Snap
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Wallet Management
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Network Switcher */}
              <CompactNetworkSwitcher variant="select" />

              {/* Reconnect Button */}
              {showReconnect && onReconnect && (
                <Button
                  onClick={onReconnect}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnect Snap
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle size={16} />
            <AlertDescription>
              <strong>An error happened:</strong> {error.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
