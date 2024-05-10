const express = require("express");
const dotenv = require("dotenv").config();

const successResponse = (message, data = null, additionalProperties = {}) => {
    return {
        success: true,
        message: message,
        data: data,
        ...additionalProperties 
    };
}; 

const errorResponse = (message, statusCode = 500, additionalProperties = {}) => {
    return {
        success: false,
        message: message,
        statusCode: statusCode,
        ...additionalProperties 
    };
};

function generateUniqueReference(prefix = 'Retilda') {
    const timestamp = Date.now(); 
    const randomString = Math.random().toString(36).substring(7);

    return `${prefix}_${timestamp}_${randomString}`;
}

const uniqueReference = generateUniqueReference();
console.log(uniqueReference);


module.exports = {
    generateUniqueReference,
    successResponse,
    errorResponse
};