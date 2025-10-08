import type { FunctionComponent } from 'react';

import { Dashboard } from './components/Dashboard';

export const App: FunctionComponent = () => {
  return (
    <div className="flex flex-col w-full min-h-screen max-w-screen">
      <Dashboard />
    </div>
  );
};
