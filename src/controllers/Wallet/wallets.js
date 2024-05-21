const express = require("express");
const axios = require('axios');
const dotenv = require("dotenv").config();
const {errorResponse, successResponse, generateUniqueReference} = require("../components");
const User = require("../../models/Authmodel");

const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');





exports.createwallet = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.customerEmail });

        if (!existingUser) {
            return res.status(400).json(errorResponse('User email not registered on Retilda', 400));
        }

        const payload = {
            
            walletReference: generateUniqueReference('New_Wallet'),
            walletName: req.body.walletName,
            customerName: req.body.customerName,
            bvnDetails: {
                bvn: req.body.bvn,
                bvnDateOfBirth: req.body.bvnDateOfBirth
            },
            customerEmail: req.body.customerEmail
        };

        const response = await axios.post(process.env.CREATE_WALLET, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        if (response.status !== 200) {
            return res.status(response.status).json(errorResponse('Error creating wallet', response.status));
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: req.body.customerEmail }, 
            { 
                $set: {
                    'wallet': response.data.responseBody, 
                    'accountType': 'premium' 
                }
            }, 
            { new: true }
        );

        const responseData = {
            ...updatedUser.toObject(),
            wallet: response.data.responseBody
        };

        res.status(response.status).json(successResponse('Wallet created successfully', responseData));

    } catch (error) {
        const errorMessage = error.response.data.responseMessage || 'Error creating wallet';
        console.error('Error creating wallet:', errorMessage);
        console.log(error);
        res.status(error.response.status || 500).json(errorResponse(errorMessage));
    }
};




exports.getWalletBalance = async (req, res) => {

    try {
        const url = `${process.env.WALLET_BALANCE}${req.body.walletAccountNumber}`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });
   
        res.status(response.status).json(successResponse('Wallet balance retrieved successfully', response.data));
    } catch (error) {
        console.error('Error retrieving wallet balance:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};



exports.getWalletTransactions = async (req, res) => {

    try {

        const walletAccountNumber = req.params.walletAccountNumber;
        const url = `${process.env.WALLET_TRANSACTIONS}${walletAccountNumber}/statement`;
        
        const response = await axios.get(url, {

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        res.status(response.status).json(successResponse('Wallet transactions retrieved successfully', response.data));
    } catch (error) {
        console.error('Error retrieving wallet transactions:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};




exports.debitWallet = async (req, res) => {

    try {
        const payload = {
            amount: req.body.amount,
            reference: req.body.reference,
            narration: req.body.narration,
            destinationBankCode: req.body.destinationBankCode,
            destinationAccountNumber: req.body.destinationAccountNumber,
            currency: req.body.currency,
            sourceAccountNumber: req.body.sourceAccountNumber,
            destinationAccountName: req.body.destinationAccountName
        };

        const url = process.env.WALLET_DEBIT;
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        res.status(response.status).json(successResponse('Wallet debited successfully', response.data));
    } catch (error) {
        console.error('Error debiting wallet:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};




exports.transferVerification = async (req, res) => {
    try {
        const payload = {
            reference: req.body.reference,
            authorizationCode: req.body.authorizationCode
        };

        const response = await axios.post(process.env.VERIFY_TRANSFER, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        res.status(response.status).json(successResponse('Transfer verification successful', response.data));
    } catch (error) {
        console.error('Error verifying transfer:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
    }
};