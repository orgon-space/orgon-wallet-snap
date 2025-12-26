/**
 * Format number with comma as thousands separator and dot as decimal separator
 */
export function formatNumberCommaDot(value: number | string): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  // For very small numbers, show more decimals
  if (Math.abs(num) < 0.000001 && num !== 0) {
    return num.toFixed(8);
  }

  // For small numbers, show 6 decimals
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toFixed(6);
  }

  // For medium numbers, show 4 decimals
  if (Math.abs(num) < 1 && num !== 0) {
    return num.toFixed(4);
  }

  // For larger numbers, show 2 decimals
  if (Math.abs(num) < 1000) {
    return num.toFixed(2);
  }

  // For very large numbers, use comma separation
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
