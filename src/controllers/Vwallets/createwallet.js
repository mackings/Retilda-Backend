const axios = require('axios');
const User = require('../../models/Authmodel'); 
const { successResponse, errorResponse } = require('../components');
const dotenv = require('dotenv').config();




exports.createCustomer = async (req, res) => {

    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json(errorResponse('User already exists', 400));
        }

        // Log the request body for debugging
        console.log("Request Body:", req.body);

        // Prepare the payload for Paystack API
        const payload = {
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone
        };

        // Log the payload to ensure correct data is being sent
        console.log("Payload to Paystack:", payload);

        // Make the request to Paystack using Axios
        const response = await axios.post('https://api.paystack.co/customer', payload, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Paystack secret key from environment variables
                'Content-Type': 'application/json'
            }
        });

        // Log the Paystack API response
        console.log("Paystack API Response:", response.data);
        const customerData = response.data.data;
const newUser = new User({
    email: customerData.email,
    fullname: `${customerData.first_name} ${customerData.last_name}`,
    phone: req.body.phone,
    customerCode: customerData.customer_code,
    createdAt: customerData.createdAt,
    updatedAt: customerData.updatedAt
});


        await newUser.save();

        res.status(201).json(successResponse('Customer created successfully', customerData));

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);

        const errorMessage = error.response?.data?.message || 'Error creating customer';
        res.status(500).json(errorResponse(errorMessage));
    }
};



exports.createDedicatedAccount = async (req, res) => {
    
    const { email } = req.body; // Expecting the user's email in the request body

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract the customer code from the user's wallet
        const customerCode = user.customerCode;
        
        // Ensure the customer code exists in the user's profile
        if (!customerCode) {
            return res.status(400).json({ message: 'Customer code is missing from user profile' });
        }

        // Set up the request options for Paystack API
        const options = {
            method: 'POST',
            url: 'https://api.paystack.co/dedicated_account',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Use your Paystack secret key from environment variables
                'Content-Type': 'application/json'
            },
            data: {
                email:email,
                customer: customerCode, 
                preferred_bank: "wema-bank" ,
                phone:user.phone,
                first_name: user.fullname.split(' ')[0],
                last_name: user.fullname.split(' ')[1]
            }

        };
        console.log(options.data);

        // Make the request to Paystack to create a dedicated account
        const response = await axios(options);

        // Handle Paystack's response
        const dedicatedAccountData = response.data.data;
        console.log("Dedicated Account Created:", dedicatedAccountData);

        // Update the user's wallet details with the new dedicated account information
        user.wallet.accountNumber = dedicatedAccountData.account_number;
        user.wallet.accountName = dedicatedAccountData.account_name;
        user.wallet.bankCode = dedicatedAccountData.bank.id;
        user.wallet.bankName = dedicatedAccountData.bank.name;

        // Save the updated user
        await user.save();

        // Respond with the dedicated account details
        res.status(201).json({
            message: 'Dedicated account created successfully',
            data: dedicatedAccountData
        });

    } catch (error) {
        console.error("Error creating dedicated account:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error creating dedicated account' });
    }
};