const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');

// @route POST /api/orders
// @desc Create new order
// @access Private
router.post('/', verifyToken, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('paymentMethod').isIn(['razorpay', 'stripe', 'cod']).withMessage('Valid payment method is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, deliveryAddress, paymentMethod, orderNotes } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = process.env.DELIVERY_CHARGE || 50;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryCharge + tax;

    const order = new Order({
      userId: req.userId,
      items,
      deliveryAddress,
      subtotal,
      deliveryCharge,
      tax,
      total,
      paymentMethod,
      orderNotes,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// @route GET /api/orders
// @desc Get user's orders
// @access Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/orders/:orderId
// @desc Get single order
// @access Private
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route PUT /api/orders/:orderId
// @desc Update order status (Admin only)
// @access Private/Admin
router.put('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderstatus } = req.body;

    if (!['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].includes(orderstatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { orderstatus, updatedAt: Date.now() } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route POST /api/orders/:orderId/review
// @desc Add review to order
// @access Private
router.post('/:orderId/review', verifyToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rating, review } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { rating, review } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Review added successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
