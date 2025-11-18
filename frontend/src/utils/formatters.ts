/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (
  value: number | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined) return '0.0%';

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with thousands separators
 */
export const formatNumber = (
  value: number | null | undefined,
  decimals: number = 0
): string => {
  if (value === null || value === undefined) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a large number with K/M/B suffix
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`;
  }

  return `${sign}${absValue.toFixed(0)}`;
};

/**
 * Format a trend value with sign and color class
 */
export const formatTrend = (value: number | null | undefined): {
  text: string;
  color: 'success' | 'error' | 'default';
  sign: '+' | '-' | '';
} => {
  if (value === null || value === undefined || value === 0) {
    return { text: '0.0%', color: 'default', sign: '' };
  }

  const sign = value > 0 ? '+' : '-';
  const color = value > 0 ? 'success' : 'error';
  const text = `${Math.abs(value).toFixed(1)}%`;

  return { text, color, sign };
};

/**
 * Format a date as a readable string
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format a date and time as a readable string
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
