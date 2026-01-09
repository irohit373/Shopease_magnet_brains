const StripeService = require('../services/stripeService');
const Order = require('../models/Order');

/**
 * Refund Controller
 * Handles all refund-related operations
 */

// @desc    Create a full refund for an order
// @route   POST /api/refunds/full
// @access  Admin
const createFullRefund = async (req, res) => {
  try {
    const { orderId, reason = 'requested_by_customer' } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order has payment intent
    if (!order.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment intent found for this order',
      });
    }

    // Check if order is refundable
    if (!order.isFullyRefundable()) {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for a full refund',
        currentStatus: order.paymentStatus,
        refundedAmount: order.refundedAmount,
      });
    }

    // Create refund via Stripe
    const refund = await StripeService.createRefund(order.paymentIntentId, {
      reason: reason,
    });

    // Update order
    order.refunds.push({
      refundId: refund.id,
      amount: refund.amount,
      reason: reason,
      status: refund.status,
    });
    order.refundedAmount = order.totalAmount;
    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Full refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
    });
  } catch (error) {
    console.error('Full refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message,
    });
  }
};

// @desc    Create a partial refund for an order
// @route   POST /api/refunds/partial
// @access  Admin
const createPartialRefund = async (req, res) => {
  try {
    const { orderId, amount, reason = 'requested_by_customer' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required',
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order has payment intent
    if (!order.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment intent found for this order',
      });
    }

    // Check if order is refundable
    if (!order.isPartiallyRefundable()) {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for a refund',
        currentStatus: order.paymentStatus,
      });
    }

    // Check refund amount
    const refundableAmount = order.totalAmount - order.refundedAmount;
    if (amount > refundableAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount exceeds refundable amount. Maximum: $${refundableAmount.toFixed(2)}`,
        maxRefundable: refundableAmount,
      });
    }

    // Create refund via Stripe
    const refund = await StripeService.createRefund(order.paymentIntentId, {
      amount: amount,
      reason: reason,
    });

    // Update order
    const newRefundedTotal = order.refundedAmount + refund.amount;
    const isFullyRefunded = newRefundedTotal >= order.totalAmount;

    order.refunds.push({
      refundId: refund.id,
      amount: refund.amount,
      reason: reason,
      status: refund.status,
    });
    order.refundedAmount = newRefundedTotal;
    order.paymentStatus = isFullyRefunded ? 'refunded' : 'partially_refunded';
    order.status = isFullyRefunded ? 'refunded' : 'partially_refunded';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Partial refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        order: {
          id: order._id,
          totalAmount: order.totalAmount,
          refundedAmount: order.refundedAmount,
          remainingAmount: order.totalAmount - order.refundedAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
    });
  } catch (error) {
    console.error('Partial refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message,
    });
  }
};

// @desc    Get refund details
// @route   GET /api/refunds/:refundId
// @access  Admin
const getRefundDetails = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refund = await StripeService.getRefund(refundId);

    res.status(200).json({
      success: true,
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving refund details',
      error: error.message,
    });
  }
};

// @desc    Get all refunds for an order
// @route   GET /api/refunds/order/:orderId
// @access  Admin
const getOrderRefunds = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If order has payment intent, get latest refund data from Stripe
    let stripeRefunds = [];
    if (order.paymentIntentId) {
      stripeRefunds = await StripeService.listRefunds(order.paymentIntentId);
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        refundedAmount: order.refundedAmount,
        refundableAmount: order.totalAmount - order.refundedAmount,
        refunds: order.refunds,
        stripeRefunds: stripeRefunds,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving order refunds',
      error: error.message,
    });
  }
};

// @desc    Refund by payment intent (for webhook/internal use)
// @route   POST /api/refunds/payment-intent
// @access  Internal/Admin
const refundByPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required',
      });
    }

    // Find the order
    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this payment intent',
      });
    }

    // Create refund
    const refundOptions = { reason };
    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await StripeService.createRefund(paymentIntentId, refundOptions);

    // Update order
    const refundAmount = refund.amount;
    const newRefundedTotal = order.refundedAmount + refundAmount;
    const isFullyRefunded = newRefundedTotal >= order.totalAmount;

    order.refunds.push({
      refundId: refund.id,
      amount: refundAmount,
      reason: reason,
      status: refund.status,
    });
    order.refundedAmount = newRefundedTotal;
    order.paymentStatus = isFullyRefunded ? 'refunded' : 'partially_refunded';
    order.status = isFullyRefunded ? 'refunded' : 'partially_refunded';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
        orderId: order._id,
      },
    });
  } catch (error) {
    console.error('Refund by payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message,
    });
  }
};

module.exports = {
  createFullRefund,
  createPartialRefund,
  getRefundDetails,
  getOrderRefunds,
  refundByPaymentIntent,
};
