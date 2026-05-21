const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('./auth');

// @route GET /api/menu
// @desc Get all menu items or filter by category
// @access Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isAvailable: true };
    if (category) {
      query.category = category;
    }

    const items = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json({
      count: items.length,
      items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/menu/:id
// @desc Get single menu item
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/menu/category/:category
// @desc Get items by category
// @access Public
router.get('/category/:category', async (req, res) => {
  try {
    const items = await MenuItem.find({ 
      category: req.params.category,
      isAvailable: true 
    }).sort({ rating: -1 });
    
    res.json({
      category: req.params.category,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/menu (Admin only)
// @desc Add new menu item
// @access Private/Admin
router.post('/', verifyToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['shawarma', 'wraps', 'burgers', 'sandwiches', 'fries', 'nuggets', 'juices', 'mocktails']),
  body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json({
      message: 'Menu item added successfully',
      item: menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route PUT /api/menu/:id (Admin only)
// @desc Update menu item
// @access Private/Admin
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Menu item updated successfully',
      item: menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route DELETE /api/menu/:id (Admin only)
// @desc Delete menu item
// @access Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndRemove(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
