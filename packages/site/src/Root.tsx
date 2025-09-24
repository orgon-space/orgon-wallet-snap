import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import { MetaMaskProvider } from './hooks';
import { getThemePreference, setLocalStorage } from './utils';
import './styles/globals.css';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(getThemePreference());

  const toggleTheme: ToggleTheme = () => {
    setLocalStorage('theme', darkTheme ? 'light' : 'dark');
    setDarkTheme(!darkTheme);
  };

  // Apply theme class to document
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  return (
    <ToggleThemeContext.Provider value={toggleTheme}>
      <MetaMaskProvider>{children}</MetaMaskProvider>
    </ToggleThemeContext.Provider>
  );
};
