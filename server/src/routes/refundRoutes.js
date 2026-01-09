const express = require('express');
const router = express.Router();
const {
  createFullRefund,
  createPartialRefund,
  getRefundDetails,
  getOrderRefunds,
  refundByPaymentIntent,
} = require('../controllers/refundController');
const { validateRefundRequest } = require('../middleware/paymentValidation');

// Create full refund for an order
router.post('/full', createFullRefund);

// Create partial refund for an order
router.post('/partial', createPartialRefund);

// Refund by payment intent ID
router.post('/payment-intent', validateRefundRequest, refundByPaymentIntent);

// Get refund details by refund ID
router.get('/:refundId', getRefundDetails);

// Get all refunds for an order
router.get('/order/:orderId', getOrderRefunds);

module.exports = router;
