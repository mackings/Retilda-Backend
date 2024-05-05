const express = require("express");
const axios = require('axios');
const dotenv = require("dotenv").config();
const {errorResponse,successResponse} = require("../components");
const credentials = `${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`;
const authString = Buffer.from(credentials).toString('base64');


exports.createwallet = async (req, res) => {

    try {
        const payload = {

            walletReference: req.body. walletReference,
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

        res.status(response.status).json(successResponse('Wallet created successfully', response.data));
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json(errorResponse('Internal Server Error'));
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