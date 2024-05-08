const express = require("express");
const Product = require("../../models/Productmodel");
const User = require('../../models/Authmodel');
const axios = require('axios');
const { errorResponse, successResponse, generateUniqueReference } = require("../components");
const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');
const reference = generateUniqueReference('Retilda');



exports.buyProduct = async (req, res) => {
    try {
        const { productId, paymentPlan, numberOfInstallments } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json(errorResponse('Product not found', 404));
        }

        const amountToPay = product.price / numberOfInstallments;
        const payments = [];
        let currentDate = new Date();

        for (let i = 0; i < numberOfInstallments; i++) {
            const nextPaymentDate = paymentPlan === 'weekly' ?
                new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000 * (i + 1))) :
                new Date(currentDate.getFullYear(), currentDate.getMonth() + (i + 1), currentDate.getDate());

            const payment = {
                paymentDate: new Date(),
                nextPaymentDate: nextPaymentDate,
                amountPaid: i === 0 ? amountToPay : 0,
                amountToPay: amountToPay,
                status: i === 0 ? 'completed' : 'pending'
            };

            payments.push(payment);
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

        const payload = {
            amount: amountToPay,
            reference: generateUniqueReference('Debit'),
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





exports.installmentPayment = async (req, res) => {

    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(errorResponse('User not found', 404));
        }

        const purchase = user.purchases.find(purchase => {
            return purchase.payments.some(payment => payment.status === 'pending');
        });

        if (!purchase) {
            return res.status(404).json(errorResponse('All installments have been paid', 404));
        }

        const installment = purchase.payments.find(payment => payment.status === 'pending');

        const totalAmount = installment.amountToPay;
        const { accountNumber } = user.wallet;
        const { ADMIN_WALLET_ACCOUNT_NUMBER, ADMIN_WALLET_BANK_CODE } = process.env;

        if (totalAmount > user.wallet.balance) {
            return res.status(403).json(errorResponse('Insufficient funds in the wallet', 403));
        }
        
        console.log(totalAmount);

        const payload = {

            amount: totalAmount,
            reference: generateUniqueReference('Debit'),
            narration: 'Payment for installment',
            destinationBankCode: ADMIN_WALLET_BANK_CODE,
            destinationAccountNumber: ADMIN_WALLET_ACCOUNT_NUMBER,
            currency: 'NGN',
            sourceAccountNumber: accountNumber,
            destinationAccountName: 'udoma kingsley'

        };

        const response = await axios.post(process.env.WALLET_DEBIT, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        if (!response.data.requestSuccessful) {
            return res.status(422).json(errorResponse(response.data.responseMessage, 422));
        }

        // Update the paid installment's status and amountPaid
        installment.amountPaid += totalAmount;
        installment.status = 'completed';

        await user.save();

        res.status(200).json(successResponse('Payment successful', installment));
    } catch (error) {
        console.error('Error debiting wallet:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};






  
  






