//one call for all operation
// Global error handler for election service
export const electionErrorHandler = (err, req, res, next) => {
  console.error('Election Service Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR'
  };

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    switch (err.code) {
      case '23505': // Unique violation
        error = {
          message: 'Duplicate entry detected',
          status: 409,
          code: 'DUPLICATE_ENTRY',
          details: err.detail
        };
        break;
      case '23503': // Foreign key violation
        error = {
          message: 'Referenced record not found',
          status: 400,
          code: 'INVALID_REFERENCE',
          details: err.detail
        };
        break;
      case '23514': // Check violation
        error = {
          message: 'Invalid data format',
          status: 400,
          code: 'INVALID_DATA',
          details: err.detail
        };
        break;
      default:
        error = {
          message: 'Database constraint violation',
          status: 400,
          code: 'DATABASE_ERROR',
          details: err.detail
        };
    }
  }

  // Cloudinary errors
  if (err.name === 'CloudinaryError' || err.error?.api_key) {
    error = {
      message: 'Image upload failed',
      status: 400,
      code: 'UPLOAD_ERROR',
      details: err.message
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      status: 400,
      code: 'FILE_TOO_LARGE',
      details: `Maximum file size is ${err.limit / (1024 * 1024)}MB`
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      status: 400,
      code: 'INVALID_FILE_FIELD',
      details: err.field
    };
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    error = {
      message: 'Invalid JSON format',
      status: 400,
      code: 'INVALID_JSON',
      details: 'Please check your JSON syntax'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: err.details || err.message
    };
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    error = {
      message: 'Authentication required',
      status: 401,
      code: 'UNAUTHORIZED',
      details: 'Please provide valid authentication credentials'
    };
  }

  // Authorization errors
  if (err.status === 403) {
    error = {
      message: 'Access denied',
      status: 403,
      code: 'FORBIDDEN',
      details: 'You do not have permission to perform this action'
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests',
      status: 429,
      code: 'RATE_LIMITED',
      details: 'Please slow down your requests',
      retryAfter: err.retryAfter || 60
    };
  }

  // Network/timeout errors
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    error = {
      message: 'Network error',
      status: 503,
      code: 'NETWORK_ERROR',
      details: 'Service temporarily unavailable'
    };
  }

  // Log error for monitoring
  logError(error, req, err);

  // Send error response
  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.details,
        stack: err.stack
      }),
      ...(error.retryAfter && { retryAfter: error.retryAfter })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

// Log errors for monitoring and debugging
const logError = (error, req, originalError) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    service: 'election-service',
    error: {
      message: error.message,
      code: error.code,
      status: error.status
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    },
    ...(process.env.NODE_ENV === 'development' && {
      stack: originalError.stack,
      details: error.details
    })
  };

  console.error('ELECTION_SERVICE_ERROR:', JSON.stringify(errorLog, null, 2));

  // In production, you might want to send this to a logging service
  // logToExternalService(errorLog);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler for election routes
export const electionNotFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Election endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
};

export default electionErrorHandler;
// import { Sequelize } from 'sequelize';

// // Global error handling middleware
// export const errorHandler = (err, req, res, next) => {
//   console.error('Error details:', {
//     message: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//     url: req.url,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });

//   // Default error response
//   let statusCode = 500;
//   let message = 'Internal server error';
//   let errorCode = 'INTERNAL_ERROR';

//   // Handle Sequelize validation errors
//   if (err instanceof Sequelize.ValidationError) {
//     statusCode = 400;
//     message = 'Validation failed';
//     errorCode = 'VALIDATION_ERROR';
    
//     const validationErrors = err.errors.map(error => ({
//       field: error.path,
//       message: error.message,
//       value: error.value
//     }));

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       errors: validationErrors,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle Sequelize constraint errors
//   if (err instanceof Sequelize.UniqueConstraintError) {
//     statusCode = 409;
//     message = 'Duplicate entry found';
//     errorCode = 'DUPLICATE_ENTRY';

//     const conflictErrors = err.errors.map(error => ({
//       field: error.path,
//       message: `${error.path} must be unique`,
//       value: error.value
//     }));

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       errors: conflictErrors,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle Sequelize foreign key constraint errors
//   if (err instanceof Sequelize.ForeignKeyConstraintError) {
//     statusCode = 400;
//     message = 'Invalid reference to related resource';
//     errorCode = 'FOREIGN_KEY_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       details: 'The referenced resource does not exist',
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle Sequelize connection errors
//   if (err instanceof Sequelize.ConnectionError) {
//     statusCode = 503;
//     message = 'Database connection error';
//     errorCode = 'DATABASE_CONNECTION_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle Sequelize timeout errors
//   if (err instanceof Sequelize.TimeoutError) {
//     statusCode = 408;
//     message = 'Request timeout';
//     errorCode = 'REQUEST_TIMEOUT';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle custom application errors
//   if (err.name === 'CustomError' || err.statusCode) {
//     statusCode = err.statusCode || 400;
//     message = err.message;
//     errorCode = err.errorCode || 'CUSTOM_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       details: err.details,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     statusCode = 401;
//     message = 'Invalid token';
//     errorCode = 'INVALID_TOKEN';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   if (err.name === 'TokenExpiredError') {
//     statusCode = 401;
//     message = 'Token expired';
//     errorCode = 'TOKEN_EXPIRED';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle multer errors (file upload)
//   if (err.code === 'LIMIT_FILE_SIZE') {
//     statusCode = 400;
//     message = 'File size too large';
//     errorCode = 'FILE_SIZE_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//     statusCode = 400;
//     message = 'Unexpected file field';
//     errorCode = 'UNEXPECTED_FILE_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle syntax errors
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     statusCode = 400;
//     message = 'Invalid JSON format';
//     errorCode = 'INVALID_JSON';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle rate limiting errors
//   if (err.message && err.message.includes('Too many requests')) {
//     statusCode = 429;
//     message = 'Too many requests';
//     errorCode = 'RATE_LIMIT_EXCEEDED';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       retryAfter: err.retryAfter || 900, // 15 minutes default
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle permission errors
//   if (err.message && (err.message.includes('permission') || err.message.includes('unauthorized'))) {
//     statusCode = 403;
//     message = err.message || 'Insufficient permissions';
//     errorCode = 'PERMISSION_DENIED';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle not found errors
//   if (err.message && err.message.includes('not found')) {
//     statusCode = 404;
//     message = err.message || 'Resource not found';
//     errorCode = 'NOT_FOUND';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Handle validation errors from express-validator
//   if (err.array && typeof err.array === 'function') {
//     statusCode = 400;
//     message = 'Validation failed';
//     errorCode = 'VALIDATION_ERROR';

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errorCode,
//       errors: err.array(),
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Default error response
//   return res.status(statusCode).json({
//     success: false,
//     message,
//     errorCode,
//     timestamp: new Date().toISOString(),
//     ...(process.env.NODE_ENV === 'development' && {
//       stack: err.stack,
//       details: err
//     })
//   });
// };

// // Custom error classes
// export class CustomError extends Error {
//   constructor(message, statusCode = 400, errorCode = 'CUSTOM_ERROR', details = null) {
//     super(message);
//     this.name = 'CustomError';
//     this.statusCode = statusCode;
//     this.errorCode = errorCode;
//     this.details = details;
//   }
// }

// export class ValidationError extends CustomError {
//   constructor(message, details = null) {
//     super(message, 400, 'VALIDATION_ERROR', details);
//     this.name = 'ValidationError';
//   }
// }

// export class NotFoundError extends CustomError {
//   constructor(message = 'Resource not found', details = null) {
//     super(message, 404, 'NOT_FOUND', details);
//     this.name = 'NotFoundError';
//   }
// }

// export class PermissionError extends CustomError {
//   constructor(message = 'Insufficient permissions', details = null) {
//     super(message, 403, 'PERMISSION_DENIED', details);
//     this.name = 'PermissionError';
//   }
// }

// export class DuplicateError extends CustomError {
//   constructor(message = 'Duplicate entry found', details = null) {
//     super(message, 409, 'DUPLICATE_ENTRY', details);
//     this.name = 'DuplicateError';
//   }
// }

// // Async error handler wrapper
// export const asyncHandler = (fn) => {
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// };

// // 404 handler for unmatched routes
// export const notFound = (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`,
//     errorCode: 'ROUTE_NOT_FOUND',
//     timestamp: new Date().toISOString()
//   });
// };

// export default {
//   errorHandler,
//   CustomError,
//   ValidationError,
//   NotFoundError,
//   PermissionError,
//   DuplicateError,
//   asyncHandler,
//   notFound
// };