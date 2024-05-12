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
  specification: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  images: {
    type: [String], 
    default: []
  },
  totalBuyers: {
    type: Number,
    default: 0
  },
  categories: {
    type: [String],
    default: []
  },
  availableStock: {
    type: Number,
    default: 0
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
