const mongoose = require('mongoose');

// Payment Schema for user's payments
const paymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  amountToPay: {
    type: Number,
    required: true
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
});

// Purchase schema for user's purchases
const purchaseSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    required: true,
    default: 'pending'
  },
  paymentPlan: {
    type: String,
    enum: ['once', 'weekly', 'monthly'],
    required: true
  },
  payments: [paymentSchema]
});

// Wallet schema for user's wallet
const walletSchema = new mongoose.Schema({
  walletReference: {
    type: String
  },
  walletName: {
    type: String
  },
  customerName: {
    type: String
  },
  customerEmail: {
    type: String
  },
  feeBearer: {
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
  accountNumber: {
    type: String
  },
  accountName: {
    type: String
  },
  bankCode: {
    type: Number // Bank ID returned by Paystack
  },
  bankName: {
    type: String // Bank name returned by Paystack
  },
  topUpAccountDetails: {
    accountNumber: {
      type: String
    },
    accountName: {
      type: String
    },
    bankCode: {
      type: String
    },
    bankName: {
      type: String
    }
  }
});

// Main user schema
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: false // Not required here since Paystack does not provide it as a single field
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  customerCode: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false // Set to false because Paystack might not always return a phone number
  },
  password: {
    type: String,
    required: false // Not required since this is Paystack's customer data
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
  wallet: walletSchema, // Embedding the wallet schema
  purchases: [purchaseSchema] // Embedding the purchase schema
});

// Set fullname virtual field based on first and last name
userSchema.virtual('first_name').get(function() {
  return this.fullname ? this.fullname.split(' ')[0] : '';
});

userSchema.virtual('last_name').get(function() {
  return this.fullname ? this.fullname.split(' ')[1] : '';
});

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
