const stripe = require('../config/stripe');
const StripeService = require('../services/stripeService');
const Order = require('../models/Order');

// @desc    Create Stripe checkout session
// @route   POST /api/checkout/create-session
// @access  Public
const createCheckoutSession = async (req, res) => {
  try {
    const { items, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for checkout',
      });
    }

    // Use the StripeService for advanced checkout
    const session = await StripeService.createCheckoutSession(items, {
      customerEmail,
      allowPromotionCodes: true,
      collectShipping: true,
    });

    res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message,
    });
  }
};

// @desc    Get checkout session details
// @route   GET /api/checkout/session/:sessionId
// @access  Public
const getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionData = await StripeService.getCheckoutSession(sessionId);

    res.status(200).json({
      success: true,
      data: sessionData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving checkout session',
      error: error.message,
    });
  }
};

// @desc    Create payment intent (for custom payment flow)
// @route   POST /api/checkout/create-payment-intent
// @access  Public
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, customerEmail, metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    // Create or get customer
    let customerId = null;
    if (customerEmail) {
      const customer = await StripeService.createOrRetrieveCustomer(customerEmail);
      customerId = customer.id;
    }

    const paymentIntent = await StripeService.createPaymentIntent(amount, {
      customerId,
      metadata,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message,
    });
  }
};

// @desc    Cancel a payment intent
// @route   POST /api/checkout/cancel-payment-intent
// @access  Public
const cancelPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required',
      });
    }

    const result = await StripeService.cancelPaymentIntent(paymentIntentId);

    res.status(200).json({
      success: true,
      message: 'Payment intent cancelled',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling payment intent',
      error: error.message,
    });
  }
};

// @desc    Get payment details
// @route   GET /api/checkout/payment/:paymentIntentId
// @access  Public
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentDetails = await StripeService.getPaymentIntent(paymentIntentId);

    res.status(200).json({
      success: true,
      data: paymentDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment details',
      error: error.message,
    });
  }
};

// @desc    Verify payment status
// @route   GET /api/checkout/verify/:sessionId
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if order exists in database
    const order = await Order.findOne({ sessionId: sessionId });

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: session.payment_status,
        status: session.status,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_email || session.customer_details?.email,
        orderCreated: !!order,
        orderId: order?._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  createPaymentIntent,
  cancelPaymentIntent,
  getPaymentDetails,
  verifyPayment,
};
