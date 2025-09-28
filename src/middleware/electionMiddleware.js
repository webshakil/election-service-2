// Fixed middleware file
import ElectionService from '../services/electionService.js';

// Validate election creation data
export const validateElectionCreation = async (req, res, next) => {
  try {
    const { body } = req;

    // Parse JSON strings if they exist (for FormData uploads)
    if (typeof body.electionData === 'string') {
      try {
        const parsedData = JSON.parse(body.electionData);
        // Merge parsed data with body
        Object.assign(body, parsedData);
        delete body.electionData;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid electionData format',
          error: 'electionData must be valid JSON'
        });
      }
    }

    if (typeof body.questions === 'string') {
      try {
        body.questions = JSON.parse(body.questions);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid questions format',
          error: 'Questions must be valid JSON'
        });
      }
    }

    // Transform frontend data to backend format
    const transformedBody = ElectionService.transformFrontendData(body);
    Object.assign(req.body, transformedBody);

    // Validate required fields and data integrity
    const validationErrors = ElectionService.validateElectionData(req.body);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Validate dates
    const startDate = new Date(`${req.body.startDate}T${req.body.startTime || '09:00'}`);
    const endDate = new Date(`${req.body.endDate}T${req.body.endTime || '18:00'}`);
    const now = new Date();

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (endDate <= now && req.body.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish an election that ends in the past'
      });
    }

    // Validate file uploads
    if (req.files) {
      const fileValidationErrors = validateFileUploads(req.files);
      if (fileValidationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: fileValidationErrors
        });
      }
    }

    // Generate custom URL if not provided
    if (!req.body.customVotingUrl) {
      req.body.customVotingUrl = ElectionService.generateUniqueUrl(req.body.title);
    }

    // Sanitize data
    req.body = ElectionService.sanitizeElectionData(req.body);

    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate file uploads
const validateFileUploads = (files) => {
  const errors = [];
  const maxSizes = {
    topicImage: 5 * 1024 * 1024,    // 5MB
    logoBranding: 2 * 1024 * 1024,  // 2MB
    questionImages: 3 * 1024 * 1024, // 3MB
    answerImages: 2 * 1024 * 1024    // 2MB
  };

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  Object.keys(files).forEach(fieldName => {
    const fileArray = files[fieldName];
    
    fileArray.forEach((file, index) => {
      // Check file size
      const maxSize = maxSizes[fieldName] || 5 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${fieldName}[${index}]: File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`${fieldName}[${index}]: Invalid file type. Only JPEG, PNG, and WebP are allowed`);
      }

      // Check file name
      if (!file.originalname || file.originalname.length > 255) {
        errors.push(`${fieldName}[${index}]: Invalid filename`);
      }
    });
  });

  return errors;
};

// Check user permissions for election operations
export const checkElectionPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user owns the election or is admin
    const db = await import('../config/database.js').then(m => m.default);
    const client = await db.connect();

    try {
      const result = await client.query(
        'SELECT creator_id FROM vottery_elections WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const election = result.rows[0];
      
      // Allow access if user owns the election or is admin
      if (election.creator_id === userId || req.user?.role === 'admin') {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own elections.'
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    });
  }
};

// Check subscription limits
export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userSubscription = req.user?.subscription || 'free';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check creation permissions
    const permissionCheck = await ElectionService.checkCreationPermissions(userId, userSubscription);
    
    if (!permissionCheck.canCreate) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.reason,
        data: {
          limit: permissionCheck.limit,
          current: permissionCheck.current,
          suggestion: 'Upgrade to premium for unlimited elections'
        }
      });
    }

    // Add permission info to request
    req.userLimits = permissionCheck;
    next();
  } catch (error) {
    console.error('Subscription limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription check failed',
      error: error.message
    });
  }
};

// Rate limiting middleware
export const rateLimitElectionCreation = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // max 5 elections per 15 minutes

  if (!global.electionRateLimit) {
    global.electionRateLimit = new Map();
  }

  const clientRequests = global.electionRateLimit.get(clientIp) || [];
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many election creation attempts. Please try again later.',
      retryAfter: Math.ceil((windowMs - (now - recentRequests[0])) / 1000)
    });
  }

  recentRequests.push(now);
  global.electionRateLimit.set(clientIp, recentRequests);

  next();
};

// Logging middleware for elections
export const logElectionActivity = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`📊 Election API: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🔍 User: ${req.user?.id || 'Anonymous'} - IP: ${req.ip}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`⏱️ Election API Response: ${res.statusCode} - ${duration}ms`);
    
    if (data.success === false) {
      console.error(`❌ Election API Error: ${data.message}`);
    }
    
    return originalJson.call(this, data);
  };

  next();
};
//this is the last workable code
// import ElectionService from '../services/electionService.js';

// // Validate election creation data
// export const validateElectionCreation = async (req, res, next) => {
//   try {
//     const { body } = req;

//     // Parse JSON strings if they exist
//     if (typeof body.questions === 'string') {
//       try {
//         body.questions = JSON.parse(body.questions);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid questions format',
//           error: 'Questions must be valid JSON'
//         });
//       }
//     }

//     // Validate required fields and data integrity
//     const validationErrors = ElectionService.validateElectionData(body);
    
//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: validationErrors
//       });
//     }

//     // Validate dates
//     const startDate = new Date(`${body.startDate?.date}T${body.startTime || '09:00'}`);
//     const endDate = new Date(`${body.endDate?.date}T${body.endTime || '18:00'}`);
//     const now = new Date();

//     if (startDate >= endDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'End date must be after start date'
//       });
//     }

//     if (endDate <= now && body.isPublished) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot publish an election that ends in the past'
//       });
//     }

//     // Validate file uploads
//     if (req.files) {
//       const fileValidationErrors = validateFileUploads(req.files);
//       if (fileValidationErrors.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'File validation failed',
//           errors: fileValidationErrors
//         });
//       }
//     }

//     // Generate custom URL if not provided
//     if (!body.customVotingUrl) {
//       body.customVotingUrl = ElectionService.generateUniqueUrl(body.title);
//     }

//     next();
//   } catch (error) {
//     console.error('Validation middleware error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Validation error',
//       error: error.message
//     });
//   }
// };

// // Validate file uploads
// const validateFileUploads = (files) => {
//   const errors = [];
//   const maxSizes = {
//     topicImage: 5 * 1024 * 1024,    // 5MB
//     logoBranding: 2 * 1024 * 1024,  // 2MB
//     questionImages: 3 * 1024 * 1024, // 3MB
//     answerImages: 2 * 1024 * 1024    // 2MB
//   };

//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

//   Object.keys(files).forEach(fieldName => {
//     const fileArray = files[fieldName];
    
//     fileArray.forEach((file, index) => {
//       // Check file size
//       const maxSize = maxSizes[fieldName] || 5 * 1024 * 1024;
//       if (file.size > maxSize) {
//         errors.push(`${fieldName}[${index}]: File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
//       }

//       // Check file type
//       if (!allowedTypes.includes(file.mimetype)) {
//         errors.push(`${fieldName}[${index}]: Invalid file type. Only JPEG, PNG, and WebP are allowed`);
//       }

//       // Check file name
//       if (!file.originalname || file.originalname.length > 255) {
//         errors.push(`${fieldName}[${index}]: Invalid filename`);
//       }
//     });
//   });

//   return errors;
// };

// // Check user permissions for election operations
// export const checkElectionPermissions = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?.id; // Assuming auth middleware sets req.user

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Check if user owns the election or is admin
//     const db = await import('../config/database.js').then(m => m.default);
//     const client = await db.connect();

//     try {
//       const result = await client.query(
//         'SELECT creator_id FROM vottery_elections WHERE id = $1',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const election = result.rows[0];
      
//       // Allow access if user owns the election or is admin
//       if (election.creator_id === userId || req.user?.role === 'admin') {
//         next();
//       } else {
//         res.status(403).json({
//           success: false,
//           message: 'Access denied. You can only modify your own elections.'
//         });
//       }
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error('Permission check error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Permission check failed',
//       error: error.message
//     });
//   }
// };

// // Check subscription limits
// export const checkSubscriptionLimits = async (req, res, next) => {
//   try {
//     const userId = req.user?.id;
//     const userSubscription = req.user?.subscription || 'free';

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Check creation permissions
//     const permissionCheck = await ElectionService.checkCreationPermissions(userId, userSubscription);
    
//     if (!permissionCheck.canCreate) {
//       return res.status(403).json({
//         success: false,
//         message: permissionCheck.reason,
//         data: {
//           limit: permissionCheck.limit,
//           current: permissionCheck.current,
//           suggestion: 'Upgrade to premium for unlimited elections'
//         }
//       });
//     }

//     // Add permission info to request
//     req.userLimits = permissionCheck;
//     next();
//   } catch (error) {
//     console.error('Subscription limit check error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Subscription check failed',
//       error: error.message
//     });
//   }
// };

// // Rate limiting middleware
// export const rateLimitElectionCreation = (req, res, next) => {
//   // Simple in-memory rate limiting (in production, use Redis)
//   const clientIp = req.ip || req.connection.remoteAddress;
//   const now = Date.now();
//   const windowMs = 15 * 60 * 1000; // 15 minutes
//   const maxRequests = 5; // max 5 elections per 15 minutes

//   if (!global.electionRateLimit) {
//     global.electionRateLimit = new Map();
//   }

//   const clientRequests = global.electionRateLimit.get(clientIp) || [];
//   const recentRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);

//   if (recentRequests.length >= maxRequests) {
//     return res.status(429).json({
//       success: false,
//       message: 'Too many election creation attempts. Please try again later.',
//       retryAfter: Math.ceil((windowMs - (now - recentRequests[0])) / 1000)
//     });
//   }

//   recentRequests.push(now);
//   global.electionRateLimit.set(clientIp, recentRequests);

//   next();
// };

// // Sanitize input data
// export const sanitizeElectionData = (req, res, next) => {
//   try {
//     const { body } = req;

//     // Sanitize strings to prevent XSS
//     const sanitizeString = (str) => {
//       if (typeof str !== 'string') return str;
//       return str
//         .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
//         .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
//         .replace(/javascript:/gi, '')
//         .trim();
//     };

//     // Sanitize main fields
//     if (body.title) body.title = sanitizeString(body.title);
//     if (body.description) body.description = sanitizeString(body.description);
//     if (body.customVotingUrl) body.customVotingUrl = sanitizeString(body.customVotingUrl);

//     // Sanitize questions and answers
//     if (body.questions && Array.isArray(body.questions)) {
//       body.questions = body.questions.map(question => ({
//         ...question,
//         questionText: sanitizeString(question.questionText),
//         answers: question.answers ? question.answers.map(answer => ({
//           ...answer,
//           text: sanitizeString(answer.text)
//         })) : []
//       }));
//     }

//     next();
//   } catch (error) {
//     console.error('Sanitization error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Data sanitization failed',
//       error: error.message
//     });
//   }
// };

// // Logging middleware for elections
// export const logElectionActivity = (req, res, next) => {
//   const startTime = Date.now();
  
//   // Log request
//   console.log(`📊 Election API: ${req.method} ${req.path} - ${new Date().toISOString()}`);
//   console.log(`🔍 User: ${req.user?.id || 'Anonymous'} - IP: ${req.ip}`);
  
//   // Override res.json to log response
//   const originalJson = res.json;
//   res.json = function(data) {
//     const duration = Date.now() - startTime;
//     console.log(`⏱️ Election API Response: ${res.statusCode} - ${duration}ms`);
    
//     if (data.success === false) {
//       console.error(`❌ Election API Error: ${data.message}`);
//     }
    
//     return originalJson.call(this, data);
//   };

//   next();
// };