/**
 * General helper utilities
 * Local storage, formatting, validation, and UI helpers
 */

import type { Snap } from '../types';

// ============================================================================
// Local Storage Utilities
// ============================================================================

/**
 * Get a local storage key.
 *
 * @param key - The local storage key to access.
 * @returns The value stored at the key provided if the key exists.
 */
export const getLocalStorage = (key: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    const data = ls.getItem(key);
    return data;
  }

  throw new Error('Local storage is not available.');
};

/**
 * Set a value to local storage at a certain key.
 *
 * @param key - The local storage key to set.
 * @param value - The value to set.
 */
export const setLocalStorage = (key: string, value: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    ls.setItem(key, value);
    return;
  }

  throw new Error('Local storage is not available.');
};

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Get the user's preferred theme in local storage.
 * Will default to the browser's preferred theme if there is no value in local storage.
 *
 * @returns True if the theme is "dark" otherwise, false.
 */
export const getThemePreference = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const darkModeSystem = window?.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  const localStoragePreference = getLocalStorage('theme');
  const systemPreference = darkModeSystem ? 'dark' : 'light';
  const preference = localStoragePreference ?? systemPreference;

  if (!localStoragePreference) {
    setLocalStorage('theme', systemPreference);
  }

  return preference === 'dark';
};

// ============================================================================
// Snap Utilities
// ============================================================================

/**
 * Check if a snap ID is a local snap ID.
 *
 * @param snapId - The snap ID.
 * @returns True if it's a local Snap, or false otherwise.
 */
export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

/**
 * Check if reconnect button should be displayed
 *
 * @param installedSnap - The installed snap.
 * @returns True if reconnect button should be shown.
 */
export const shouldDisplayReconnectButton = (installedSnap: Snap | null) =>
  installedSnap && isLocalSnap(installedSnap?.id);

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format an address for display (shortened)
 */
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format balance for display with proper precision
 */
export const formatBalance = (balance: string): string => {
  // For blockchain applications, show full precision
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';

  // For very small numbers, use scientific notation to preserve precision
  if (num > 0 && num < 0.000001) {
    return num.toExponential(6);
  }

  // For normal numbers, show up to 18 decimal places (common for blockchain tokens)
  // but remove trailing zeros for cleaner display
  const formatted = num.toFixed(18);
  return formatted.replace(/\.?0+$/, '') || '0';
};

/**
 * Format private key for display (show/hide)
 */
export const formatPrivateKey = (key: string, show: boolean): string => {
  if (show) {
    return key;
  }
  return '•'.repeat(64);
};

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate an Orgon address
 * Orgon addresses start with 'o' and are 34 characters long
 */
export const validateOrgonAddress = (address: string): boolean => {
  return address.startsWith('o') && address.length === 34;
};

// ============================================================================
// Blockchain Utilities
// ============================================================================

/**
 * Calculate transaction fee
 */
export const calculateTransactionFee = (
  gasPrice: string,
  gasLimit: string,
): string => {
  const gasPriceNum = parseFloat(gasPrice);
  const gasLimitNum = parseFloat(gasLimit);
  return ((gasPriceNum * gasLimitNum) / 1000000).toFixed(6);
};

/**
 * Get balance color based on amount
 */
export const getBalanceColor = (balance: string): string => {
  const num = parseFloat(balance);
  if (num > 1000) return 'text-green-600';
  if (num > 100) return 'text-blue-600';
  if (num > 10) return 'text-yellow-600';
  return 'text-gray-600';
};

// ============================================================================
// Clipboard Utilities
// ============================================================================

/**
 * Copy text to clipboard with fallback for older browsers
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    throw err;
  }
};
