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

        let totalAmountPaid = 0; // Initialize total amount paid
        let totalAmountToPay = 0; // Initialize total amount to pay

        const purchasesData = user.purchases.map((purchase, index) => {
            if (!purchase.product) {
                console.error(`Purchase at index ${index} has a null product.`);
                return null;
            }

            // Calculate total amount paid for this purchase
            const totalPaidForPurchase = purchase.payments.reduce((acc, payment) => acc + payment.amountPaid, 0);
            totalAmountPaid += totalPaidForPurchase; // Add to total amount paid

            // Calculate total amount to pay for this purchase
            const totalToPayForPurchase = purchase.payments.reduce((acc, payment) => acc + payment.amountToPay, 0);
            totalAmountToPay += totalToPayForPurchase; // Add to total amount to pay

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
                deliveryStatus: purchase.deliveryStatus,
                totalAmountToPay: totalToPayForPurchase, // Add total amount to pay for this purchase
                totalPaidForPurchase: totalPaidForPurchase, // Add total paid for this purchase
                payments: paymentsData
            };
        }).filter(purchase => purchase !== null); 

        res.status(200).json(successResponse('Purchases retrieved successfully', {
            purchasesData: purchasesData,
            totalAmountPaid: totalAmountPaid, // Add total amount paid to response
            totalAmountToPay: totalAmountToPay // Add total amount to pay to response
        }));
    } catch (error) {
        console.error('Error retrieving user purchases:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }
};







exports.updateDeliveryStatus = async (req, res) => {

    try {
        const { userId, purchaseId, deliveryStatus } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse('User not found', 404));
        }
        const purchase = user.purchases.find(purchase => purchase._id.toString() === purchaseId);
        if (!purchase) {
            return res.status(404).json(errorResponse('Purchase not found', 404));
        }
        const allPaymentsCompleted = purchase.payments.every(payment => payment.status === 'completed');
        if (!allPaymentsCompleted) {
            return res.status(400).json(errorResponse('Cannot update delivery due to pending payments for this item', 400));
        }

        purchase.deliveryStatus = deliveryStatus;
        await user.save();

        res.status(200).json(successResponse('Delivery status updated successfully', purchase));

    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json(errorResponse('Internal server error', 500));
    }

};






  
  

