
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, ApiError };
