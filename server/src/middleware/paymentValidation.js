/**
 * Payment Validation Middleware
 * Validates payment-related requests before processing
 */

// Validate checkout request
const validateCheckoutRequest = (req, res, next) => {
  const { items } = req.body;

  // Check if items exist
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required',
    });
  }

  // Check if items array is not empty
  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty. Add items before checkout.',
    });
  }

  // Validate each item
  const errors = [];
  items.forEach((item, index) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Item ${index + 1}: Name is required and must be a string`);
    }

    if (typeof item.price !== 'number' || item.price <= 0) {
      errors.push(`Item ${index + 1}: Price must be a positive number`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }

    // Validate max price (Stripe limit is $999,999.99)
    if (item.price > 999999.99) {
      errors.push(`Item ${index + 1}: Price exceeds maximum allowed amount`);
    }

    // Validate max quantity
    if (item.quantity > 100) {
      errors.push(`Item ${index + 1}: Quantity exceeds maximum allowed (100)`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  // Calculate and attach total to request
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Stripe minimum is $0.50 USD
  if (total < 0.5) {
    return res.status(400).json({
      success: false,
      message: 'Order total must be at least $0.50 USD',
    });
  }

  req.orderTotal = total;
  next();
};

// Validate refund request
const validateRefundRequest = (req, res, next) => {
  const { paymentIntentId, amount, reason } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: 'Payment Intent ID is required',
    });
  }

  // Validate payment intent ID format
  if (!paymentIntentId.startsWith('pi_')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Payment Intent ID format',
    });
  }

  // If amount provided, validate it
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount must be a positive number',
      });
    }
  }

  // Validate reason if provided
  const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
  if (reason && !validReasons.includes(reason)) {
    return res.status(400).json({
      success: false,
      message: `Invalid refund reason. Must be one of: ${validReasons.join(', ')}`,
    });
  }

  next();
};

// Validate session ID parameter
const validateSessionId = (req, res, next) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required',
    });
  }

  // Validate session ID format (starts with 'cs_')
  if (!sessionId.startsWith('cs_')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Session ID format',
    });
  }

  next();
};

// Validate webhook signature (used before raw body parsing)
const validateWebhookSignature = (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({
      success: false,
      message: 'Missing Stripe signature header',
    });
  }

  next();
};

// Rate limiting for checkout (simple implementation)
const checkoutRateLimiter = (() => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 10; // 10 requests per minute per IP

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old entries
    for (const [key, data] of requests.entries()) {
      if (now - data.firstRequest > WINDOW_MS) {
        requests.delete(key);
      }
    }

    // Check current IP
    const ipData = requests.get(ip);
    if (!ipData) {
      requests.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    if (now - ipData.firstRequest > WINDOW_MS) {
      // Reset window
      requests.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    if (ipData.count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many checkout requests. Please try again later.',
        retryAfter: Math.ceil((WINDOW_MS - (now - ipData.firstRequest)) / 1000),
      });
    }

    ipData.count++;
    next();
  };
})();

// Sanitize checkout items (remove any unwanted fields)
const sanitizeCheckoutItems = (req, res, next) => {
  if (req.body.items) {
    req.body.items = req.body.items.map((item) => ({
      productId: item.productId || item._id,
      name: String(item.name).slice(0, 100), // Limit name length
      description: item.description ? String(item.description).slice(0, 500) : '',
      price: Number(item.price),
      quantity: Math.floor(Number(item.quantity)),
      image: item.image ? String(item.image).slice(0, 2000) : '',
    }));
  }
  next();
};

module.exports = {
  validateCheckoutRequest,
  validateRefundRequest,
  validateSessionId,
  validateWebhookSignature,
  checkoutRateLimiter,
  sanitizeCheckoutItems,
};
