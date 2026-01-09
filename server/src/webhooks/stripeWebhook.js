const stripe = require('../config/stripe');
const Order = require('../models/Order');

// Handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[WEBHOOK] Received event: ${event.type}`);

  // Handle the event
  try {
    switch (event.type) {
      // Checkout Events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleAsyncPaymentSucceeded(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object);
        break;

      // Payment Intent Events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object);
        break;

      // Charge Events
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      // Invoice Events (for subscription/invoice payments)
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK ERROR] Error processing ${event.type}:`, error);
    // Don't return error - acknowledge receipt to Stripe
  }

  res.status(200).json({ received: true });
};

// ============ Checkout Session Handlers ============

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log('[WEBHOOK] Checkout session completed:', session.id);

    // Parse items from metadata
    const items = JSON.parse(session.metadata?.items || '[]');

    // Get shipping address if available
    const shippingAddress = session.shipping_details?.address || {};
    const shippingCost = session.total_details?.amount_shipping || 0;

    // Check if order already exists (idempotency)
    const existingOrder = await Order.findOne({ sessionId: session.id });
    if (existingOrder) {
      console.log('[WEBHOOK] Order already exists for session:', session.id);
      return;
    }

    // Create order in database
    const order = await Order.create({
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.customer_details?.name,
      customerPhone: session.customer_details?.phone,
      items: items,
      totalAmount: session.amount_total / 100,
      subtotal: session.amount_subtotal / 100,
      shippingCost: shippingCost / 100,
      tax: (session.total_details?.amount_tax || 0) / 100,
      discount: (session.total_details?.amount_discount || 0) / 100,
      currency: session.currency,
      status: 'processing',
      paymentStatus: session.payment_status === 'paid' ? 'paid' : 'pending',
      shippingAddress: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country,
      },
      invoiceId: session.invoice,
    });

    console.log('[WEBHOOK] Order created:', order._id);

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling checkout session completed:', error);
    throw error;
  }
};

// Handle expired checkout session
const handleCheckoutSessionExpired = async (session) => {
  try {
    console.log('[WEBHOOK] Checkout session expired:', session.id);

    // Create order record for expired session if it doesn't exist
    const existingOrder = await Order.findOne({ sessionId: session.id });
    if (!existingOrder) {
      // Parse items from metadata
      const items = JSON.parse(session.metadata?.items || '[]');
      
      await Order.create({
        sessionId: session.id,
        customerEmail: session.customer_email || session.customer_details?.email || 'unknown',
        items: items,
        totalAmount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'cancelled',
        paymentStatus: 'expired',
      });
      console.log('[WEBHOOK] Created expired order record for session:', session.id);
    } else {
      // Update existing order
      await Order.findOneAndUpdate(
        { sessionId: session.id },
        { status: 'cancelled', paymentStatus: 'expired' }
      );
    }

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling checkout session expired:', error);
  }
};

// Handle async payment succeeded (for delayed payment methods)
const handleAsyncPaymentSucceeded = async (session) => {
  try {
    console.log('[WEBHOOK] Async payment succeeded:', session.id);

    await Order.findOneAndUpdate(
      { sessionId: session.id },
      { paymentStatus: 'paid', status: 'processing' }
    );
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling async payment succeeded:', error);
  }
};

// Handle async payment failed
const handleAsyncPaymentFailed = async (session) => {
  try {
    console.log('[WEBHOOK] Async payment failed:', session.id);

    // Check if order exists, if not create one for tracking
    const existingOrder = await Order.findOne({ sessionId: session.id });
    if (!existingOrder) {
      const items = JSON.parse(session.metadata?.items || '[]');
      
      await Order.create({
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        customerEmail: session.customer_email || session.customer_details?.email || 'unknown',
        items: items,
        totalAmount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'cancelled',
        paymentStatus: 'failed',
      });
      console.log('[WEBHOOK] Created failed order record for session:', session.id);
    } else {
      await Order.findOneAndUpdate(
        { sessionId: session.id },
        { paymentStatus: 'failed', status: 'cancelled' }
      );
    }

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling async payment failed:', error);
  }
};

// ============ Payment Intent Handlers ============

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    console.log('[WEBHOOK] Payment intent succeeded:', paymentIntent.id);

    const order = await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { 
        paymentStatus: 'paid',
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url 
      },
      { new: true }
    );

    if (order) {
      console.log('[WEBHOOK] Order payment confirmed:', order._id);
    }
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling payment intent succeeded:', error);
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    console.log('[WEBHOOK] Payment intent failed:', paymentIntent.id);
    console.log('[WEBHOOK] Failure reason:', paymentIntent.last_payment_error?.message);

    // Check if order exists
    let order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    
    if (order) {
      // Update existing order
      order = await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { 
          paymentStatus: 'failed', 
          status: 'cancelled',
          failureReason: paymentIntent.last_payment_error?.message
        },
        { new: true }
      );
      console.log('[WEBHOOK] Order marked as failed:', order._id);
    } else {
      // Create a new order record for tracking failed payments
      const metadata = paymentIntent.metadata || {};
      const items = metadata.items ? JSON.parse(metadata.items) : [];
      
      order = await Order.create({
        sessionId: `pi_${paymentIntent.id}`,
        paymentIntentId: paymentIntent.id,
        customerEmail: metadata.customerEmail || paymentIntent.receipt_email || 'unknown',
        items: items,
        totalAmount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'cancelled',
        paymentStatus: 'failed',
        failureReason: paymentIntent.last_payment_error?.message,
      });
      console.log('[WEBHOOK] Created failed order record:', order._id);
    }

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling payment intent failed:', error);
  }
};

// Handle canceled payment intent
const handlePaymentIntentCanceled = async (paymentIntent) => {
  try {
    console.log('[WEBHOOK] Payment intent canceled:', paymentIntent.id);

    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'cancelled', status: 'cancelled' }
    );
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling payment intent canceled:', error);
  }
};

// Handle processing payment intent
const handlePaymentIntentProcessing = async (paymentIntent) => {
  try {
    console.log('[WEBHOOK] Payment intent processing:', paymentIntent.id);

    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'processing' }
    );
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling payment intent processing:', error);
  }
};

// ============ Charge Handlers ============

// Handle successful charge
const handleChargeSucceeded = async (charge) => {
  try {
    console.log('[WEBHOOK] Charge succeeded:', charge.id);

    // Update order with receipt URL
    if (charge.payment_intent) {
      await Order.findOneAndUpdate(
        { paymentIntentId: charge.payment_intent },
        { receiptUrl: charge.receipt_url }
      );
    }
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling charge succeeded:', error);
  }
};

// Handle failed charge
const handleChargeFailed = async (charge) => {
  try {
    console.log('[WEBHOOK] Charge failed:', charge.id);
    console.log('[WEBHOOK] Failure message:', charge.failure_message);

    if (charge.payment_intent) {
      await Order.findOneAndUpdate(
        { paymentIntentId: charge.payment_intent },
        { 
          paymentStatus: 'failed',
          failureReason: charge.failure_message
        }
      );
    }
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling charge failed:', error);
  }
};

// Handle refunded charge
const handleChargeRefunded = async (charge) => {
  try {
    console.log('[WEBHOOK] Charge refunded:', charge.id);

    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = charge.refunded;

    if (charge.payment_intent) {
      await Order.findOneAndUpdate(
        { paymentIntentId: charge.payment_intent },
        { 
          paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
          status: isFullRefund ? 'refunded' : 'partially_refunded',
          refundedAmount: refundAmount
        }
      );
    }

    console.log(`[WEBHOOK] Refund processed: $${refundAmount} (Full refund: ${isFullRefund})`);

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling charge refunded:', error);
  }
};

// Handle dispute created
const handleDisputeCreated = async (dispute) => {
  try {
    console.log('[WEBHOOK] Dispute created:', dispute.id);
    console.log('[WEBHOOK] Dispute reason:', dispute.reason);

    // Find and mark the order as disputed
    if (dispute.payment_intent) {
      await Order.findOneAndUpdate(
        { paymentIntentId: dispute.payment_intent },
        { 
          status: 'disputed',
          disputeId: dispute.id,
          disputeReason: dispute.reason
        }
      );
    }

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling dispute created:', error);
  }
};

// ============ Invoice Handlers ============

// Handle paid invoice
const handleInvoicePaid = async (invoice) => {
  try {
    console.log('[WEBHOOK] Invoice paid:', invoice.id);

    await Order.findOneAndUpdate(
      { invoiceId: invoice.id },
      { 
        paymentStatus: 'paid',
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url
      }
    );
  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling invoice paid:', error);
  }
};

// Handle failed invoice payment
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    console.log('[WEBHOOK] Invoice payment failed:', invoice.id);

    await Order.findOneAndUpdate(
      { invoiceId: invoice.id },
      { paymentStatus: 'failed' }
    );

  } catch (error) {
    console.error('[WEBHOOK ERROR] Error handling invoice payment failed:', error);
  }
};

module.exports = { handleStripeWebhook };
