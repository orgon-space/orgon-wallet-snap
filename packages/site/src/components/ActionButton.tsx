import React from 'react';
import { Plus, ExternalLink, Send } from 'lucide-react';
import { Button } from './ui/button';

export type ActionButtonVariant = 'create' | 'import' | 'send';

interface ActionButtonProps {
  variant: ActionButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const ACTION_CONFIG = {
  create: {
    icon: Plus,
    label: 'Create Wallet',
    gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  },
  import: {
    icon: ExternalLink,
    label: 'Import Wallet',
    gradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
  },
  send: {
    icon: Send,
    label: 'Send ORGON',
    gradient: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
  },
} as const;

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  onClick,
  disabled = false,
  children,
}) => {
  const config = ACTION_CONFIG[variant];
  const Icon = config.icon;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 h-24 flex flex-col items-center justify-center space-y-2
        bg-gradient-to-r ${config.gradient} text-white hover:text-white
        transition-all duration-200
        ${variant !== 'create' ? 'border-dashed border-transparent variant="outline"' : ''}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{children || config.label}</span>
    </Button>
  );
};
