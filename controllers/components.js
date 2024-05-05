
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

module.exports = {
    successResponse,
    errorResponse
};