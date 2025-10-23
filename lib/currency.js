// Currency helper functions for multi-currency support

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  LKR: { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  NEP: { code: 'NEP', symbol: '₨', name: 'Nepalese Rupee' }
};

export const DEFAULT_CURRENCY = 'INR';

/**
 * Get currency symbol by currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return CURRENCIES[DEFAULT_CURRENCY].symbol;
  return CURRENCIES[currencyCode]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}

/**
 * Get currency name by currency code
 * @param {string} currencyCode - Currency code
 * @returns {string} Currency name
 */
export function getCurrencyName(currencyCode) {
  if (!currencyCode) return CURRENCIES[DEFAULT_CURRENCY].name;
  return CURRENCIES[currencyCode]?.name || CURRENCIES[DEFAULT_CURRENCY].name;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted amount with currency symbol
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, decimals = 2) {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = Number(amount).toFixed(decimals);
  
  // For currencies like INR, USD, EUR - symbol before amount
  if (['INR', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'SAR', 'PKR', 'BDT', 'LKR', 'NEP'].includes(currencyCode)) {
    return `${symbol}${formattedAmount}`;
  }
  
  // For currencies like JPY, CHF - symbol after amount
  return `${formattedAmount} ${symbol}`;
}

/**
 * Get all available currencies as array
 * @returns {Array} Array of currency objects
 */
export function getAllCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Validate currency code
 * @param {string} currencyCode - Currency code to validate
 * @returns {boolean} True if valid currency code
 */
export function isValidCurrency(currencyCode) {
  return currencyCode && CURRENCIES.hasOwnProperty(currencyCode);
}



