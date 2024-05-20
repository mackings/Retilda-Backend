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
            fullname: req.body.fullname,
            email: req.body.email,
            username: req.body.phone,
            password: hashedPassword,
            isVerified: false,
            accounttype: req.body.accounttype,
            wallet: { status: "Not available" } 
        });

        await newUser.save();

        return res.status(200).json(successResponse('User Registered Successfully', newUser));
    } catch (error) {
        console.error('Error creating user:', error.message);
        return res.status(500).json(errorResponse('Error creating user:', error.message));
       
    }
};





exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json(errorResponse('User not found', 404, 'User not found'));
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json(errorResponse('Invalid credentials',401));
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.VALIDATION_KEY, 
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json(successResponse('Login successful', { token, user }));
            }
        );
    } catch (error) {
        console.error('Error logging in user:', error);
        const errorMessage = error.message || 'Internal server error';
        res.status(500).json(errorResponse(errorMessage, 500, errorMessage));
    }
};



