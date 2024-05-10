const express = require("express");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const {errorResponse , successResponse } = require("./components");




exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json(errorResponse('Unauthorized: No token provided', 401));
    }

    const tokenParts = token.split(' ');
    const tokenValue = tokenParts[1];

    jwt.verify(tokenValue, process.env.VALIDATION_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json(errorResponse('Unauthorized: Invalid token', 401));
        } else {
            req.userId = decoded.user.id;
            next();
        }
    });
};
