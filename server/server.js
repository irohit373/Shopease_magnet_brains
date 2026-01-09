require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { handleStripeWebhook } = require('./src/webhooks/stripeWebhook');

// Import routes
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const refundRoutes = require('./src/routes/refundRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Stripe webhook endpoint (must be before express.json middleware)
// Raw body is needed for webhook signature verification
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/refunds', refundRoutes);

// Legacy endpoint for compatibility
app.post('/api/create-checkout-session', async (req, res) => {
  const { createCheckoutSession } = require('./src/controllers/checkoutController');
  return createCheckoutSession(req, res);
});

app.get('/api/order/:sessionId', async (req, res) => {
  const { getOrderBySessionId } = require('./src/controllers/orderControllers');
  req.params.sessionId = req.params.sessionId;
  return getOrderBySessionId(req, res);
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;
