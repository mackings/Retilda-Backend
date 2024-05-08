const express = require("express");
const Product = require("../../models/Productmodel");
const User = require('../../models/Authmodel');
const axios = require('axios');
const { errorResponse, successResponse, generateUniqueReference } = require("../components");
const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');



exports.getPurchases = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate({
            path: 'purchases.product',
            select: 'name price description images'
        });

        if (!user) {
            return res.status(404).json(errorResponse('User not found', 404));
        }

        const purchasesData = user.purchases.map(purchase => {
            const paymentsData = purchase.payments.map(payment => {
                return {
                    nextPaymentDate: payment.nextPaymentDate, 
                    amountPaid: payment.amountPaid,
                    amountToPay: payment.amountToPay,
                    status: payment.status
                };
            });

            return {
                product: {
                    _id: purchase.product._id,
                    name: purchase.product.name,
                    price: purchase.product.price,
                    description: purchase.product.description,
                    images: purchase.product.images
                },
                paymentPlan: purchase.paymentPlan,
                payments: paymentsData
            };
        });

        res.status(200).json(successResponse('Purchases retrieved successfully', purchasesData));
    } catch (error) {
        console.error('Error retrieving user purchases:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
};

  
  

