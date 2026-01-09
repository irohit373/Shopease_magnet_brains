const express = require('express');
const router = express.Router();
const {
  getOrderBySessionId,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderControllers');

// Public routes
router.get('/session/:sessionId', getOrderBySessionId);

// Admin routes (add authentication middleware later)
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);

module.exports = router;