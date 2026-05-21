const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { verifyToken } = require('./auth');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route GET /api/admin/dashboard
// @desc Get admin dashboard statistics
// @access Private/Admin
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email phone');

    const bestSellingItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      bestSellingItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/admin/orders
// @desc Get all orders (Admin)
// @access Private/Admin
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) query.orderstatus = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route PUT /api/admin/orders/:orderId
// @desc Update order (Admin)
// @access Private/Admin
router.put('/orders/:orderId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { orderstatus } = req.body;

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

// @route GET /api/admin/users
// @desc Get all users (Admin)
// @access Private/Admin
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/admin/analytics
// @desc Get detailed analytics
// @access Private/Admin
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    const dailyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const paymentMethodStats = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const categoryPopularity = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      dailyRevenue,
      paymentMethodStats,
      categoryPopularity
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
