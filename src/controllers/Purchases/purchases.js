const express = require("express");
const Product = require("../../models/Productmodel");
const User = require('../../models/Authmodel');
const axios = require('axios');
const { errorResponse, successResponse, generateUniqueReference } = require("../components");
const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');

const bodyParser = require('body-parser');
const router = express.Router();

const app = express();
const BASE_URL = 'https://newwebservicetest.zenithbank.com:9443/directtransfer';
let token = '';
let tokenExpiration = new Date();


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


const getToken = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/api/authentication/getToken`, {
            userIdentifyer: 'user', 
            userProtector: 'dsh46+eTPeM63c'
        });

        if (response.data && response.data.tokenDetail) {
            token = response.data.tokenDetail.token;
            tokenExpiration = new Date(response.data.tokenDetail.expiration);
        } else {
            throw new Error('Unable to retrieve token');
        }
    } catch (error) {
        console.error('Error retrieving token:', error);
        throw new Error('Failed to get token');
    }
};



const ensureToken = async (req, res, next) => {
    try {
        if (!token || new Date() >= tokenExpiration) {
            await getToken();
        }
        next();
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to authenticate request', error:error });
    }
};


exports.processDirectTransfer = [
    ensureToken,
    async (req, res) => {
        try {
            const { amount, bankCode, bankName, crAccount, description, drAccount, transactionReference } = req.body;

            // Send the direct transfer request to the external API
            const transferResponse = await axios.post(
                `${BASE_URL}/api/transfer`,
                {
                    amount,
                    bankCode,
                    bankName,
                    crAccount,
                    description,
                    drAccount,
                    transactionReference,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Structure the response data to match a consistent format
            const transferData = {
                status: transferResponse.data.status,
                transactionId: transferResponse.data.transactionId,
                amount: transferResponse.data.amount,
                bankCode: transferResponse.data.bankCode,
                bankName: transferResponse.data.bankName,
                crAccount: transferResponse.data.crAccount,
                drAccount: transferResponse.data.drAccount,
                description: transferResponse.data.description,
                transactionReference: transferResponse.data.transactionReference,
            };

            // Send a successful response back to the client
            res.status(200).json({
                status: 'success',
                message: 'Direct transfer processed successfully',
                data: transferData
            });

        } catch (error) {
            // Handle any errors that occur during the process
            console.error('Error processing direct transfer:', error);

            // Send an error response back to the client
            res.status(500).json({
                status: 'error',
                message: 'Failed to process direct transfer',
                error: error.message
            });
        }
    }
];



 
  
  

