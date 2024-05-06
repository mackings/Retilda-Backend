const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['standard', 'premium', 'admin'],
    default: 'standard'
  },
  creditScore: {
    type: Number,
    default: 0
  },
  wallet: {
    walletReference: {
      type: String
    },
    walletName: {
      type: String
    },
    customerName: {
      type: String
    },
    bvnDetails: {
      bvn: {
        type: String
      },
      bvnDateOfBirth: {
        type: Date
      }
    },
    customerEmail: {
      type: String
    }
  },
  purchases: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    paymentPlan: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true
    },
    payments: [{
      paymentDate: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }]
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
