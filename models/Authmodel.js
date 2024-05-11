const mongoose = require('mongoose');

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


const purchaseSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },


  deliveryStatus:{
    type:String,
    enum: ['pending', 'processing', 'completed'],
    required: true,
    default: 'pending'
  },

  paymentPlan: {
    type: String,
    enum: [ 'once','weekly', 'monthly'],
    required: true
  },
  
  payments: [paymentSchema] 
});


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
    },
    accountNumber: { 
      type: String
    }
  },
  purchases: [purchaseSchema] 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
