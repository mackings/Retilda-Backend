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

        const purchasesData = user.purchases.map((purchase, index) => {
            if (!purchase.product) {
                console.error(`Purchase at index ${index} has a null product.`);
                return null;
            }

            const paymentsData = purchase.payments.map(payment => {
                const paymentDate = payment.status === 'completed' ? payment.paymentDate : 'Not paid';
                return {
                    paymentDate: paymentDate,
                    nextPaymentDate: payment.nextPaymentDate, 
                    amountPaid: payment.amountPaid,
                    amountToPay: payment.amountToPay,
                    status: payment.status
                };
            });

            return {
                _id: purchase._id, 
                product: {
                    _id: purchase.product._id,
                    name: purchase.product.name,
                    price: purchase.product.price,
                    description: purchase.product.description,
                    images: purchase.product.images[0]
                },
                paymentPlan: purchase.paymentPlan,
                payments: paymentsData
            };
        }).filter(purchase => purchase !== null); 

        res.status(200).json(successResponse('Purchases retrieved successfully', purchasesData));
    } catch (error) {
        console.error('Error retrieving user purchases:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
};




  
  

