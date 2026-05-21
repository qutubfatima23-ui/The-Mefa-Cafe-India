const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

// @route POST /api/payments/create-order
// @desc Create Razorpay order
// @access Private
router.post('/create-order', verifyToken, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId, amount } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        orderId: orderId,
        userId: req.userId
      }
    });

    // Save payment record
    const payment = new Payment({
      orderId: orderId,
      userId: req.userId,
      amount,
      currency: 'INR',
      paymentGateway: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending'
    });
    await payment.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// @route POST /api/payments/verify
// @desc Verify Razorpay payment
// @access Private
router.post('/verify', verifyToken, [
  body('razorpayOrderId').notEmpty(),
  body('razorpayPaymentId').notEmpty(),
  body('razorpaySignature').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(body.toString())
      .digest('hex');

    const isValidSignature = expectedSignature === razorpaySignature;

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { 
        $set: { 
          razorpayPaymentId,
          razorpaySignature,
          status: 'completed',
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update order payment status
    await Order.findByIdAndUpdate(
      payment.orderId,
      { 
        $set: { 
          paymentStatus: 'completed',
          paymentId: razorpayPaymentId,
          orderstatus: 'confirmed',
          updatedAt: Date.now()
        }
      }
    );

    res.json({
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// @route POST /api/payments/refund
// @desc Request refund for order
// @access Private
router.post('/refund', verifyToken, [
  body('orderId').notEmpty(),
  body('reason').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: order.total * 100
    });

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { _id: order.paymentId },
      {
        $set: {
          status: 'refunded',
          refundId: refund.id,
          refundAmount: order.total,
          refundReason: reason,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    // Update order status
    await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderstatus: 'cancelled', paymentStatus: 'refunded' } }
    );

    res.json({
      message: 'Refund initiated successfully',
      refund: {
        refundId: refund.id,
        amount: order.total,
        status: 'refunded'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// @route GET /api/payments/:orderId
// @desc Get payment details for order
// @access Private
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify user owns this order
    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
