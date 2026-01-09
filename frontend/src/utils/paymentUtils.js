import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe once and cache the instance
let stripePromise = null;

/**
 * Get the Stripe instance (lazy loaded)
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) {
      console.error('Stripe public key is not configured');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Redirect to Stripe Checkout using the checkout URL
 * @param {string} url - Checkout session URL from Stripe
 */
export const redirectToCheckout = (url) => {
  if (!url) {
    throw new Error('Checkout URL is required');
  }
  // Direct redirect to Stripe-hosted checkout page
  window.location.href = url;
};

/**
 * Format price for display
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code
 */
export const formatPrice = (amount, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

/**
 * Format price from cents
 * @param {number} cents - Amount in cents
 * @param {string} currency - Currency code
 */
export const formatPriceFromCents = (cents, currency = 'usd') => {
  return formatPrice(cents / 100, currency);
};

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 */
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Get card brand from card number
 * @param {string} cardNumber - Card number
 */
export const getCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
  };
  
  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return brand;
    }
  }
  
  return 'unknown';
};

/**
 * Format card number with spaces
 * @param {string} cardNumber - Raw card number
 */
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const brand = getCardBrand(cleaned);
  
  // Amex has different formatting (4-6-5)
  if (brand === 'amex') {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
  }
  
  // Standard formatting (4-4-4-4)
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Validate expiry date
 * @param {string} expiry - Expiry in MM/YY format
 */
export const validateExpiry = (expiry) => {
  const [month, year] = expiry.split('/').map((s) => parseInt(s, 10));
  
  if (!month || !year || month < 1 || month > 12) {
    return false;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * Validate CVC
 * @param {string} cvc - CVC code
 * @param {string} cardBrand - Card brand
 */
export const validateCVC = (cvc, cardBrand = 'unknown') => {
  const length = cardBrand === 'amex' ? 4 : 3;
  return new RegExp(`^\\d{${length}}$`).test(cvc);
};

/**
 * Payment status labels and colors
 */
export const paymentStatusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
  processing: { label: 'Processing', color: '#3b82f6', bgColor: '#dbeafe' },
  paid: { label: 'Paid', color: '#10b981', bgColor: '#d1fae5' },
  failed: { label: 'Failed', color: '#ef4444', bgColor: '#fee2e2' },
  refunded: { label: 'Refunded', color: '#8b5cf6', bgColor: '#ede9fe' },
  partially_refunded: { label: 'Partially Refunded', color: '#6366f1', bgColor: '#e0e7ff' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bgColor: '#f3f4f6' },
  expired: { label: 'Expired', color: '#9ca3af', bgColor: '#f9fafb' },
};

/**
 * Order status labels and colors
 */
export const orderStatusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
  processing: { label: 'Processing', color: '#3b82f6', bgColor: '#dbeafe' },
  shipped: { label: 'Shipped', color: '#8b5cf6', bgColor: '#ede9fe' },
  delivered: { label: 'Delivered', color: '#10b981', bgColor: '#d1fae5' },
  completed: { label: 'Completed', color: '#059669', bgColor: '#a7f3d0' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' },
  refunded: { label: 'Refunded', color: '#6366f1', bgColor: '#e0e7ff' },
  disputed: { label: 'Disputed', color: '#dc2626', bgColor: '#fecaca' },
};

/**
 * Test card numbers for development
 */
export const testCards = {
  success: {
    visa: '4242424242424242',
    mastercard: '5555555555554444',
    amex: '378282246310005',
  },
  decline: {
    generic: '4000000000000002',
    insufficientFunds: '4000000000009995',
    lostCard: '4000000000009987',
  },
  threeDSecure: {
    required: '4000002500003155',
    alwaysSucceeds: '4000008260003178',
  },
};

export default {
  getStripe,
  redirectToCheckout,
  formatPrice,
  formatPriceFromCents,
  validateCardNumber,
  getCardBrand,
  formatCardNumber,
  validateExpiry,
  validateCVC,
  paymentStatusConfig,
  orderStatusConfig,
  testCards,
};
