import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ActionButton } from './ActionButton';

interface QuickActionsProps {
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onStaking: () => void;
  onDelegation: () => void;
  hasWallets: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateWallet,
  onSendTransaction,
  onImportWallet,
  onStaking,
  onDelegation,
  hasWallets,
}) => {
  return (
    <Card className="orgon-card orgon-card-hover">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Manage your wallets and send transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ActionButton
            variant="create"
            onClick={onCreateWallet}
          />
          <ActionButton
            variant="import"
            onClick={onImportWallet}
          />
          <ActionButton
            variant="send"
            onClick={onSendTransaction}
            disabled={!hasWallets}
          />
          <ActionButton
            variant="stake"
            onClick={onStaking}
            disabled={!hasWallets}
          />
          <ActionButton
            variant="delegate"
            onClick={onDelegation}
            disabled={!hasWallets}
          />
        </div>
      </CardContent>
    </Card>
  );
};
