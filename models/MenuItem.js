const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['shawarma', 'wraps', 'burgers', 'sandwiches', 'fries', 'nuggets', 'juices', 'mocktails']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Menu+Item'
  },
  tag: String,
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  prepTime: {
    type: Number,
    default: 15,
    description: 'Preparation time in minutes'
  },
  allergies: [String],
  ingredients: [String],
  calories: Number,
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
