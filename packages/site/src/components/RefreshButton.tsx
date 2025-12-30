import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface RefreshButtonProps {
  onClick?: (() => void) | undefined;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  size = 'sm',
  children,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={disabled || loading || !onClick}
      className="border-dashed bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white hover:text-white border-transparent transition-all duration-200"
    >
      {loading ? (
        <>
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          {children || 'Refreshing...'}
        </>
      ) : (
        <>
          <RefreshCw className="w-5 h-5 mr-2" />
          {children || 'Refresh All'}
        </>
      )}
    </Button>
  );
};
