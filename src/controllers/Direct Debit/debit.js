const express = require('express');
const axios = require('axios');
const app = express();
const {successResponse,errorResponse}= require("../components");

app.use(express.json());

//const PAYSTACK_SECRET_KEY = 'sk_test_30a2ef7e97d38d32055c0017dc400e80784132b7';
const PAYSTACK_SECRET_KEY = 'sk_live_ec7544326f2965fe19ea84843b910ad43f96139e';
// Route to initiate direct debit authorization request


exports.initiateAuthorization = async (req, res) => {
    const { email, account, address } = req.body;
  
    try {
      const response = await axios.post(
        'https://api.paystack.co/customer/authorization/initialize',
        {
          email,
          channel: 'direct_debit',
          callback_url: 'http://your-callback-url.com', // Replace with your callback URL
         // account,  // Optional, can include { number, bank_code }
         // address,  // Optional, can include { state, city, street }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.status(200).json(successResponse('Authorization initiated successfully', response.data));
    } catch (error) {
      console.error('Error initiating authorization:', error);
      res.status(400).json(errorResponse('Failed to initiate authorization', 400, error.message));
    }
  };
  
  // Verify Direct Debit Authorization
  exports.verifyAuthorization = async (req, res) => {
    const { reference } = req.params;
  
    try {
      const response = await axios.get(
        `https://api.paystack.co/customer/authorization/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );
  
      res.status(200).json(successResponse('Authorization verified successfully', response.data));
    } catch (error) {
      console.error('Error verifying authorization:', error);
      res.status(400).json(errorResponse('Failed to verify authorization', 400, error.message));
    }
  };
  
  // Charge the customer's account

  exports.chargeCustomer = async (req, res) => {
    const { authorization_code, email, amount } = req.body;
  
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/charge_authorization',
        {
          authorization_code,
          email,
          amount: amount * 100, // Amount in kobo (1 NGN = 100 kobo)
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.status(200).json(successResponse('Charge successful', response.data));
    } catch (error) {
      console.error('Error charging customer:', error);
      res.status(400).json(errorResponse('Failed to charge customer', 400, error.message));
    }
  };
  
  // Verify Charge
  exports.verifyCharge = async (req, res) => {
    const { reference } = req.params;
  
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );
  
      res.status(200).json(successResponse('Charge verified successfully', response.data));
    } catch (error) {
      console.error('Error verifying charge:', error);
      res.status(400).json(errorResponse('Failed to verify charge', 400, error.message));
    }
  };
  
  // Deactivate Direct Debit Authorization
  exports.deactivateAuthorization = async (req, res) => {
    const { authorization_code } = req.body;
  
    try {
      const response = await axios.post(
        'https://api.paystack.co/customer/authorization/deactivate',
        { authorization_code },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.status(200).json(successResponse('Authorization deactivated successfully', response.data));
    } catch (error) {
      console.error('Error deactivating authorization:', error);
      res.status(400).json(errorResponse('Failed to deactivate authorization', 400, error.message));
    }
  };