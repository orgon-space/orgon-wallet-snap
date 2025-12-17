import type { FunctionComponent, ReactNode } from 'react';

import { Dashboard } from './components/Dashboard';

export type AppProps = {
  children?: ReactNode;
};

export const App: FunctionComponent<AppProps> = ({ children }) => {
  return (
    <div className="flex flex-col w-full min-h-screen max-w-screen">
      <Dashboard />
      {children}
    </div>
  );
};
