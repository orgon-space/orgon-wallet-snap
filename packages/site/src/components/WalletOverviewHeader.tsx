import React from 'react';

export const WalletOverviewHeader: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Wallet Overview
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Manage your Orgon wallets across different networks
      </p>
    </div>
  );
};
