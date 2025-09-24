/**
 * Shared utility functions used across components
 */

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

export const validateOrgonAddress = (address: string): boolean => {
  return address.startsWith('T') && address.length === 34;
};

export const calculateTransactionFee = (gasPrice: string, gasLimit: string): string => {
  const gasPriceNum = parseFloat(gasPrice);
  const gasLimitNum = parseFloat(gasLimit);
  return (gasPriceNum * gasLimitNum / 1000000).toFixed(6);
};

export const getBalanceColor = (balance: string): string => {
  const num = parseFloat(balance);
  if (num > 1000) return 'text-green-600';
  if (num > 100) return 'text-blue-600';
  if (num > 10) return 'text-yellow-600';
  return 'text-gray-600';
};

export const formatPrivateKey = (key: string, show: boolean): string => {
  if (show) {
    return key;
  }
  return '•'.repeat(64);
};
