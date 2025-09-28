import { validationResult } from 'express-validator';

// Generic validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
        location: error.location
      }))
    });
  }
  
  next();
};

// Sanitize input middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS vectors
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Trim whitespace from string inputs
export const trimInputs = (req, res, next) => {
  const trimObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(trimObject);
    }
    
    if (typeof obj === 'object') {
      const trimmed = {};
      for (const [key, value] of Object.entries(obj)) {
        trimmed[key] = trimObject(value);
      }
      return trimmed;
    }
    
    if (typeof obj === 'string') {
      return obj.trim();
    }
    
    return obj;
  };

  if (req.body) {
    req.body = trimObject(req.body);
  }
  
  if (req.query) {
    req.query = trimObject(req.query);
  }
  
  next();
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = { page, limit };
  next();
};

// Validate sort parameters
export const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    const sortBy = req.query.sort_by;
    const sortOrder = req.query.sort_order;
    
    if (sortBy && allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
      });
    }
    
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Sort order must be either "asc" or "desc"'
      });
    }
    
    req.sort = {
      sortBy: sortBy || 'created_at',
      sortOrder: (sortOrder || 'desc').toLowerCase()
    };
    
    next();
  };
};

// Validate UUID format
export const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Validate JSON format in request body
export const validateJSON = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    try {
      // Try to stringify and parse to ensure valid JSON structure
      JSON.parse(JSON.stringify(req.body));
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON structure in request body'
      });
    }
  } else {
    next();
  }
};

// Rate limiting validation helper
export const validateRateLimit = (windowMs = 900000, maxRequests = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [id, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(id);
      } else {
        requests.set(id, validTimestamps);
      }
    }
    
    // Check current client
    const clientRequests = requests.get(clientId) || [];
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(clientId, validRequests);
    
    next();
  };
};

export default {
  handleValidationErrors,
  sanitizeInput,
  trimInputs,
  validatePagination,
  validateSort,
  validateUUID,
  validateJSON,
  validateRateLimit
};