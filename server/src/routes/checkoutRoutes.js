const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getCheckoutSession,
  createPaymentIntent,
  cancelPaymentIntent,
  getPaymentDetails,
  verifyPayment,
} = require('../controllers/checkoutController');
const {
  validateCheckoutRequest,
  validateSessionId,
  checkoutRateLimiter,
  sanitizeCheckoutItems,
} = require('../middleware/paymentValidation');

// Create checkout session (with validation and rate limiting)
router.post(
  '/create-session',
  checkoutRateLimiter,
  sanitizeCheckoutItems,
  validateCheckoutRequest,
  createCheckoutSession
);

// Get checkout session details
router.get('/session/:sessionId', validateSessionId, getCheckoutSession);

// Verify payment status
router.get('/verify/:sessionId', validateSessionId, verifyPayment);

// Create payment intent (for custom payment flow)
router.post('/create-payment-intent', checkoutRateLimiter, createPaymentIntent);

// Cancel payment intent
router.post('/cancel-payment-intent', cancelPaymentIntent);

// Get payment details
router.get('/payment/:paymentIntentId', getPaymentDetails);

module.exports = router;