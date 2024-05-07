const express = require("express");
const Product = require("../../models/Productmodel");
const User = require('../../models/Authmodel');
const axios = require('axios');
const { errorResponse, successResponse, generateUniqueReference } = require("../components");
const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');
const reference = generateUniqueReference('Retilda');
const uuid = require('uuid');


exports.buyProduct = async (req, res) => {

    try {
      const { productId, paymentPlan, numberOfInstallments } = req.body;
  
      // Generate a unique identifier for the transaction
      const idempotencyKey = uuid.v1();
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json(errorResponse('Product not found', 404));
      }
  
      const amountToPay = product.price / numberOfInstallments;
      const payments = [];
      let currentDate = new Date();
  
      for (let i = 0; i < numberOfInstallments; i++) {
        const nextPaymentDate = paymentPlan === 'weekly' ?
          new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)) :
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  
        const payment = {
          paymentDate: nextPaymentDate,
          amount: amountToPay,
          status: 'pending'
        };
  
        payments.push(payment);
        currentDate = nextPaymentDate;
      }
  
      const user = await User.findById(req.body.userid);
      if (!user || !user.wallet) {
        return res.status(404).json(errorResponse('User wallet not found', 404));
      }
      const sourceAccountNumber = user.wallet.accountNumber;
  
      const adminWallet = {
        accountNumber: process.env.ADMIN_WALLET_ACCOUNT_NUMBER,
        bankCode: process.env.ADMIN_WALLET_BANK_CODE
      };
  
      //Improve reference handling with unique elements
     // const reference = `${idempotencyKey}-${user.id}-${productId}`;
     // const reference = `${idempotencyKey.substring(0, 20)}-${user.wallet.walletReference.slice(-8)}-${productId.substring(0, 10)}`;
  
      const payload = {
        amount: amountToPay,
        reference: "veek",
        narration: "Auto debit",
        destinationBankCode: adminWallet.bankCode,
        destinationAccountNumber: adminWallet.accountNumber,
        currency: 'NGN',
        sourceAccountNumber: sourceAccountNumber,
        destinationAccountName: 'udoma kingsley'
      };
  
      const url = process.env.WALLET_DEBIT;
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        }
      });
  
      if (!response.data.requestSuccessful) {
        console.error('Error debiting wallet for payment:', response.data.responseMessage);
        return res.status(422).json(errorResponse(response.data.responseMessage, 422));
      }
  
      const purchase = {
        product: productId,
        paymentPlan: paymentPlan,
        payments: payments
      };
  
      const updatedUser = await User.findByIdAndUpdate(req.body.userid, { $push: { purchases: purchase } }, { new: true });
      if (!updatedUser) {
        return res.status(404).json(errorResponse('User not found', 404));
      }
  
      res.status(200).json(successResponse('Purchase successful', purchase));
    } catch (error) {
      console.error('Error buying product:', error);
      if (error.response && error.response.status === 422) {
        return res.status(422).json(errorResponse('Bad Request', 422));
      }
      res.status(500).json(errorResponse('Internal server error'));
    }
  };
  





