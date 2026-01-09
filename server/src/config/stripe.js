const Stripe = require('stripe');

// Initialize Stripe with configuration options
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use a specific API version for consistency
  maxNetworkRetries: 3, // Automatically retry failed requests
  timeout: 30000, // 30 second timeout
  telemetry: false, // Disable telemetry in development
});

// Stripe configuration constants
const STRIPE_CONFIG = {
  // Supported payment methods
  paymentMethods: ['card'],
  
  // Supported currencies
  currencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
  defaultCurrency: 'usd',
  
  // Minimum charge amounts (in cents) per currency
  minimumCharge: {
    usd: 50, // $0.50
    eur: 50, // €0.50
    gbp: 30, // £0.30
    cad: 50, // $0.50 CAD
    aud: 50, // $0.50 AUD
  },
  
  // Shipping countries
  shippingCountries: ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'JP', 'NL', 'ES', 'IT'],
  
  // Webhook events to handle
  webhookEvents: [
    'checkout.session.completed',
    'checkout.session.expired',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
    'payment_intent.processing',
    'charge.succeeded',
    'charge.failed',
    'charge.refunded',
    'charge.dispute.created',
    'invoice.paid',
    'invoice.payment_failed',
  ],
  
  // Refund reasons
  refundReasons: ['duplicate', 'fraudulent', 'requested_by_customer'],
  
  // Session expiration (30 minutes default)
  sessionExpiration: 30 * 60,
};

// Helper function to convert amount to cents
const toCents = (amount) => Math.round(amount * 100);

// Helper function to convert cents to dollars
const toDollars = (cents) => cents / 100;

// Helper function to validate amount
const isValidAmount = (amount, currency = 'usd') => {
  const cents = toCents(amount);
  const minimum = STRIPE_CONFIG.minimumCharge[currency] || 50;
  return cents >= minimum;
};

// Export stripe instance and helpers
module.exports = stripe;
module.exports.config = STRIPE_CONFIG;
module.exports.toCents = toCents;
module.exports.toDollars = toDollars;
module.exports.isValidAmount = isValidAmount;