
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
    const randomString = Math.random().toString(36).substring(7); // Generate a random string

    return `${prefix}_${timestamp}_${randomString}`;
}

// Example usage:
const uniqueReference = generateUniqueReference();
console.log(uniqueReference);


module.exports = {
    generateUniqueReference,
    successResponse,
    errorResponse
};