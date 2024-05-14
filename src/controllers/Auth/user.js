const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const User = require('../../models/Authmodel');
const { errorResponse, successResponse } = require('../components');



exports.createUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json(errorResponse('Username or Email already exists', 400));
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashedPassword,
            isVerified: false,
            accounttype: req.body.accounttype,
            wallet: { status: "Not available" } 
        });

        await newUser.save();

        return res.status(200).json(successResponse('User Registered Successfully', newUser));
    } catch (error) {
        console.error('Error creating user:', error.message);
        if (error.code && error.code === 11000) {
            const keyPattern = Object.keys(error.keyPattern)[0];
            const keyValue = error.keyValue[keyPattern];
            return res.status(400).json(errorResponse(`The ${keyPattern} '${keyValue}' is already taken. Please choose another one.`, 400));
        }
        return res.status(500).json(errorResponse('Internal Server Error'));
    }
};





exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json(errorResponse('User not found', 404));
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json(errorResponse('Invalid credentials', 401));
        }

        res.status(200).json(successResponse('Login successful', { user }));
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json(errorResponse('Internal server error', 500, error.message));
    }
};


