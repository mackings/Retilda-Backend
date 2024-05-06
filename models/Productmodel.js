const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paymentPlan: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  images: {
    type: [String], // Array of image URLs
    default: []
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
