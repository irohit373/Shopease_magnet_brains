const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

const refundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: ['duplicate', 'fraudulent', 'requested_by_customer', 'other'],
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentIntentId: {
      type: String,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'partially_refunded', 'disputed'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
    // Stripe-related fields
    receiptUrl: {
      type: String,
    },
    invoiceId: {
      type: String,
    },
    invoicePdf: {
      type: String,
    },
    hostedInvoiceUrl: {
      type: String,
    },
    // Refund tracking
    refunds: [refundSchema],
    refundedAmount: {
      type: Number,
      default: 0,
    },
    // Dispute tracking
    disputeId: {
      type: String,
    },
    disputeReason: {
      type: String,
    },
    // Error tracking
    failureReason: {
      type: String,
    },
    // Shipping tracking
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    // Notes
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });

// Virtual for remaining refundable amount
orderSchema.virtual('refundableAmount').get(function () {
  return this.totalAmount - this.refundedAmount;
});

// Method to check if fully refundable
orderSchema.methods.isFullyRefundable = function () {
  return this.paymentStatus === 'paid' && this.refundedAmount === 0;
};

// Method to check if partially refundable
orderSchema.methods.isPartiallyRefundable = function () {
  return (
    (this.paymentStatus === 'paid' || this.paymentStatus === 'partially_refunded') &&
    this.refundedAmount < this.totalAmount
  );
};

module.exports = mongoose.model('Order', orderSchema);