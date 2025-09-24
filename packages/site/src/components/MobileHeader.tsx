import React, { useState, useEffect } from 'react';
import { Menu, X, Wallet, Settings, RefreshCw, Eye, Plus, Send, Cog } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface MobileHeaderProps {
  onRefresh?: () => void;
  onSettings?: () => void;
  walletCount?: number;
  totalBalance?: string;
  // Tab integration props
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
  // Reconnect functionality
  showReconnect?: boolean;
  onReconnect?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onRefresh,
  onSettings,
  walletCount = 0,
  totalBalance = '0',
  activeTab = 'overview',
  onTabChange,
  showTabs = true,
  showReconnect = false,
  onReconnect
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20); // Start moving tabs after 20px scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(6);
  };

  return (
    <div className="lg:hidden">
      {/* Main Header Bar - Hides on scroll */}
      <div className={`sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-out ${isScrolled ? '-translate-y-full' : 'translate-y-0'} rounded-b-2xl`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Orgon Snap
              </h1>
              <p className="text-xs text-gray-500">
                {walletCount} wallet{walletCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-8 w-8 p-0"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Tabs - Floating Island */}
      {showTabs && onTabChange && (
        <div className={`fixed left-4 right-4 z-40 transition-all duration-200 ease-out ${isScrolled ? 'top-3' : 'top-[88px]'}`}>
           <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1 backdrop-blur-sm">
             <Tabs value={activeTab} onValueChange={onTabChange}>
               <div className="overflow-x-auto scrollbar-hide tab-scroll-container px-1">
                 <TabsList className="inline-flex h-10 w-max bg-transparent p-0 min-w-full gap-1">
                   <TabsTrigger value="overview" className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     <Eye className="w-3.5 h-3.5" />
                     <span>Overview</span>
                   </TabsTrigger>
                   <TabsTrigger value="create" className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     <Plus className="w-3.5 h-3.5" />
                     <span>Create</span>
                   </TabsTrigger>
                   <TabsTrigger value="send" className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     <Send className="w-3.5 h-3.5" />
                     <span>Send</span>
                   </TabsTrigger>
                   <TabsTrigger value="settings" className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     <Cog className="w-3.5 h-3.5" />
                     <span>Settings</span>
                   </TabsTrigger>
                   <TabsTrigger value="history" className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     <RefreshCw className="w-3.5 h-3.5" />
                     <span>History</span>
                   </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50" 
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Orgon Snap
                </h1>
                <p className="text-xs text-gray-500">
                  {walletCount} wallet{walletCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-2">
              {/* Tab Navigation in Menu */}
              {showTabs && onTabChange && (
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Navigation</p>
                  <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange('overview');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'create' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange('create');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create & Import
                  </Button>
                  <Button
                    variant={activeTab === 'send' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange('send');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Transaction
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange('settings');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Cog className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant={activeTab === 'history' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange('history');
                      setIsMenuOpen(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </div>
              )}
              
              {/* Actions */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</p>
                {showReconnect && onReconnect && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      onReconnect();
                      setIsMenuOpen(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconnect Snap
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onSettings?.();
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onRefresh?.();
                    setIsMenuOpen(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh All
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
