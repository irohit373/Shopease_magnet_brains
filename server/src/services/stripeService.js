const stripe = require('../config/stripe');
const Order = require('../models/Order');

/**
 * Stripe Service - Business logic for Stripe operations
 */
class StripeService {
  /**
   * Create a checkout session with advanced options
   */
  static async createCheckoutSession(items, options = {}) {
    const {
      customerEmail,
      customerId,
      allowPromotionCodes = true,
      collectShipping = true,
      metadata = {},
    } = options;

    // Validate items
    if (!items || items.length === 0) {
      throw new Error('No items provided for checkout');
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || `Product: ${item.name}`,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.productId || item._id,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Calculate subtotal for shipping threshold
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Build session configuration
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      allow_promotion_codes: allowPromotionCodes,
      metadata: {
        ...metadata,
        items: JSON.stringify(
          items.map((item) => ({
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }))
        ),
        subtotal: subtotal.toFixed(2),
      },
      // Automatically calculate tax based on customer location
      automatic_tax: { enabled: false },
      // Invoice creation for record keeping
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'ShopEase Order',
          footer: 'Thank you for shopping with ShopEase!',
        },
      },
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Add existing customer if provided
    if (customerId) {
      sessionConfig.customer = customerId;
      delete sessionConfig.customer_email; // Can't use both
    }

    // Add shipping address collection
    if (collectShipping) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'JP'],
      };

      // Add shipping options
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: subtotal >= 100 ? 0 : 999, // Free shipping over $100
              currency: 'usd',
            },
            display_name: subtotal >= 100 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1999, // $19.99 express shipping
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ];
    }

    // Create the session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      sessionId: session.id,
      url: session.url,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  /**
   * Retrieve checkout session with full details
   */
  static async getCheckoutSession(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'customer', 'invoice'],
    });

    return {
      id: session.id,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.customer_details?.name,
      paymentStatus: session.payment_status,
      totalAmount: session.amount_total / 100,
      subtotal: session.amount_subtotal / 100,
      currency: session.currency,
      lineItems: session.line_items?.data,
      shippingCost: session.total_details?.amount_shipping / 100,
      tax: session.total_details?.amount_tax / 100,
      discount: session.total_details?.amount_discount / 100,
      shippingAddress: session.shipping_details?.address,
      invoiceId: session.invoice,
    };
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(paymentIntentId, options = {}) {
    const { amount, reason = 'requested_by_customer' } = options;

    const refundConfig = {
      payment_intent: paymentIntentId,
      reason: reason, // 'duplicate', 'fraudulent', 'requested_by_customer'
    };

    // Partial refund if amount specified
    if (amount) {
      refundConfig.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundConfig);

    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.reason,
      createdAt: new Date(refund.created * 1000),
    };
  }

  /**
   * Get refund details
   */
  static async getRefund(refundId) {
    const refund = await stripe.refunds.retrieve(refundId);

    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.reason,
      paymentIntentId: refund.payment_intent,
      createdAt: new Date(refund.created * 1000),
    };
  }

  /**
   * List all refunds for a payment intent
   */
  static async listRefunds(paymentIntentId) {
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
    });

    return refunds.data.map((refund) => ({
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.reason,
      createdAt: new Date(refund.created * 1000),
    }));
  }

  /**
   * Create or retrieve a Stripe customer
   */
  static async createOrRetrieveCustomer(email, name = null) {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        source: 'shopease',
      },
    });

    return customer;
  }

  /**
   * Get payment intent details
   */
  static async getPaymentIntent(paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges'],
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: paymentIntent.status,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types,
      chargeId: paymentIntent.latest_charge,
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
      createdAt: new Date(paymentIntent.created * 1000),
    };
  }

  /**
   * Create a payment intent for custom payment flow
   */
  static async createPaymentIntent(amount, options = {}) {
    const { currency = 'usd', customerId, metadata = {} } = options;

    const paymentIntentConfig = {
      amount: Math.round(amount * 100),
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
    };

    if (customerId) {
      paymentIntentConfig.customer = customerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Cancel a payment intent
   */
  static async cancelPaymentIntent(paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  /**
   * Retrieve balance from Stripe account
   */
  static async getBalance() {
    const balance = await stripe.balance.retrieve();

    return {
      available: balance.available.map((b) => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
      pending: balance.pending.map((b) => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
    };
  }

  /**
   * Create a coupon/promotion code
   */
  static async createCoupon(options) {
    const {
      percentOff,
      amountOff,
      currency = 'usd',
      duration = 'once',
      name,
      maxRedemptions,
    } = options;

    const couponConfig = {
      duration: duration,
      name: name,
    };

    if (percentOff) {
      couponConfig.percent_off = percentOff;
    } else if (amountOff) {
      couponConfig.amount_off = Math.round(amountOff * 100);
      couponConfig.currency = currency;
    }

    if (maxRedemptions) {
      couponConfig.max_redemptions = maxRedemptions;
    }

    const coupon = await stripe.coupons.create(couponConfig);

    return {
      id: coupon.id,
      name: coupon.name,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
      duration: coupon.duration,
      valid: coupon.valid,
    };
  }
}

module.exports = StripeService;
