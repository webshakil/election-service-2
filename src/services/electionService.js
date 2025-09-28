// services/electionService.js (Backend)
class ElectionService {
  /**
   * Validate election data
   * @param {Object} electionData - Election data to validate
   * @returns {Array} Array of validation errors
   */
  static validateElectionData(electionData) {
    const errors = [];

    // Required fields validation
    if (!electionData.title?.trim()) {
      errors.push('Election title is required');
    }

    if (!electionData.description?.trim()) {
      errors.push('Election description is required');
    }

    // Date validation
    if (!electionData.startDate?.date && !electionData.startDate) {
      errors.push('Start date is required');
    }

    if (!electionData.endDate?.date && !electionData.endDate) {
      errors.push('End date is required');
    }

    // Pricing validation
    if (electionData.pricingType === 'general' && (!electionData.participationFee || electionData.participationFee <= 0)) {
      errors.push('Participation fee must be greater than 0 for paid elections');
    }

    if (electionData.pricingType === 'regional') {
      const regionalFees = electionData.regionalFees || {};
      const hasValidFee = Object.values(regionalFees).some(fee => fee > 0);
      if (!hasValidFee) {
        errors.push('At least one regional fee must be greater than 0 for regional pricing');
      }
    }

    // Lottery validation
    if (electionData.isLotterized) {
      if (electionData.rewardType === 'monetary' && (!electionData.rewardAmount || electionData.rewardAmount <= 0)) {
        errors.push('Reward amount must be greater than 0 for monetary lottery');
      }

      if (electionData.rewardType === 'non_monetary' && !electionData.nonMonetaryReward?.trim()) {
        errors.push('Non-monetary reward description is required');
      }

      if (electionData.rewardType === 'revenue_share') {
        if (!electionData.projectedRevenue || electionData.projectedRevenue <= 0) {
          errors.push('Projected revenue must be greater than 0');
        }
        if (!electionData.revenueSharePercentage || electionData.revenueSharePercentage <= 0 || electionData.revenueSharePercentage > 100) {
          errors.push('Revenue share percentage must be between 1 and 100');
        }
      }

      if (!electionData.winnerCount || electionData.winnerCount < 1 || electionData.winnerCount > 100) {
        errors.push('Winner count must be between 1 and 100');
      }
    }

    // Country validation
    if (electionData.permissionToVote === 'country_specific' && (!electionData.countries || electionData.countries.length === 0)) {
      errors.push('At least one country must be selected for country-specific elections');
    }

    // Questions validation
    if (electionData.questions && Array.isArray(electionData.questions)) {
      electionData.questions.forEach((question, index) => {
        if (!question.questionText?.trim()) {
          errors.push(`Question ${index + 1}: Question text is required`);
        }

        if (!question.answers || question.answers.length < 2) {
          errors.push(`Question ${index + 1}: At least 2 answers are required`);
        }

        if (question.answers) {
          question.answers.forEach((answer, answerIndex) => {
            if (!answer.text?.trim()) {
              errors.push(`Question ${index + 1}, Answer ${answerIndex + 1}: Answer text is required`);
            }
          });
        }
      });
    }

    return errors;
  }

  /**
   * Generate unique URL slug from title
   * @param {string} title - Election title
   * @returns {string} URL slug
   */
  static generateUniqueUrl(title) {
    if (!title) return `election-${Date.now()}`;
    
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50) // Limit length
      + `-${Date.now()}`; // Add timestamp for uniqueness
  }

  /**
   * Check creation permissions based on subscription
   * @param {number} userId - User ID
   * @param {string} subscription - User subscription type
   * @returns {Object} Permission check result
   */
  static async checkCreationPermissions(userId, subscription = 'free') {
    try {
      // Import database connection
      const db = await import('../config/database.js').then(m => m.default);
      const client = await db.connect();

      // Count user's existing elections
      const result = await client.query(
        'SELECT COUNT(*) FROM vottery_elections WHERE creator_id = $1',
        [userId]
      );

      const currentCount = parseInt(result.rows[0].count);
      client.release();

      // Define limits based on subscription
      const limits = {
        free: 3,
        basic: 10,
        premium: -1, // Unlimited
        enterprise: -1 // Unlimited
      };

      const limit = limits[subscription] || limits.free;
      const canCreate = limit === -1 || currentCount < limit;

      return {
        canCreate,
        current: currentCount,
        limit: limit === -1 ? 'unlimited' : limit,
        reason: canCreate ? null : `You have reached your ${subscription} plan limit of ${limit} elections`
      };
    } catch (error) {
      console.error('Error checking creation permissions:', error);
      return {
        canCreate: false,
        current: 0,
        limit: 0,
        reason: 'Unable to verify subscription limits'
      };
    }
  }

  /**
   * Sanitize election data to prevent XSS
   * @param {Object} data - Election data
   * @returns {Object} Sanitized data
   */
  static sanitizeElectionData(data) {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    };

    const sanitized = { ...data };

    // Sanitize main fields
    if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
    if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
    if (sanitized.customVotingUrl) sanitized.customVotingUrl = sanitizeString(sanitized.customVotingUrl);

    // Sanitize questions and answers
    if (sanitized.questions && Array.isArray(sanitized.questions)) {
      sanitized.questions = sanitized.questions.map(question => ({
        ...question,
        questionText: sanitizeString(question.questionText),
        answers: question.answers ? question.answers.map(answer => ({
          ...answer,
          text: sanitizeString(answer.text)
        })) : []
      }));
    }

    return sanitized;
  }

  /**
   * Transform frontend data to backend format
   * @param {Object} frontendData - Data from frontend
   * @returns {Object} Backend compatible data
   */
  static transformFrontendData(frontendData) {
    const transformed = { ...frontendData };

    // Transform date format
    if (frontendData.startDate && typeof frontendData.startDate === 'object') {
      transformed.startDate = frontendData.startDate.date;
      transformed.startTime = frontendData.startDate.time || '09:00';
    }

    if (frontendData.endDate && typeof frontendData.endDate === 'object') {
      transformed.endDate = frontendData.endDate.date;
      transformed.endTime = frontendData.endDate.time || '18:00';
    }

    // Ensure proper boolean values
    transformed.isDraft = frontendData.isDraft !== false;
    transformed.isPublished = frontendData.isPublished === true;
    transformed.isLotterized = frontendData.isLotterized === true;
    transformed.requireBiometric = frontendData.requireBiometric === true;
    transformed.requireIdVerification = frontendData.requireIdVerification === true;

    // Ensure arrays
    transformed.countries = frontendData.countries || [];
    transformed.questions = frontendData.questions || [];

    return transformed;
  }
}

export default ElectionService;
// //this is the last code
// // //one call for all operation
// import {ElectionService} from '../services/electionService.js';

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

// // import { 
// //   Election, 
// //   Question, 
// //   Answer, 
// //   ElectionAccess, 
// //   ElectionBranding, 
// //   ElectionLottery, 
// //   ElectionSecurity,
// //   Vote,
// //   VoteAnswer,
// //   sequelize 
// // } from '../models/index.js';
// // import { uploadService } from './uploadService.js';
// // import { securityService } from './securityService.js';
// // import { lotteryService } from './lotteryService.js';
// // import { notificationService } from './notificationService.js';
// // //import { validationService } from './validationService.js';
// // import slugify from 'slugify';
// // import { v4 as uuidv4 } from 'uuid';
// // import { Op } from 'sequelize';
// // import { 
// //   ELECTION_STATUSES, 
// //   VOTING_TYPES, 
// //   AUTHENTICATION_METHODS,
// //   SUBSCRIPTION_LIMITS,
// //   QUESTION_TYPES,
// //   PRIZE_TYPES,
// //   PERMISSION_TYPES,
// //   PRICING_TYPES
// // } from '../config/constants.js';

// // class ElectionService {
// //   /**
// //    * Create new election with all related components
// //    * @param {number} creatorId - ID of the election creator
// //    * @param {Object} electionData - Complete election data
// //    * @returns {Promise<Object>} Created election with all relationships
// //    */
// //   async createElection(creatorId, electionData) {
// //     const transaction = await sequelize.transaction();
    
// //     try {
// //       // Validate creator permissions
// //       await this.validateCreatorPermissions(creatorId);

// //       // Extract nested data
// //       const {
// //         // Basic election data
// //         title,
// //         description,
// //         voting_body_content,
// //         start_date,
// //         end_date,
// //         timezone = 'UTC',
// //         voting_type = VOTING_TYPES.PLURALITY,
// //         authentication_method = AUTHENTICATION_METHODS.PASSKEY,
// //         biometric_required = false,
        
// //         // Images/Videos
// //         topic_image,
// //         topic_video,
        
// //         // Custom URL
// //         custom_voting_url,
        
// //         // Content creator specific
// //         is_content_creator_election = false,
// //         projected_revenue_amount,
        
// //         // Multi-language
// //         supported_languages = ['en'],
// //         translated_content = {},
        
// //         // Settings
// //         allow_vote_editing = false,
// //         show_live_results = false,
// //         results_visibility_changeable = true,
        
// //         // Nested components
// //         questions = [],
// //         access_control = {},
// //         branding = {},
// //         lottery = {},
// //         security = {}
// //       } = electionData;

// //       // Validate election data
// //       await this.validateElectionData(electionData);

// //       // Generate unique identifiers
// //       const uniqueElectionId = uuidv4();
// //       let customUrl = null;
      
// //       if (custom_voting_url) {
// //         customUrl = await this.generateUniqueCustomUrl(custom_voting_url);
// //       }

// //       // Upload images/videos if provided
// //       let topicImageUrl = null;
// //       let topicVideoUrl = null;
      
// //       if (topic_image) {
// //         topicImageUrl = await uploadService.uploadImage(topic_image, 'elections');
// //       }
      
// //       if (topic_video) {
// //         topicVideoUrl = await uploadService.uploadVideo(topic_video, 'elections');
// //       }

// //       // Create main election record
// //       const election = await Election.create({
// //         creator_id: creatorId,
// //         title,
// //         description,
// //         voting_body_content,
// //         start_date: new Date(start_date),
// //         end_date: new Date(end_date),
// //         timezone,
// //         voting_type,
// //         authentication_method,
// //         biometric_required,
// //         topic_image_url: topicImageUrl,
// //         topic_video_url: topicVideoUrl,
// //         custom_voting_url: customUrl,
// //         unique_election_id: uniqueElectionId,
// //         is_content_creator_election,
// //         projected_revenue_amount,
// //         supported_languages,
// //         translated_content,
// //         allow_vote_editing,
// //         show_live_results,
// //         results_visibility_changeable,
// //         status: ELECTION_STATUSES.DRAFT
// //       }, { transaction });

// //       // Create access control settings
// //       const accessControlData = {
// //         election_id: election.id,
// //         permission_type: access_control.permission_type || PERMISSION_TYPES.WORLD_CITIZENS,
// //         pricing_type: access_control.pricing_type || PRICING_TYPES.FREE,
// //         general_fee: access_control.general_fee || 0,
// //         regional_fees: access_control.regional_fees || {},
// //         processing_fee_percentage: access_control.processing_fee_percentage || 0,
// //         allowed_countries: access_control.allowed_countries || [],
// //         blocked_countries: access_control.blocked_countries || [],
// //         allowed_organizations: access_control.allowed_organizations || [],
// //         max_participants: access_control.max_participants,
// //         min_age: access_control.min_age,
// //         max_age: access_control.max_age,
// //         require_verification: access_control.require_verification || false,
// //         whitelist_emails: access_control.whitelist_emails || [],
// //         blacklist_emails: access_control.blacklist_emails || []
// //       };

// //       await ElectionAccess.create(accessControlData, { transaction });

// //       // Create branding settings
// //       const brandingData = {
// //         election_id: election.id,
// //         primary_color: branding.primary_color || '#007bff',
// //         secondary_color: branding.secondary_color || '#6c757d',
// //         background_color: branding.background_color || '#ffffff',
// //         text_color: branding.text_color || '#212529',
// //         font_family: branding.font_family || 'Inter, system-ui, sans-serif',
// //         corporate_style_enabled: branding.corporate_style_enabled || false,
// //         white_label_enabled: branding.white_label_enabled || false,
// //         custom_css: branding.custom_css || '',
// //         content_creator_branding: branding.content_creator_branding || { enabled: false },
// //         button_style: branding.button_style || 'default',
// //         layout_style: branding.layout_style || 'default'
// //       };

// //       // Upload branding images if provided
// //       if (branding.logo_image) {
// //         brandingData.logo_url = await uploadService.uploadImage(branding.logo_image, 'branding');
// //       }
// //       if (branding.background_image) {
// //         brandingData.background_image_url = await uploadService.uploadImage(branding.background_image, 'branding');
// //       }

// //       await ElectionBranding.create(brandingData, { transaction });

// //       // Create lottery settings
// //       const lotteryData = {
// //         election_id: election.id,
// //         lottery_enabled: lottery.lottery_enabled || false,
// //         prize_type: lottery.prize_type || PRIZE_TYPES.MONETARY,
// //         monetary_amount: lottery.monetary_amount || 0,
// //         monetary_currency: lottery.monetary_currency || 'USD',
// //         non_monetary_description: lottery.non_monetary_description,
// //         projected_revenue_amount: lottery.projected_revenue_amount || projected_revenue_amount,
// //         projected_revenue_percentage: lottery.projected_revenue_percentage || 100,
// //         winner_count: lottery.winner_count || 1,
// //         prize_distribution: lottery.prize_distribution || [{ rank: 1, percentage: 100 }],
// //         auto_trigger_at_election_end: lottery.auto_trigger_at_election_end !== false,
// //         lottery_trigger_time: lottery.lottery_trigger_time,
// //         sponsor_funded: lottery.sponsor_funded || false,
// //         sponsor_id: lottery.sponsor_id,
// //         prize_pool_visibility: lottery.prize_pool_visibility !== false
// //       };

// //       await ElectionLottery.create(lotteryData, { transaction });

// //       // Create security settings
// //       const securityData = {
// //         election_id: election.id,
// //         encryption_enabled: security.encryption_enabled !== false,
// //         digital_signatures_enabled: security.digital_signatures_enabled !== false,
// //         audit_trail_enabled: security.audit_trail_enabled !== false,
// //         biometric_required,
// //         authentication_methods: security.authentication_methods || [authentication_method],
// //         anonymous_voting: security.anonymous_voting !== false,
// //         tamper_detection_enabled: security.tamper_detection_enabled !== false,
// //         ip_restriction_enabled: security.ip_restriction_enabled || false,
// //         allowed_ip_ranges: security.allowed_ip_ranges || [],
// //         rate_limiting_enabled: security.rate_limiting_enabled !== false,
// //         max_votes_per_ip: security.max_votes_per_ip || 1,
// //         fraud_detection_enabled: security.fraud_detection_enabled !== false
// //       };

// //       await ElectionSecurity.create(securityData, { transaction });

// //       // Create questions if provided
// //       for (let i = 0; i < questions.length; i++) {
// //         const questionData = questions[i];
        
// //         // Upload question image if provided
// //         let questionImageUrl = null;
// //         if (questionData.question_image) {
// //           questionImageUrl = await uploadService.uploadImage(questionData.question_image, 'questions');
// //         }

// //         const question = await Question.create({
// //           election_id: election.id,
// //           question_text: questionData.question_text,
// //           question_type: questionData.question_type,
// //           question_order: i + 1,
// //           is_required: questionData.is_required !== false,
// //           min_selections: questionData.min_selections || 1,
// //           max_selections: questionData.max_selections || (questionData.question_type === QUESTION_TYPES.APPROVAL ? 999 : 1),
// //           text_min_length: questionData.text_min_length || 1,
// //           text_max_length: questionData.text_max_length || 5000,
// //           question_image_url: questionImageUrl,
// //           question_description: questionData.question_description,
// //           comparison_items: questionData.comparison_items || [],
// //           plurality_config: questionData.plurality_config || {},
// //           ranked_choice_config: questionData.ranked_choice_config || {},
// //           approval_config: questionData.approval_config || {},
// //           translated_questions: questionData.translated_questions || {},
// //           randomize_answers: questionData.randomize_answers || false,
// //           allow_other_option: questionData.allow_other_option || false,
// //           weight: questionData.weight || 1.0
// //         }, { transaction });

// //         // Create answers if provided (required for MCQ, Image, and Comparison questions)
// //         if (questionData.answers && questionData.answers.length > 0) {
// //           for (let j = 0; j < questionData.answers.length; j++) {
// //             const answerData = questionData.answers[j];
            
// //             let answerImageUrl = null;
// //             if (answerData.answer_image) {
// //               answerImageUrl = await uploadService.uploadImage(answerData.answer_image, 'answers');
// //             }

// //             await Answer.create({
// //               question_id: question.id,
// //               answer_text: answerData.answer_text,
// //               answer_image_url: answerImageUrl,
// //               answer_order: j + 1,
// //               comparison_item_id: answerData.comparison_item_id,
// //               comparison_attributes: answerData.comparison_attributes || {},
// //               image_description: answerData.image_description,
// //               image_alt_text: answerData.image_alt_text,
// //               translated_answers: answerData.translated_answers || {},
// //               weight: answerData.weight || 1.0,
// //               is_correct: answerData.is_correct || false,
// //               additional_data: answerData.additional_data || {}
// //             }, { transaction });
// //           }
// //         }
// //       }

// //       // Generate content creator integration if enabled
// //       if (is_content_creator_election) {
// //         await this.setupContentCreatorIntegration(election.id, transaction);
// //       }

// //       // Initialize security components
// //       await securityService.initializeElectionSecurity(election.id, securityData, transaction);

// //       await transaction.commit();

// //       // Send notifications
// //       await notificationService.sendElectionCreatedNotification(creatorId, election.id);

// //       // Return complete election with all relationships
// //       return await this.getElectionById(election.id, creatorId);

// //     } catch (error) {
// //       await transaction.rollback();
// //       console.error('Create election service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get election by ID with all relationships
// //    * @param {number} electionId - Election ID
// //    * @param {number} userId - Current user ID (optional)
// //    * @returns {Promise<Object>} Complete election data
// //    */
// //   async getElectionById(electionId, userId = null) {
// //     try {
// //       const election = await Election.findByPk(electionId, {
// //         include: [
// //           {
// //             model: Question,
// //             as: 'questions',
// //             include: [
// //               {
// //                 model: Answer,
// //                 as: 'answers',
// //                 order: [['answer_order', 'ASC']]
// //               }
// //             ],
// //             order: [['question_order', 'ASC']]
// //           },
// //           {
// //             model: ElectionAccess,
// //             as: 'access_control'
// //           },
// //           {
// //             model: ElectionBranding,
// //             as: 'branding'
// //           },
// //           {
// //             model: ElectionLottery,
// //             as: 'lottery'
// //           },
// //           {
// //             model: ElectionSecurity,
// //             as: 'security_config'
// //           }
// //         ]
// //       });

// //       if (!election) {
// //         return null;
// //       }

// //       // Add computed fields
// //       const electionData = election.toJSON();
// //       electionData.is_active = this.isElectionActive(election);
// //       electionData.is_expired = this.isElectionExpired(election);
// //       electionData.can_edit = this.canEditElection(election, userId);
// //       electionData.can_delete = this.canDeleteElection(election, userId);
// //       electionData.is_creator = userId ? election.creator_id === userId : false;
// //       electionData.voting_url = this.generateVotingUrl(election);

// //       // Get vote statistics if needed
// //       if (userId && election.creator_id === userId) {
// //         electionData.vote_statistics = await this.getElectionStatistics(electionId);
// //       }

// //       return electionData;

// //     } catch (error) {
// //       console.error('Get election by ID service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Update an existing election
// //    * @param {number} electionId - Election ID
// //    * @param {number} userId - User ID making the update
// //    * @param {Object} updateData - Data to update
// //    * @returns {Promise<Object>} Updated election
// //    */
// //   async updateElection(electionId, userId, updateData) {
// //     const transaction = await sequelize.transaction();
    
// //     try {
// //       const election = await Election.findByPk(electionId);
      
// //       if (!election) {
// //         throw new Error('Election not found');
// //       }

// //       // Check permissions
// //       if (!this.canEditElection(election, userId)) {
// //         throw new Error('Insufficient permissions to edit this election');
// //       }

// //       // Extract update data
// //       const {
// //         questions,
// //         access_control,
// //         branding,
// //         lottery,
// //         security,
// //         ...electionUpdates
// //       } = updateData;

// //       // Update main election record
// //       await election.update(electionUpdates, { transaction });

// //       // Update related records if provided
// //       if (access_control) {
// //         await ElectionAccess.update(access_control, {
// //           where: { election_id: electionId },
// //           transaction
// //         });
// //       }

// //       if (branding) {
// //         // Handle image uploads
// //         if (branding.logo_image) {
// //           branding.logo_url = await uploadService.uploadImage(branding.logo_image, 'branding');
// //           delete branding.logo_image;
// //         }
        
// //         await ElectionBranding.update(branding, {
// //           where: { election_id: electionId },
// //           transaction
// //         });
// //       }

// //       if (lottery) {
// //         await ElectionLottery.update(lottery, {
// //           where: { election_id: electionId },
// //           transaction
// //         });
// //       }

// //       if (security) {
// //         await ElectionSecurity.update(security, {
// //           where: { election_id: electionId },
// //           transaction
// //         });
// //       }

// //       // Update questions if provided (this is complex, might need separate endpoint)
// //       if (questions) {
// //         // Note: Question updates are complex and might be better handled separately
// //         // This is a simplified version
// //         for (const questionUpdate of questions) {
// //           if (questionUpdate.id) {
// //             await Question.update(questionUpdate, {
// //               where: { id: questionUpdate.id, election_id: electionId },
// //               transaction
// //             });
// //           }
// //         }
// //       }

// //       await transaction.commit();

// //       return await this.getElectionById(electionId, userId);

// //     } catch (error) {
// //       await transaction.rollback();
// //       console.error('Update election service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Delete an election
// //    * @param {number} electionId - Election ID
// //    * @param {number} userId - User ID making the deletion
// //    * @returns {Promise<boolean>} Success status
// //    */
// //   async deleteElection(electionId, userId) {
// //     const transaction = await sequelize.transaction();
    
// //     try {
// //       const election = await Election.findByPk(electionId);
      
// //       if (!election) {
// //         throw new Error('Election not found');
// //       }

// //       // Check permissions
// //       if (!this.canDeleteElection(election, userId)) {
// //         throw new Error('Insufficient permissions to delete this election');
// //       }

// //       // Check if election has votes
// //       const voteCount = await Vote.count({
// //         where: { election_id: electionId }
// //       });

// //       if (voteCount > 0 && election.status === ELECTION_STATUSES.ACTIVE) {
// //         throw new Error('Cannot delete active election with existing votes');
// //       }

// //       // Soft delete or hard delete based on vote count
// //       if (voteCount > 0) {
// //         await election.update({ 
// //           status: ELECTION_STATUSES.DELETED,
// //           deleted_at: new Date()
// //         }, { transaction });
// //       } else {
// //         // Hard delete if no votes
// //         await election.destroy({ transaction });
// //       }

// //       await transaction.commit();
// //       return true;

// //     } catch (error) {
// //       await transaction.rollback();
// //       console.error('Delete election service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get elections by creator with filters
// //    * @param {number} creatorId - Creator user ID
// //    * @param {Object} filters - Filter options
// //    * @returns {Promise<Object>} Paginated elections list
// //    */
// //   async getElectionsByCreator(creatorId, filters = {}) {
// //     try {
// //       const {
// //         status,
// //         voting_type,
// //         page = 1,
// //         limit = 10,
// //         search,
// //         sort_by = 'created_at',
// //         sort_order = 'DESC'
// //       } = filters;

// //       const whereClause = {
// //         creator_id: creatorId,
// //         status: { [Op.ne]: ELECTION_STATUSES.DELETED }
// //       };

// //       if (status) {
// //         whereClause.status = status;
// //       }

// //       if (voting_type) {
// //         whereClause.voting_type = voting_type;
// //       }

// //       if (search) {
// //         whereClause[Op.or] = [
// //           { title: { [Op.iLike]: `%${search}%` } },
// //           { description: { [Op.iLike]: `%${search}%` } }
// //         ];
// //       }

// //       const offset = (page - 1) * limit;

// //       const { rows: elections, count: total } = await Election.findAndCountAll({
// //         where: whereClause,
// //         include: [
// //           {
// //             model: ElectionAccess,
// //             as: 'access_control'
// //           },
// //           {
// //             model: ElectionLottery,
// //             as: 'lottery'
// //           }
// //         ],
// //         order: [[sort_by, sort_order]],
// //         limit: parseInt(limit),
// //         offset: offset
// //       });

// //       // Add computed fields
// //       const electionsWithMeta = elections.map(election => {
// //         const electionData = election.toJSON();
// //         electionData.is_active = this.isElectionActive(election);
// //         electionData.is_expired = this.isElectionExpired(election);
// //         electionData.voting_url = this.generateVotingUrl(election);
// //         return electionData;
// //       });

// //       return {
// //         elections: electionsWithMeta,
// //         pagination: {
// //           current_page: parseInt(page),
// //           total_pages: Math.ceil(total / limit),
// //           total_items: total,
// //           items_per_page: parseInt(limit)
// //         }
// //       };

// //     } catch (error) {
// //       console.error('Get elections by creator service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Clone/copy an existing election
// //    * @param {number} electionId - Original election ID
// //    * @param {number} userId - User ID making the clone
// //    * @param {Object} modifications - Modifications to apply
// //    * @returns {Promise<Object>} Cloned election
// //    */
// //   async cloneElection(electionId, userId, modifications = {}) {
// //     const transaction = await sequelize.transaction();
    
// //     try {
// //       // Get original election with all relationships
// //       const originalElection = await this.getElectionById(electionId, userId);
      
// //       if (!originalElection) {
// //         throw new Error('Original election not found');
// //       }

// //       // Check permissions (can clone own elections or public elections)
// //       if (originalElection.creator_id !== userId && originalElection.access_control.permission_type !== PERMISSION_TYPES.WORLD_CITIZENS) {
// //         throw new Error('Insufficient permissions to clone this election');
// //       }

// //       // Prepare cloned data
// //       const cloneData = {
// //         ...originalElection,
// //         ...modifications,
// //         title: modifications.title || `${originalElection.title} (Copy)`,
// //         status: ELECTION_STATUSES.DRAFT,
// //         unique_election_id: uuidv4(),
// //         custom_voting_url: null, // Will be regenerated if needed
// //         created_at: undefined,
// //         updated_at: undefined,
// //         id: undefined
// //       };

// //       // Create the cloned election
// //       const clonedElection = await this.createElection(userId, cloneData);

// //       await transaction.commit();
// //       return clonedElection;

// //     } catch (error) {
// //       await transaction.rollback();
// //       console.error('Clone election service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get election statistics
// //    * @param {number} electionId - Election ID
// //    * @returns {Promise<Object>} Election statistics
// //    */
// //   async getElectionStatistics(electionId) {
// //     try {
// //       const totalVotes = await Vote.count({
// //         where: { election_id: electionId }
// //       });

// //       const uniqueVoters = await Vote.count({
// //         where: { election_id: electionId },
// //         distinct: true,
// //         col: 'voter_id'
// //       });

// //       const votesByQuestion = await VoteAnswer.count({
// //         where: { '$vote.election_id$': electionId },
// //         include: [{ model: Vote, as: 'vote' }],
// //         group: ['question_id']
// //       });

// //       return {
// //         total_votes: totalVotes,
// //         unique_voters: uniqueVoters,
// //         votes_by_question: votesByQuestion,
// //         participation_rate: 0 // Would need total eligible voters to calculate
// //       };

// //     } catch (error) {
// //       console.error('Get election statistics service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Update election statuses (cron job)
// //    */
// //   async updateElectionStatuses() {
// //     try {
// //       const now = new Date();

// //       // Activate elections that should start
// //       const activatedCount = await Election.update(
// //         { status: ELECTION_STATUSES.ACTIVE },
// //         {
// //           where: {
// //             status: ELECTION_STATUSES.DRAFT,
// //             start_date: { [Op.lte]: now },
// //             end_date: { [Op.gt]: now }
// //           }
// //         }
// //       );

// //       // Complete elections that have ended
// //       const completedCount = await Election.update(
// //         { status: ELECTION_STATUSES.COMPLETED },
// //         {
// //           where: {
// //             status: ELECTION_STATUSES.ACTIVE,
// //             end_date: { [Op.lte]: now }
// //           }
// //         }
// //       );

// //       console.log(`Election statuses updated: ${activatedCount[0]} activated, ${completedCount[0]} completed`);

// //     } catch (error) {
// //       console.error('Update election statuses service error:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Execute scheduled lotteries (cron job)
// //    */
// //   async executeScheduledLotteries() {
// //     try {
// //       const now = new Date();

// //       // Find lotteries that need to be executed
// //       const lotteriesToExecute = await ElectionLottery.findAll({
// //         where: {
// //           lottery_enabled: true,
// //           lottery_executed: false,
// //           [Op.or]: [
// //             { lottery_trigger_time: { [Op.lte]: now } },
// //             {
// //               auto_trigger_at_election_end: true,
// //               '$election.end_date$': { [Op.lte]: now },
// //               '$election.status$': ELECTION_STATUSES.COMPLETED
// //             }
// //           ]
// //         },
// //         include: [{
// //           model: Election,
// //           as: 'election'
// //         }]
// //       });

// //       for (const lottery of lotteriesToExecute) {
// //         try {
// //           await lotteryService.executeLottery(lottery.election_id);
// //         } catch (error) {
// //           console.error(`Failed to execute lottery for election ${lottery.election_id}:`, error);
// //         }
// //       }

// //       console.log(`Executed ${lotteriesToExecute.length} scheduled lotteries`);

// //     } catch (error) {
// //       console.error('Execute scheduled lotteries service error:', error);
// //       throw error;
// //     }
// //   }

// //   // Helper methods
// //   async generateUniqueCustomUrl(baseUrl) {
// //     const slug = slugify(baseUrl, { lower: true, strict: true });
// //     let finalUrl = slug;
// //     let counter = 1;

// //     // Check if URL already exists
// //     while (await Election.findOne({ where: { custom_voting_url: finalUrl } })) {
// //       finalUrl = `${slug}-${counter}`;
// //       counter++;
// //     }

// //     return finalUrl;
// //   }

// //   async setupContentCreatorIntegration(electionId, transaction) {
// //     // Generate Vottery icon and setup content creator specific configurations
// //     const iconData = await uploadService.generateVotteryIcon(electionId);
    
// //     await Election.update(
// //       { 
// //         vottery_icon_url: iconData.url,
// //         vottery_icon_code: iconData.embeddedCode,
// //         content_creator_stage: 'subscription_icon',
// //         one_time_links_enabled: true
// //       },
// //       { where: { id: electionId }, transaction }
// //     );
// //   }

// //   generateVotingUrl(election) {
// //     const baseUrl = process.env.FRONTEND_URL || 'https://vottery.com';
// //     if (election.custom_voting_url) {
// //       return `${baseUrl}/vote/${election.custom_voting_url}`;
// //     }
// //     return `${baseUrl}/vote/${election.unique_election_id}`;
// //   }

// //   isElectionActive(election) {
// //     const now = new Date();
// //     return election.status === ELECTION_STATUSES.ACTIVE && 
// //            election.start_date <= now && 
// //            election.end_date > now;
// //   }

// //   isElectionExpired(election) {
// //     const now = new Date();
// //     return election.end_date <= now;
// //   }

// //   canEditElection(election, userId) {
// //     if (!userId) return false;
    
// //     // Creator can edit if election is not completed or has no votes
// //     if (election.creator_id === userId) {
// //       return election.status !== ELECTION_STATUSES.COMPLETED;
// //     }
    
// //     return false;
// //   }

// //   canDeleteElection(election, userId) {
// //     if (!userId) return false;
    
// //     // Creator can delete if election is draft or has no votes
// //     if (election.creator_id === userId) {
// //       return election.status === ELECTION_STATUSES.DRAFT;
// //     }
    
// //     return false;
// //   }

// //   async validateCreatorPermissions(creatorId) {
// //     // Validate against user management table
// //     const userPermissions = await sequelize.query(
// //       'SELECT * FROM vottery_user_management WHERE user_id = ?',
// //       {
// //         replacements: [creatorId],
// //         type: sequelize.QueryTypes.SELECT
// //       }
// //     );

// //     if (!userPermissions.length) {
// //       throw new Error('User not found in user management system');
// //     }

// //     const user = userPermissions[0];
    
// //     // Check subscription limits
// //     if (user.subscription_status !== 'active') {
// //       const electionCount = await Election.count({
// //         where: { 
// //           creator_id: creatorId,
// //           status: { [Op.ne]: ELECTION_STATUSES.DELETED }
// //         }
// //       });

// //       const freeLimit = SUBSCRIPTION_LIMITS.FREE_ELECTIONS || 3;
// //       if (electionCount >= freeLimit) {
// //         throw new Error('Free tier election limit reached. Please upgrade your subscription.');
// //       }
// //     }

// //     return user;
// //   }

// //   async validateElectionData(electionData) {
// //     const errors = [];

// //     // Basic validation
// //     if (!electionData.title || electionData.title.trim().length === 0) {
// //       errors.push('Title is required');
// //     }

// //     if (!electionData.start_date) {
// //       errors.push('Start date is required');
// //     }

// //     if (!electionData.end_date) {
// //       errors.push('End date is required');
// //     }

// //     if (new Date(electionData.start_date) >= new Date(electionData.end_date)) {
// //       errors.push('End date must be after start date');
// //     }

// //     // Validate questions
// //     if (!electionData.questions || electionData.questions.length === 0) {
// //       errors.push('At least one question is required');
// //     }

// //     if (electionData.questions) {
// //       electionData.questions.forEach((question, index) => {
// //         if (!question.question_text) {
// //           errors.push(`Question ${index + 1}: Question text is required`);
// //         }

// //         // Validate answers for specific question types
// //         const requiresAnswers = [
// //           QUESTION_TYPES.MULTIPLE_CHOICE,
// //           QUESTION_TYPES.IMAGE_BASED,
// //           QUESTION_TYPES.COMPARISON
// //         ];

// //         if (requiresAnswers.includes(question.question_type)) {
// //           if (!question.answers || question.answers.length < 2) {
// //             errors.push(`Question ${index + 1}: At least 2 answer options are required for this question type`);
// //           }
// //         }
// //       });
// //     }

// //     if (errors.length > 0) {
// //       throw new Error(`Validation errors: ${errors.join(', ')}`);
// //     }

// //     return true;
// //   }

// //   /**
// //    * Export election data and questions
// //    * @param {number} electionId - Election ID
// //    * @param {number} userId - User requesting export
// //    * @param {string} format - Export format (json, csv, pdf)
// //    * @returns {Promise<Object>} Exported data
// //    */
// //   async exportElectionData(electionId, userId, format = 'json') {
// //     try {
// //       const election = await this.getElectionById(electionId, userId);
      
// //       if (!election) {
// //         throw new Error('Election not found');
// //       }

// //       // Check permissions
// //       if (election.creator_id !== userId) {
// //         throw new Error('Insufficient permissions to export this election');
// //       }

// //       switch (format.toLowerCase()) {
// //         case 'json':
// //           return {
// //             format: 'json',
// //             data: election,
// //             filename: `election_${electionId}_${Date.now()}.json`
// //           };

// //         case 'csv':
// //           // Convert to CSV format (simplified)
// //           const csvData = this.convertElectionToCSV(election);
// //           return {
// //             format: 'csv',
// //             data: csvData,
// //             filename: `election_${electionId}_${Date.now()}.csv`
// //           };

// //         default:
// //           throw new Error('Unsupported export format');
// //       }

// //     } catch (error) {
// //       console.error('Export election data service error:', error);
// //       throw error;
// //     }
// //   }

// //   convertElectionToCSV(election) {
// //     // Simplified CSV conversion - can be enhanced
// //     const rows = [];
// //     rows.push(['Field', 'Value']);
// //     rows.push(['Title', election.title]);
// //     rows.push(['Description', election.description]);
// //     rows.push(['Voting Type', election.voting_type]);
// //     rows.push(['Start Date', election.start_date]);
// //     rows.push(['End Date', election.end_date]);
// //     rows.push(['Status', election.status]);
    
// //     // Add questions
// //     election.questions.forEach((question, index) => {
// //       rows.push([`Question ${index + 1}`, question.question_text]);
// //       question.answers.forEach((answer, answerIndex) => {
// //         rows.push([`  Answer ${answerIndex + 1}`, answer.answer_text]);
// //       });
// //     });

// //     return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
// //   }

//   // /**
//   //  * Get public elections (for world citizens access)
//   //  * @param {Object} filters - Filter options
//   //  * @returns {Promise<Object>} Paginated public elections
//   //  */
//   // async getPublicElections(filters = {}) {
//   //   try {
//   //     const {
//   //       voting_type,
//   //       status = ELECTION_STATUSES.ACTIVE,
//   //       page = 1,
//   //       limit = 20,
//   //       search,
//   //       country,
//   //       category,
//   //       sort_by = 'created_at',
//   //       sort_order = 'DESC'
//   //     } = filters;

//   //     const whereClause = {
//   //       status,
//   //       '$access_control.permission_type: PERMISSION_TYPES.WORLD_CITIZENS
//   //     };

//   //     if (voting_type) {
//   //       whereClause.voting_type = voting_type;
//   //     }

//   //     if (search) {
//   //       whereClause[Op.or] = [
//   //         { title: { [Op.iLike]: `%${search}%` } },
//   //         { description: { [Op.iLike]: `%${search}%` } }
//   //       ];
//   //     }

//   //     const offset = (page - 1) * limit;

//   //     const { rows: elections, count: total } = await Election.findAndCountAll({
//   //       where: whereClause,
//   //       include: [
//   //         {
//   //           model: ElectionAccess,
//   //           as: 'access_control',
//   //           where: {
//   //             permission_type: PERMISSION_TYPES.WORLD_CITIZENS
//   //           }
//   //         },
//   //         {
//   //           model: ElectionBranding,
//   //           as: 'branding'
//   //         },
//   //         {
//   //           model: ElectionLottery,
//   //           as: 'lottery'
//   //         }
//   //       ],
//   //       order: [[sort_by, sort_order]],
//   //       limit: parseInt(limit),
//   //       offset: offset
//   //     });

//   //     // Add computed fields
//   //     const electionsWithMeta = elections.map(election => {
//   //       const electionData = election.toJSON();
//   //       electionData.is_active = this.isElectionActive(election);
//   //       electionData.is_expired = this.isElectionExpired(election);
//   //       electionData.voting_url = this.generateVotingUrl(election);
        
//   //       // Remove sensitive creator information for public view
//   //       delete electionData.creator_id;
        
//   //       return electionData;
//   //     });

//   //     return {
//   //       elections: electionsWithMeta,
//   //       pagination: {
//   //         current_page: parseInt(page),
//   //         total_pages: Math.ceil(total / limit),
//   //         total_items: total,
//   //         items_per_page: parseInt(limit)
//   //       }
//   //     };

//   //   } catch (error) {
//   //     console.error('Get public elections service error:', error);
//   //     throw error;
//   //   }
//   // }

//   /**
//    * Get public elections (for world citizens access)
//    * @param {Object} filters - Filter options
//    * @returns {Promise<Object>} Paginated public elections
//    */
//   async getPublicElections(filters = {}) {
//     try {
//       const {
//         voting_type,
//         status = ELECTION_STATUSES.ACTIVE,
//         page = 1,
//         limit = 20,
//         search,
//         country,
//         category,
//         sort_by = 'created_at',
//         sort_order = 'DESC'
//       } = filters;

//       const whereClause = {
//         status
//       };

//       if (voting_type) {
//         whereClause.voting_type = voting_type;
//       }

//       if (search) {
//         whereClause[Op.or] = [
//           { title: { [Op.iLike]: `%${search}%` } },
//           { description: { [Op.iLike]: `%${search}%` } }
//         ];
//       }

//       const offset = (page - 1) * limit;

//       const { rows: elections, count: total } = await Election.findAndCountAll({
//         where: whereClause,
//         include: [
//           {
//             model: ElectionAccess,
//             as: 'access_control',
//             where: {
//               permission_type: PERMISSION_TYPES.WORLD_CITIZENS
//             },
//             required: true
//           },
//           {
//             model: ElectionBranding,
//             as: 'branding',
//             required: false
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery',
//             required: false
//           }
//         ],
//         order: [[sort_by, sort_order]],
//         limit: parseInt(limit),
//         offset: offset
//       });

//       // Add computed fields
//       const electionsWithMeta = elections.map(election => {
//         const electionData = election.toJSON();
//         electionData.is_active = this.isElectionActive(election);
//         electionData.is_expired = this.isElectionExpired(election);
//         electionData.voting_url = this.generateVotingUrl(election);
        
//         // Remove sensitive creator information for public view
//         delete electionData.creator_id;
        
//         return electionData;
//       });

//       return {
//         elections: electionsWithMeta,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       };

//     } catch (error) {
//       console.error('Get public elections service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Toggle election results visibility
//    * @param {number} electionId - Election ID
//    * @param {number} userId - User making the change
//    * @param {boolean} showResults - Whether to show results
//    * @returns {Promise<Object>} Updated election
//    */
//   async toggleResultsVisibility(electionId, userId, showResults) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions
//       if (election.creator_id !== userId) {
//         throw new Error('Insufficient permissions to modify this election');
//       }

//       // Check if results visibility can be changed
//       if (!election.results_visibility_changeable) {
//         throw new Error('Results visibility cannot be changed for this election');
//       }

//       // Only allow changing from hidden to visible, not reverse
//       if (!showResults && election.show_live_results) {
//         throw new Error('Cannot hide results once they have been made visible');
//       }

//       await election.update({
//         show_live_results: showResults
//       });

//       return await this.getElectionById(electionId, userId);

//     } catch (error) {
//       console.error('Toggle results visibility service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Generate one-time voting links for content creators
//    * @param {number} electionId - Election ID
//    * @param {number} userId - Content creator user ID
//    * @param {number} linkCount - Number of links to generate
//    * @returns {Promise<Array>} Array of one-time voting links
//    */
//   async generateOneTimeVotingLinks(electionId, userId, linkCount = 100) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions and content creator status
//       if (election.creator_id !== userId || !election.is_content_creator_election) {
//         throw new Error('Insufficient permissions or not a content creator election');
//       }

//       const links = [];
//       const baseUrl = this.generateVotingUrl(election);

//       for (let i = 0; i < linkCount; i++) {
//         const uniqueToken = uuidv4();
//         const oneTimeLink = `${baseUrl}?token=${uniqueToken}&single_use=true`;
        
//         links.push({
//           token: uniqueToken,
//           url: oneTimeLink,
//           used: false,
//           created_at: new Date()
//         });
//       }

//       // Store tokens in database for validation
//       await sequelize.query(
//         `INSERT INTO vottery_election_2_one_time_tokens (election_id, token, used, created_at) VALUES ${links.map(() => '(?, ?, ?, ?)').join(', ')}`,
//         {
//           replacements: links.flatMap(link => [electionId, link.token, link.used, link.created_at]),
//           type: sequelize.QueryTypes.INSERT
//         }
//       );

//       return links.map(link => ({
//         url: link.url,
//         token: link.token
//       }));

//     } catch (error) {
//       console.error('Generate one-time voting links service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Validate one-time voting token
//    * @param {string} token - One-time token
//    * @returns {Promise<Object>} Token validation result
//    */
//   async validateOneTimeToken(token) {
//     try {
//       const tokenRecord = await sequelize.query(
//         'SELECT * FROM vottery_election_2_one_time_tokens WHERE token = ? AND used = false',
//         {
//           replacements: [token],
//           type: sequelize.QueryTypes.SELECT
//         }
//       );

//       if (!tokenRecord.length) {
//         return { valid: false, message: 'Invalid or expired token' };
//       }

//       const tokenData = tokenRecord[0];
      
//       // Check token expiration (24 hours default)
//       const tokenAge = Date.now() - new Date(tokenData.created_at).getTime();
//       const maxAge = 24 * 60 * 60 * 1000; // 24 hours

//       if (tokenAge > maxAge) {
//         return { valid: false, message: 'Token has expired' };
//       }

//       return { 
//         valid: true, 
//         election_id: tokenData.election_id,
//         token: tokenData.token
//       };

//     } catch (error) {
//       console.error('Validate one-time token service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Mark one-time token as used
//    * @param {string} token - Token to mark as used
//    * @returns {Promise<boolean>} Success status
//    */
//   async markTokenAsUsed(token) {
//     try {
//       await sequelize.query(
//         'UPDATE vottery_election_2_one_time_tokens SET used = true, used_at = NOW() WHERE token = ?',
//         {
//           replacements: [token],
//           type: sequelize.QueryTypes.UPDATE
//         }
//       );

//       return true;

//     } catch (error) {
//       console.error('Mark token as used service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get content creator election analytics
//    * @param {number} electionId - Election ID
//    * @param {number} userId - Creator user ID
//    * @returns {Promise<Object>} Analytics data
//    */
//   async getContentCreatorAnalytics(electionId, userId) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       if (election.creator_id !== userId || !election.is_content_creator_election) {
//         throw new Error('Insufficient permissions or not a content creator election');
//       }

//       // Get token usage statistics
//       const tokenStats = await sequelize.query(
//         `SELECT 
//           COUNT(*) as total_tokens,
//           COUNT(CASE WHEN used = true THEN 1 END) as used_tokens,
//           COUNT(CASE WHEN used = false THEN 1 END) as available_tokens
//         FROM vottery_election_2_one_time_tokens WHERE election_id = ?`,
//         {
//           replacements: [electionId],
//           type: sequelize.QueryTypes.SELECT
//         }
//       );

//       // Get voting statistics
//       const voteStats = await this.getElectionStatistics(electionId);

//       // Get projected vs actual revenue (if applicable)
//       const revenueStats = {
//         projected_revenue: election.projected_revenue_amount || 0,
//         actual_revenue: 0, // Would be calculated from actual content performance
//         revenue_share_distributed: 0 // Would track actual prize distributions
//       };

//       return {
//         token_statistics: tokenStats[0] || { total_tokens: 0, used_tokens: 0, available_tokens: 0 },
//         voting_statistics: voteStats,
//         revenue_statistics: revenueStats,
//         election_performance: {
//           engagement_rate: tokenStats[0] ? (tokenStats[0].used_tokens / tokenStats[0].total_tokens * 100) : 0,
//           conversion_rate: 0 // Would calculate based on views to votes
//         }
//       };

//     } catch (error) {
//       console.error('Get content creator analytics service error:', error);
//       throw error;
//     }
//   }
// }

// export const electionService = new ElectionService();
// export default electionService;
// import { 
//   Election, 
//   Question, 
//   Answer, 
//   ElectionAccess, 
//   ElectionBranding, 
//   ElectionLottery, 
//   ElectionSecurity,
//   Vote,
//   VoteAnswer,
//   sequelize 
// } from '../models/index.js';
// import { uploadService } from './uploadService.js';
// import { securityService } from './securityService.js';
// import { lotteryService } from './lotteryService.js';
// import { notificationService } from './notificationService.js';
// import { validationService } from './validationService.js';
// import slugify from 'slugify';
// import { v4 as uuidv4 } from 'uuid';
// import { Op } from 'sequelize';
// import { 
//   ELECTION_STATUSES, 
//   VOTING_TYPES, 
//   AUTHENTICATION_METHODS,
//   SUBSCRIPTION_LIMITS,
//   QUESTION_TYPES,
//   PRIZE_TYPES,
//   PERMISSION_TYPES,
//   PRICING_TYPES
// } from '../config/constants.js';

// class ElectionService {
//   /**
//    * Create new election with all related components
//    * @param {number} creatorId - ID of the election creator
//    * @param {Object} electionData - Complete election data
//    * @returns {Promise<Object>} Created election with all relationships
//    */
//   async createElection(creatorId, electionData) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       // Validate creator permissions
//       await this.validateCreatorPermissions(creatorId);

//       // Extract nested data
//       const {
//         // Basic election data
//         title,
//         description,
//         voting_body_content,
//         start_date,
//         end_date,
//         timezone = 'UTC',
//         voting_type = VOTING_TYPES.PLURALITY,
//         authentication_method = AUTHENTICATION_METHODS.PASSKEY,
//         biometric_required = false,
        
//         // Images/Videos
//         topic_image,
//         topic_video,
        
//         // Custom URL
//         custom_voting_url,
        
//         // Content creator specific
//         is_content_creator_election = false,
//         projected_revenue_amount,
        
//         // Multi-language
//         supported_languages = ['en'],
//         translated_content = {},
        
//         // Settings
//         allow_vote_editing = false,
//         show_live_results = false,
//         results_visibility_changeable = true,
        
//         // Nested components
//         questions = [],
//         access_control = {},
//         branding = {},
//         lottery = {},
//         security = {}
//       } = electionData;

//       // Validate election data
//       await this.validateElectionData(electionData);

//       // Generate unique identifiers
//       const uniqueElectionId = uuidv4();
//       let customUrl = null;
      
//       if (custom_voting_url) {
//         customUrl = await this.generateUniqueCustomUrl(custom_voting_url);
//       }

//       // Upload images/videos if provided
//       let topicImageUrl = null;
//       let topicVideoUrl = null;
      
//       if (topic_image) {
//         topicImageUrl = await uploadService.uploadImage(topic_image, 'elections');
//       }
      
//       if (topic_video) {
//         topicVideoUrl = await uploadService.uploadVideo(topic_video, 'elections');
//       }

//       // Create main election record
//       const election = await Election.create({
//         creator_id: creatorId,
//         title,
//         description,
//         voting_body_content,
//         start_date: new Date(start_date),
//         end_date: new Date(end_date),
//         timezone,
//         voting_type,
//         authentication_method,
//         biometric_required,
//         topic_image_url: topicImageUrl,
//         topic_video_url: topicVideoUrl,
//         custom_voting_url: customUrl,
//         unique_election_id: uniqueElectionId,
//         is_content_creator_election,
//         projected_revenue_amount,
//         supported_languages,
//         translated_content,
//         allow_vote_editing,
//         show_live_results,
//         results_visibility_changeable,
//         status: ELECTION_STATUSES.DRAFT
//       }, { transaction });

//       // Create access control settings
//       const accessControlData = {
//         election_id: election.id,
//         permission_type: access_control.permission_type || PERMISSION_TYPES.WORLD_CITIZENS,
//         pricing_type: access_control.pricing_type || PRICING_TYPES.FREE,
//         general_fee: access_control.general_fee || 0,
//         regional_fees: access_control.regional_fees || {},
//         processing_fee_percentage: access_control.processing_fee_percentage || 0,
//         allowed_countries: access_control.allowed_countries || [],
//         blocked_countries: access_control.blocked_countries || [],
//         allowed_organizations: access_control.allowed_organizations || [],
//         max_participants: access_control.max_participants,
//         min_age: access_control.min_age,
//         max_age: access_control.max_age,
//         require_verification: access_control.require_verification || false,
//         whitelist_emails: access_control.whitelist_emails || [],
//         blacklist_emails: access_control.blacklist_emails || []
//       };

//       await ElectionAccess.create(accessControlData, { transaction });

//       // Create branding settings
//       const brandingData = {
//         election_id: election.id,
//         primary_color: branding.primary_color || '#007bff',
//         secondary_color: branding.secondary_color || '#6c757d',
//         background_color: branding.background_color || '#ffffff',
//         text_color: branding.text_color || '#212529',
//         font_family: branding.font_family || 'Inter, system-ui, sans-serif',
//         corporate_style_enabled: branding.corporate_style_enabled || false,
//         white_label_enabled: branding.white_label_enabled || false,
//         custom_css: branding.custom_css || '',
//         content_creator_branding: branding.content_creator_branding || { enabled: false },
//         button_style: branding.button_style || 'default',
//         layout_style: branding.layout_style || 'default'
//       };

//       // Upload branding images if provided
//       if (branding.logo_image) {
//         brandingData.logo_url = await uploadService.uploadImage(branding.logo_image, 'branding');
//       }
//       if (branding.background_image) {
//         brandingData.background_image_url = await uploadService.uploadImage(branding.background_image, 'branding');
//       }

//       await ElectionBranding.create(brandingData, { transaction });

//       // Create lottery settings
//       const lotteryData = {
//         election_id: election.id,
//         lottery_enabled: lottery.lottery_enabled || false,
//         prize_type: lottery.prize_type || PRIZE_TYPES.MONETARY,
//         monetary_amount: lottery.monetary_amount || 0,
//         monetary_currency: lottery.monetary_currency || 'USD',
//         non_monetary_description: lottery.non_monetary_description,
//         projected_revenue_amount: lottery.projected_revenue_amount || projected_revenue_amount,
//         projected_revenue_percentage: lottery.projected_revenue_percentage || 100,
//         winner_count: lottery.winner_count || 1,
//         prize_distribution: lottery.prize_distribution || [{ rank: 1, percentage: 100 }],
//         auto_trigger_at_election_end: lottery.auto_trigger_at_election_end !== false,
//         lottery_trigger_time: lottery.lottery_trigger_time,
//         sponsor_funded: lottery.sponsor_funded || false,
//         sponsor_id: lottery.sponsor_id,
//         prize_pool_visibility: lottery.prize_pool_visibility !== false
//       };

//       await ElectionLottery.create(lotteryData, { transaction });

//       // Create security settings
//       const securityData = {
//         election_id: election.id,
//         encryption_enabled: security.encryption_enabled !== false,
//         digital_signatures_enabled: security.digital_signatures_enabled !== false,
//         audit_trail_enabled: security.audit_trail_enabled !== false,
//         biometric_required,
//         authentication_methods: security.authentication_methods || [authentication_method],
//         anonymous_voting: security.anonymous_voting !== false,
//         tamper_detection_enabled: security.tamper_detection_enabled !== false,
//         ip_restriction_enabled: security.ip_restriction_enabled || false,
//         allowed_ip_ranges: security.allowed_ip_ranges || [],
//         rate_limiting_enabled: security.rate_limiting_enabled !== false,
//         max_votes_per_ip: security.max_votes_per_ip || 1,
//         fraud_detection_enabled: security.fraud_detection_enabled !== false
//       };

//       await ElectionSecurity.create(securityData, { transaction });

//       // Create questions if provided
//       for (let i = 0; i < questions.length; i++) {
//         const questionData = questions[i];
        
//         // Upload question image if provided
//         let questionImageUrl = null;
//         if (questionData.question_image) {
//           questionImageUrl = await uploadService.uploadImage(questionData.question_image, 'questions');
//         }

//         const question = await Question.create({
//           election_id: election.id,
//           question_text: questionData.question_text,
//           question_type: questionData.question_type,
//           question_order: i + 1,
//           is_required: questionData.is_required !== false,
//           min_selections: questionData.min_selections || 1,
//           max_selections: questionData.max_selections || (questionData.question_type === QUESTION_TYPES.APPROVAL ? 999 : 1),
//           text_min_length: questionData.text_min_length || 1,
//           text_max_length: questionData.text_max_length || 5000,
//           question_image_url: questionImageUrl,
//           question_description: questionData.question_description,
//           comparison_items: questionData.comparison_items || [],
//           plurality_config: questionData.plurality_config || {},
//           ranked_choice_config: questionData.ranked_choice_config || {},
//           approval_config: questionData.approval_config || {},
//           translated_questions: questionData.translated_questions || {},
//           randomize_answers: questionData.randomize_answers || false,
//           allow_other_option: questionData.allow_other_option || false,
//           weight: questionData.weight || 1.0
//         }, { transaction });

//         // Create answers if provided (required for MCQ, Image, and Comparison questions)
//         if (questionData.answers && questionData.answers.length > 0) {
//           for (let j = 0; j < questionData.answers.length; j++) {
//             const answerData = questionData.answers[j];
            
//             let answerImageUrl = null;
//             if (answerData.answer_image) {
//               answerImageUrl = await uploadService.uploadImage(answerData.answer_image, 'answers');
//             }

//             await Answer.create({
//               question_id: question.id,
//               answer_text: answerData.answer_text,
//               answer_image_url: answerImageUrl,
//               answer_order: j + 1,
//               comparison_item_id: answerData.comparison_item_id,
//               comparison_attributes: answerData.comparison_attributes || {},
//               image_description: answerData.image_description,
//               image_alt_text: answerData.image_alt_text,
//               translated_answers: answerData.translated_answers || {},
//               weight: answerData.weight || 1.0,
//               is_correct: answerData.is_correct || false,
//               additional_data: answerData.additional_data || {}
//             }, { transaction });
//           }
//         }
//       }

//       // Generate content creator integration if enabled
//       if (is_content_creator_election) {
//         await this.setupContentCreatorIntegration(election.id, transaction);
//       }

//       // Initialize security components
//       await securityService.initializeElectionSecurity(election.id, securityData, transaction);

//       await transaction.commit();

//       // Send notifications
//       await notificationService.sendElectionCreatedNotification(creatorId, election.id);

//       // Return complete election with all relationships
//       return await this.getElectionById(election.id, creatorId);

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Create election service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get election by ID with all relationships
//    * @param {number} electionId - Election ID
//    * @param {number} userId - Current user ID (optional)
//    * @returns {Promise<Object>} Complete election data
//    */
//   async getElectionById(electionId, userId = null) {
//     try {
//       const election = await Election.findByPk(electionId, {
//         include: [
//           {
//             model: Question,
//             as: 'questions',
//             include: [
//               {
//                 model: Answer,
//                 as: 'answers',
//                 order: [['answer_order', 'ASC']]
//               }
//             ],
//             order: [['question_order', 'ASC']]
//           },
//           {
//             model: ElectionAccess,
//             as: 'access_control'
//           },
//           {
//             model: ElectionBranding,
//             as: 'branding'
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery'
//           },
//           {
//             model: ElectionSecurity,
//             as: 'security_config'
//           }
//         ]
//       });

//       if (!election) {
//         return null;
//       }

//       // Add computed fields
//       const electionData = election.toJSON();
//       electionData.is_active = this.isElectionActive(election);
//       electionData.is_expired = this.isElectionExpired(election);
//       electionData.can_edit = this.canEditElection(election, userId);
//       electionData.can_delete = this.canDeleteElection(election, userId);
//       electionData.is_creator = userId ? election.creator_id === userId : false;
//       electionData.voting_url = this.generateVotingUrl(election);

//       // Get vote statistics if needed
//       if (userId && election.creator_id === userId) {
//         electionData.vote_statistics = await this.getElectionStatistics(electionId);
//       }

//       return electionData;

//     } catch (error) {
//       console.error('Get election by ID service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update an existing election
//    * @param {number} electionId - Election ID
//    * @param {number} userId - User ID making the update
//    * @param {Object} updateData - Data to update
//    * @returns {Promise<Object>} Updated election
//    */
//   async updateElection(electionId, userId, updateData) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions
//       if (!this.canEditElection(election, userId)) {
//         throw new Error('Insufficient permissions to edit this election');
//       }

//       // Extract update data
//       const {
//         questions,
//         access_control,
//         branding,
//         lottery,
//         security,
//         ...electionUpdates
//       } = updateData;

//       // Update main election record
//       await election.update(electionUpdates, { transaction });

//       // Update related records if provided
//       if (access_control) {
//         await ElectionAccess.update(access_control, {
//           where: { election_id: electionId },
//           transaction
//         });
//       }

//       if (branding) {
//         // Handle image uploads
//         if (branding.logo_image) {
//           branding.logo_url = await uploadService.uploadImage(branding.logo_image, 'branding');
//           delete branding.logo_image;
//         }
        
//         await ElectionBranding.update(branding, {
//           where: { election_id: electionId },
//           transaction
//         });
//       }

//       if (lottery) {
//         await ElectionLottery.update(lottery, {
//           where: { election_id: electionId },
//           transaction
//         });
//       }

//       if (security) {
//         await ElectionSecurity.update(security, {
//           where: { election_id: electionId },
//           transaction
//         });
//       }

//       // Update questions if provided (this is complex, might need separate endpoint)
//       if (questions) {
//         // Note: Question updates are complex and might be better handled separately
//         // This is a simplified version
//         for (const questionUpdate of questions) {
//           if (questionUpdate.id) {
//             await Question.update(questionUpdate, {
//               where: { id: questionUpdate.id, election_id: electionId },
//               transaction
//             });
//           }
//         }
//       }

//       await transaction.commit();

//       return await this.getElectionById(electionId, userId);

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Update election service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete an election
//    * @param {number} electionId - Election ID
//    * @param {number} userId - User ID making the deletion
//    * @returns {Promise<boolean>} Success status
//    */
//   async deleteElection(electionId, userId) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions
//       if (!this.canDeleteElection(election, userId)) {
//         throw new Error('Insufficient permissions to delete this election');
//       }

//       // Check if election has votes
//       const voteCount = await Vote.count({
//         where: { election_id: electionId }
//       });

//       if (voteCount > 0 && election.status === ELECTION_STATUSES.ACTIVE) {
//         throw new Error('Cannot delete active election with existing votes');
//       }

//       // Soft delete or hard delete based on vote count
//       if (voteCount > 0) {
//         await election.update({ 
//           status: ELECTION_STATUSES.DELETED,
//           deleted_at: new Date()
//         }, { transaction });
//       } else {
//         // Hard delete if no votes
//         await election.destroy({ transaction });
//       }

//       await transaction.commit();
//       return true;

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Delete election service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get elections by creator with filters
//    * @param {number} creatorId - Creator user ID
//    * @param {Object} filters - Filter options
//    * @returns {Promise<Object>} Paginated elections list
//    */
//   async getElectionsByCreator(creatorId, filters = {}) {
//     try {
//       const {
//         status,
//         voting_type,
//         page = 1,
//         limit = 10,
//         search,
//         sort_by = 'created_at',
//         sort_order = 'DESC'
//       } = filters;

//       const whereClause = {
//         creator_id: creatorId,
//         status: { [Op.ne]: ELECTION_STATUSES.DELETED }
//       };

//       if (status) {
//         whereClause.status = status;
//       }

//       if (voting_type) {
//         whereClause.voting_type = voting_type;
//       }

//       if (search) {
//         whereClause[Op.or] = [
//           { title: { [Op.iLike]: `%${search}%` } },
//           { description: { [Op.iLike]: `%${search}%` } }
//         ];
//       }

//       const offset = (page - 1) * limit;

//       const { rows: elections, count: total } = await Election.findAndCountAll({
//         where: whereClause,
//         include: [
//           {
//             model: ElectionAccess,
//             as: 'access_control'
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery'
//           }
//         ],
//         order: [[sort_by, sort_order]],
//         limit: parseInt(limit),
//         offset: offset
//       });

//       // Add computed fields
//       const electionsWithMeta = elections.map(election => {
//         const electionData = election.toJSON();
//         electionData.is_active = this.isElectionActive(election);
//         electionData.is_expired = this.isElectionExpired(election);
//         electionData.voting_url = this.generateVotingUrl(election);
//         return electionData;
//       });

//       return {
//         elections: electionsWithMeta,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       };

//     } catch (error) {
//       console.error('Get elections by creator service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Clone/copy an existing election
//    * @param {number} electionId - Original election ID
//    * @param {number} userId - User ID making the clone
//    * @param {Object} modifications - Modifications to apply
//    * @returns {Promise<Object>} Cloned election
//    */
//   async cloneElection(electionId, userId, modifications = {}) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       // Get original election with all relationships
//       const originalElection = await this.getElectionById(electionId, userId);
      
//       if (!originalElection) {
//         throw new Error('Original election not found');
//       }

//       // Check permissions (can clone own elections or public elections)
//       if (originalElection.creator_id !== userId && originalElection.access_control.permission_type !== PERMISSION_TYPES.WORLD_CITIZENS) {
//         throw new Error('Insufficient permissions to clone this election');
//       }

//       // Prepare cloned data
//       const cloneData = {
//         ...originalElection,
//         ...modifications,
//         title: modifications.title || `${originalElection.title} (Copy)`,
//         status: ELECTION_STATUSES.DRAFT,
//         unique_election_id: uuidv4(),
//         custom_voting_url: null, // Will be regenerated if needed
//         created_at: undefined,
//         updated_at: undefined,
//         id: undefined
//       };

//       // Create the cloned election
//       const clonedElection = await this.createElection(userId, cloneData);

//       await transaction.commit();
//       return clonedElection;

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Clone election service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get election statistics
//    * @param {number} electionId - Election ID
//    * @returns {Promise<Object>} Election statistics
//    */
//   async getElectionStatistics(electionId) {
//     try {
//       const totalVotes = await Vote.count({
//         where: { election_id: electionId }
//       });

//       const uniqueVoters = await Vote.count({
//         where: { election_id: electionId },
//         distinct: true,
//         col: 'voter_id'
//       });

//       const votesByQuestion = await VoteAnswer.count({
//         where: { '$vote.election_id$': electionId },
//         include: [{ model: Vote, as: 'vote' }],
//         group: ['question_id']
//       });

//       return {
//         total_votes: totalVotes,
//         unique_voters: uniqueVoters,
//         votes_by_question: votesByQuestion,
//         participation_rate: 0 // Would need total eligible voters to calculate
//       };

//     } catch (error) {
//       console.error('Get election statistics service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update election statuses (cron job)
//    */
//   async updateElectionStatuses() {
//     try {
//       const now = new Date();

//       // Activate elections that should start
//       const activatedCount = await Election.update(
//         { status: ELECTION_STATUSES.ACTIVE },
//         {
//           where: {
//             status: ELECTION_STATUSES.DRAFT,
//             start_date: { [Op.lte]: now },
//             end_date: { [Op.gt]: now }
//           }
//         }
//       );

//       // Complete elections that have ended
//       const completedCount = await Election.update(
//         { status: ELECTION_STATUSES.COMPLETED },
//         {
//           where: {
//             status: ELECTION_STATUSES.ACTIVE,
//             end_date: { [Op.lte]: now }
//           }
//         }
//       );

//       console.log(`Election statuses updated: ${activatedCount[0]} activated, ${completedCount[0]} completed`);

//     } catch (error) {
//       console.error('Update election statuses service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Execute scheduled lotteries (cron job)
//    */
//   async executeScheduledLotteries() {
//     try {
//       const now = new Date();

//       // Find lotteries that need to be executed
//       const lotteriesToExecute = await ElectionLottery.findAll({
//         where: {
//           lottery_enabled: true,
//           lottery_executed: false,
//           [Op.or]: [
//             { lottery_trigger_time: { [Op.lte]: now } },
//             {
//               auto_trigger_at_election_end: true,
//               '$election.end_date$': { [Op.lte]: now },
//               '$election.status$': ELECTION_STATUSES.COMPLETED
//             }
//           ]
//         },
//         include: [{
//           model: Election,
//           as: 'election'
//         }]
//       });

//       for (const lottery of lotteriesToExecute) {
//         try {
//           await lotteryService.executeLottery(lottery.election_id);
//         } catch (error) {
//           console.error(`Failed to execute lottery for election ${lottery.election_id}:`, error);
//         }
//       }

//       console.log(`Executed ${lotteriesToExecute.length} scheduled lotteries`);

//     } catch (error) {
//       console.error('Execute scheduled lotteries service error:', error);
//       throw error;
//     }
//   }

//   // Helper methods
//   async generateUniqueCustomUrl(baseUrl) {
//     const slug = slugify(baseUrl, { lower: true, strict: true });
//     let finalUrl = slug;
//     let counter = 1;

//     // Check if URL already exists
//     while (await Election.findOne({ where: { custom_voting_url: finalUrl } })) {
//       finalUrl = `${slug}-${counter}`;
//       counter++;
//     }

//     return finalUrl;
//   }

//   async setupContentCreatorIntegration(electionId, transaction) {
//     // Generate Vottery icon and setup content creator specific configurations
//     const iconData = await uploadService.generateVotteryIcon(electionId);
    
//     await Election.update(
//       { 
//         vottery_icon_url: iconData.url,
//         vottery_icon_code: iconData.embeddedCode,
//         content_creator_stage: 'subscription_icon',
//         one_time_links_enabled: true
//       },
//       { where: { id: electionId }, transaction }
//     );
//   }

//   generateVotingUrl(election) {
//     const baseUrl = process.env.FRONTEND_URL || 'https://vottery.com';
//     if (election.custom_voting_url) {
//       return `${baseUrl}/vote/${election.custom_voting_url}`;
//     }
//     return `${baseUrl}/vote/${election.unique_election_id}`;
//   }

//   isElectionActive(election) {
//     const now = new Date();
//     return election.status === ELECTION_STATUSES.ACTIVE && 
//            election.start_date <= now && 
//            election.end_date > now;
//   }

//   isElectionExpired(election) {
//     const now = new Date();
//     return election.end_date <= now;
//   }

//   canEditElection(election, userId) {
//     if (!userId) return false;
    
//     // Creator can edit if election is not completed or has no votes
//     if (election.creator_id === userId) {
//       return election.status !== ELECTION_STATUSES.COMPLETED;
//     }
    
//     return false;
//   }

//   canDeleteElection(election, userId) {
//     if (!userId) return false;
    
//     // Creator can delete if election is draft or has no votes
//     if (election.creator_id === userId) {
//       return election.status === ELECTION_STATUSES.DRAFT;
//     }
    
//     return false;
//   }

//   async validateCreatorPermissions(creatorId) {
//     // Validate against user management table
//     const userPermissions = await sequelize.query(
//       'SELECT * FROM vottery_user_management WHERE user_id = ?',
//       {
//         replacements: [creatorId],
//         type: sequelize.QueryTypes.SELECT
//       }
//     );

//     if (!userPermissions.length) {
//       throw new Error('User not found in user management system');
//     }

//     const user = userPermissions[0];
    
//     // Check subscription limits
//     if (user.subscription_status !== 'active') {
//       const electionCount = await Election.count({
//         where: { 
//           creator_id: creatorId,
//           status: { [Op.ne]: ELECTION_STATUSES.DELETED }
//         }
//       });

//       const freeLimit = SUBSCRIPTION_LIMITS.FREE_ELECTIONS || 3;
//       if (electionCount >= freeLimit) {
//         throw new Error('Free tier election limit reached. Please upgrade your subscription.');
//       }
//     }

//     return user;
//   }

//   async validateElectionData(electionData) {
//     const errors = [];

//     // Basic validation
//     if (!electionData.title || electionData.title.trim().length === 0) {
//       errors.push('Title is required');
//     }

//     if (!electionData.start_date) {
//       errors.push('Start date is required');
//     }

//     if (!electionData.end_date) {
//       errors.push('End date is required');
//     }

//     if (new Date(electionData.start_date) >= new Date(electionData.end_date)) {
//       errors.push('End date must be after start date');
//     }

//     // Validate questions
//     if (!electionData.questions || electionData.questions.length === 0) {
//       errors.push('At least one question is required');
//     }

//     if (electionData.questions) {
//       electionData.questions.forEach((question, index) => {
//         if (!question.question_text) {
//           errors.push(`Question ${index + 1}: Question text is required`);
//         }

//         // Validate answers for specific question types
//         const requiresAnswers = [
//           QUESTION_TYPES.MULTIPLE_CHOICE,
//           QUESTION_TYPES.IMAGE_BASED,
//           QUESTION_TYPES.COMPARISON
//         ];

//         if (requiresAnswers.includes(question.question_type)) {
//           if (!question.answers || question.answers.length < 2) {
//             errors.push(`Question ${index + 1}: At least 2 answer options are required for this question type`);
//           }
//         }
//       });
//     }

//     if (errors.length > 0) {
//       throw new Error(`Validation errors: ${errors.join(', ')}`);
//     }

//     return true;
//   }

//   /**
//    * Export election data and questions
//    * @param {number} electionId - Election ID
//    * @param {number} userId - User requesting export
//    * @param {string} format - Export format (json, csv, pdf)
//    * @returns {Promise<Object>} Exported data
//    */
//   async exportElectionData(electionId, userId, format = 'json') {
//     try {
//       const election = await this.getElectionById(electionId, userId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions
//       if (election.creator_id !== userId) {
//         throw new Error('Insufficient permissions to export this election');
//       }

//       switch (format.toLowerCase()) {
//         case 'json':
//           return {
//             format: 'json',
//             data: election,
//             filename: `election_${electionId}_${Date.now()}.json`
//           };

//         case 'csv':
//           // Convert to CSV format (simplified)
//           const csvData = this.convertElectionToCSV(election);
//           return {
//             format: 'csv',
//             data: csvData,
//             filename: `election_${electionId}_${Date.now()}.csv`
//           };

//         default:
//           throw new Error('Unsupported export format');
//       }

//     } catch (error) {
//       console.error('Export election data service error:', error);
//       throw error;
//     }
//   }

//   convertElectionToCSV(election) {
//     // Simplified CSV conversion - can be enhanced
//     const rows = [];
//     rows.push(['Field', 'Value']);
//     rows.push(['Title', election.title]);
//     rows.push(['Description', election.description]);
//     rows.push(['Voting Type', election.voting_type]);
//     rows.push(['Start Date', election.start_date]);
//     rows.push(['End Date', election.end_date]);
//     rows.push(['Status', election.status]);
    
//     // Add questions
//     election.questions.forEach((question, index) => {
//       rows.push([`Question ${index + 1}`, question.question_text]);
//       question.answers.forEach((answer, answerIndex) => {
//         rows.push([`  Answer ${answerIndex + 1}`, answer.answer_text]);
//       });
//     });

//     return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
//   }

//   /**
//    * Get public elections (for world citizens access)
//    * @param {Object} filters - Filter options
//    * @returns {Promise<Object>} Paginated public elections
//    */
//   async getPublicElections(filters = {}) {
//     try {
//       const {
//         voting_type,
//         status = ELECTION_STATUSES.ACTIVE,
//         page = 1,
//         limit = 20,
//         search,
//         country,
//         category,
//         sort_by = 'created_at',
//         sort_order = 'DESC'
//       } = filters;

//       const whereClause = {
//         status,
//         '$access_control.permission_type: PERMISSION_TYPES.WORLD_CITIZENS
//       };

//       if (voting_type) {
//         whereClause.voting_type = voting_type;
//       }

//       if (search) {
//         whereClause[Op.or] = [
//           { title: { [Op.iLike]: `%${search}%` } },
//           { description: { [Op.iLike]: `%${search}%` } }
//         ];
//       }

//       const offset = (page - 1) * limit;

//       const { rows: elections, count: total } = await Election.findAndCountAll({
//         where: whereClause,
//         include: [
//           {
//             model: ElectionAccess,
//             as: 'access_control',
//             where: {
//               permission_type: PERMISSION_TYPES.WORLD_CITIZENS
//             }
//           },
//           {
//             model: ElectionBranding,
//             as: 'branding'
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery'
//           }
//         ],
//         order: [[sort_by, sort_order]],
//         limit: parseInt(limit),
//         offset: offset
//       });

//       // Add computed fields
//       const electionsWithMeta = elections.map(election => {
//         const electionData = election.toJSON();
//         electionData.is_active = this.isElectionActive(election);
//         electionData.is_expired = this.isElectionExpired(election);
//         electionData.voting_url = this.generateVotingUrl(election);
        
//         // Remove sensitive creator information for public view
//         delete electionData.creator_id;
        
//         return electionData;
//       });

//       return {
//         elections: electionsWithMeta,
//         pagination: {
//           current_page: parseInt(page),
//           total_pages: Math.ceil(total / limit),
//           total_items: total,
//           items_per_page: parseInt(limit)
//         }
//       };

//     } catch (error) {
//       console.error('Get public elections service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Toggle election results visibility
//    * @param {number} electionId - Election ID
//    * @param {number} userId - User making the change
//    * @param {boolean} showResults - Whether to show results
//    * @returns {Promise<Object>} Updated election
//    */
//   async toggleResultsVisibility(electionId, userId, showResults) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions
//       if (election.creator_id !== userId) {
//         throw new Error('Insufficient permissions to modify this election');
//       }

//       // Check if results visibility can be changed
//       if (!election.results_visibility_changeable) {
//         throw new Error('Results visibility cannot be changed for this election');
//       }

//       // Only allow changing from hidden to visible, not reverse
//       if (!showResults && election.show_live_results) {
//         throw new Error('Cannot hide results once they have been made visible');
//       }

//       await election.update({
//         show_live_results: showResults
//       });

//       return await this.getElectionById(electionId, userId);

//     } catch (error) {
//       console.error('Toggle results visibility service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Generate one-time voting links for content creators
//    * @param {number} electionId - Election ID
//    * @param {number} userId - Content creator user ID
//    * @param {number} linkCount - Number of links to generate
//    * @returns {Promise<Array>} Array of one-time voting links
//    */
//   async generateOneTimeVotingLinks(electionId, userId, linkCount = 100) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Check permissions and content creator status
//       if (election.creator_id !== userId || !election.is_content_creator_election) {
//         throw new Error('Insufficient permissions or not a content creator election');
//       }

//       const links = [];
//       const baseUrl = this.generateVotingUrl(election);

//       for (let i = 0; i < linkCount; i++) {
//         const uniqueToken = uuidv4();
//         const oneTimeLink = `${baseUrl}?token=${uniqueToken}&single_use=true`;
        
//         links.push({
//           token: uniqueToken,
//           url: oneTimeLink,
//           used: false,
//           created_at: new Date()
//         });
//       }

//       // Store tokens in database for validation
//       await sequelize.query(
//         `INSERT INTO vottery_election_2_one_time_tokens (election_id, token, used, created_at) VALUES ${links.map(() => '(?, ?, ?, ?)').join(', ')}`,
//         {
//           replacements: links.flatMap(link => [electionId, link.token, link.used, link.created_at]),
//           type: sequelize.QueryTypes.INSERT
//         }
//       );

//       return links.map(link => ({
//         url: link.url,
//         token: link.token
//       }));

//     } catch (error) {
//       console.error('Generate one-time voting links service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Validate one-time voting token
//    * @param {string} token - One-time token
//    * @returns {Promise<Object>} Token validation result
//    */
//   async validateOneTimeToken(token) {
//     try {
//       const tokenRecord = await sequelize.query(
//         'SELECT * FROM vottery_election_2_one_time_tokens WHERE token = ? AND used = false',
//         {
//           replacements: [token],
//           type: sequelize.QueryTypes.SELECT
//         }
//       );

//       if (!tokenRecord.length) {
//         return { valid: false, message: 'Invalid or expired token' };
//       }

//       const tokenData = tokenRecord[0];
      
//       // Check token expiration (24 hours default)
//       const tokenAge = Date.now() - new Date(tokenData.created_at).getTime();
//       const maxAge = 24 * 60 * 60 * 1000; // 24 hours

//       if (tokenAge > maxAge) {
//         return { valid: false, message: 'Token has expired' };
//       }

//       return { 
//         valid: true, 
//         election_id: tokenData.election_id,
//         token: tokenData.token
//       };

//     } catch (error) {
//       console.error('Validate one-time token service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Mark one-time token as used
//    * @param {string} token - Token to mark as used
//    * @returns {Promise<boolean>} Success status
//    */
//   async markTokenAsUsed(token) {
//     try {
//       await sequelize.query(
//         'UPDATE vottery_election_2_one_time_tokens SET used = true, used_at = NOW() WHERE token = ?',
//         {
//           replacements: [token],
//           type: sequelize.QueryTypes.UPDATE
//         }
//       );

//       return true;

//     } catch (error) {
//       console.error('Mark token as used service error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get content creator election analytics
//    * @param {number} electionId - Election ID
//    * @param {number} userId - Creator user ID
//    * @returns {Promise<Object>} Analytics data
//    */
//   async getContentCreatorAnalytics(electionId, userId) {
//     try {
//       const election = await Election.findByPk(electionId);
      
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       if (election.creator_id !== userId || !election.is_content_creator_election) {
//         throw new Error('Insufficient permissions or not a content creator election');
//       }

//       // Get token usage statistics
//       const tokenStats = await sequelize.query(
//         `SELECT 
//           COUNT(*) as total_tokens,
//           COUNT(CASE WHEN used = true THEN 1 END) as used_tokens,
//           COUNT(CASE WHEN used = false THEN 1 END) as available_tokens
//         FROM vottery_election_2_one_time_tokens WHERE election_id = ?`,
//         {
//           replacements: [electionId],
//           type: sequelize.QueryTypes.SELECT
//         }
//       );

//       // Get voting statistics
//       const voteStats = await this.getElectionStatistics(electionId);

//       // Get projected vs actual revenue (if applicable)
//       const revenueStats = {
//         projected_revenue: election.projected_revenue_amount || 0,
//         actual_revenue: 0, // Would be calculated from actual content performance
//         revenue_share_distributed: 0 // Would track actual prize distributions
//       };

//       return {
//         token_statistics: tokenStats[0] || { total_tokens: 0, used_tokens: 0, available_tokens: 0 },
//         voting_statistics: voteStats,
//         revenue_statistics: revenueStats,
//         election_performance: {
//           engagement_rate: tokenStats[0] ? (tokenStats[0].used_tokens / tokenStats[0].total_tokens * 100) : 0,
//           conversion_rate: 0 // Would calculate based on views to votes
//         }
//       };

//     } catch (error) {
//       console.error('Get content creator analytics service error:', error);
//       throw error;
//     }
//   }
// }

// export const electionService = new ElectionService();
// export default electionService;
// import { 
//   Election, 
//   Question, 
//   Answer, 
//   ElectionAccess, 
//   ElectionBranding, 
//   ElectionLottery, 
//   ElectionSecurity,
//   sequelize 
// } from '../models/index.js';
// import { uploadService } from './uploadService.js';
// import { securityService } from './securityService.js';
// import { lotteryService } from './lotteryService.js';
// import { notificationService } from './notificationService.js';
// import { urlGenerator } from '../utils/urlGenerator.js';
// import slugify from 'slugify';
// import { v4 as uuidv4 } from 'uuid';
// import { Op } from 'sequelize';
// import { 
//   ELECTION_STATUSES, 
//   VOTING_TYPES, 
//   AUTHENTICATION_METHODS,
//   SUBSCRIPTION_LIMITS 
// } from '../config/constants.js';

// class ElectionService {
//   // Create new election with all related components
//   async createElection(creatorId, electionData) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       // Extract nested data
//       const {
//         // Basic election data
//         title,
//         description,
//         voting_body_content,
//         start_date,
//         end_date,
//         timezone = 'UTC',
//         voting_type = VOTING_TYPES.PLURALITY,
//         authentication_method = AUTHENTICATION_METHODS.PASSKEY,
//         biometric_required = false,
        
//         // Images/Videos
//         topic_image,
//         topic_video,
        
//         // Custom URL
//         custom_voting_url,
        
//         // Content creator specific
//         is_content_creator_election = false,
//         projected_revenue_amount,
        
//         // Multi-language
//         supported_languages = ['en'],
//         translated_content = {},
        
//         // Nested components
//         questions = [],
//         access_control = {},
//         branding = {},
//         lottery = {},
//         security = {}
//       } = electionData;

//       // Generate unique identifiers
//       const uniqueElectionId = uuidv4();
//       let customUrl = null;
      
//       if (custom_voting_url) {
//         customUrl = await this.generateUniqueCustomUrl(custom_voting_url);
//       }

//       // Upload images/videos if provided
//       let topicImageUrl = null;
//       let topicVideoUrl = null;
      
//       if (topic_image) {
//         topicImageUrl = await uploadService.uploadImage(topic_image, 'elections');
//       }
      
//       if (topic_video) {
//         topicVideoUrl = await uploadService.uploadVideo(topic_video, 'elections');
//       }

//       // Create main election record
//       const election = await Election.create({
//         creator_id: creatorId,
//         title,
//         description,
//         voting_body_content,
//         start_date: new Date(start_date),
//         end_date: new Date(end_date),
//         timezone,
//         voting_type,
//         authentication_method,
//         biometric_required,
//         topic_image_url: topicImageUrl,
//         topic_video_url: topicVideoUrl,
//         custom_voting_url: customUrl,
//         unique_election_id: uniqueElectionId,
//         is_content_creator_election,
//         projected_revenue_amount,
//         supported_languages,
//         translated_content,
//         status: ELECTION_STATUSES.DRAFT
//       }, { transaction });

//       // Create access control settings
//       const accessControlData = {
//         election_id: election.id,
//         permission_type: access_control.permission_type || 'world_citizens',
//         pricing_type: access_control.pricing_type || 'free',
//         general_fee: access_control.general_fee || 0,
//         regional_fees: access_control.regional_fees || {},
//         processing_fee_percentage: access_control.processing_fee_percentage || 0,
//         allowed_countries: access_control.allowed_countries || [],
//         blocked_countries: access_control.blocked_countries || [],
//         max_participants: access_control.max_participants,
//         min_age: access_control.min_age,
//         max_age: access_control.max_age,
//         ...access_control
//       };

//       await ElectionAccess.create(accessControlData, { transaction });

//       // Create branding settings
//       const brandingData = {
//         election_id: election.id,
//         primary_color: branding.primary_color || '#007bff',
//         secondary_color: branding.secondary_color || '#6c757d',
//         background_color: branding.background_color || '#ffffff',
//         text_color: branding.text_color || '#212529',
//         font_family: branding.font_family || 'Inter, system-ui, sans-serif',
//         corporate_style_enabled: branding.corporate_style_enabled || false,
//         white_label_enabled: branding.white_label_enabled || false,
//         content_creator_branding: branding.content_creator_branding || { enabled: false },
//         ...branding
//       };

//       // Upload branding images if provided
//       if (branding.logo_image) {
//         brandingData.logo_url = await uploadService.uploadImage(branding.logo_image, 'branding');
//       }

//       await ElectionBranding.create(brandingData, { transaction });

//       // Create lottery settings
//       const lotteryData = {
//         election_id: election.id,
//         lottery_enabled: lottery.lottery_enabled || false,
//         prize_type: lottery.prize_type,
//         monetary_amount: lottery.monetary_amount,
//         monetary_currency: lottery.monetary_currency || 'USD',
//         non_monetary_description: lottery.non_monetary_description,
//         projected_revenue_amount: lottery.projected_revenue_amount || projected_revenue_amount,
//         projected_revenue_percentage: lottery.projected_revenue_percentage || 100,
//         winner_count: lottery.winner_count || 1,
//         prize_distribution: lottery.prize_distribution || [{ rank: 1, percentage: 100 }],
//         auto_trigger_at_election_end: lottery.auto_trigger_at_election_end !== false,
//         ...lottery
//       };

//       await ElectionLottery.create(lotteryData, { transaction });

//       // Create security settings
//       const securityData = {
//         election_id: election.id,
//         encryption_enabled: security.encryption_enabled !== false,
//         digital_signatures_enabled: security.digital_signatures_enabled !== false,
//         audit_trail_enabled: security.audit_trail_enabled !== false,
//         biometric_required,
//         authentication_methods: [authentication_method],
//         anonymous_voting: security.anonymous_voting !== false,
//         tamper_detection_enabled: security.tamper_detection_enabled !== false,
//         ...security
//       };

//       await ElectionSecurity.create(securityData, { transaction });

//       // Create questions if provided
//       for (let i = 0; i < questions.length; i++) {
//         const questionData = questions[i];
        
//         const question = await Question.create({
//           election_id: election.id,
//           question_text: questionData.question_text,
//           question_type: questionData.question_type,
//           question_order: i + 1,
//           is_required: questionData.is_required !== false,
//           min_selections: questionData.min_selections || 1,
//           max_selections: questionData.max_selections || 1,
//           text_min_length: questionData.text_min_length || 1,
//           text_max_length: questionData.text_max_length || 5000,
//           question_image_url: questionData.question_image_url,
//           comparison_items: questionData.comparison_items || [],
//           plurality_config: questionData.plurality_config || {},
//           ranked_choice_config: questionData.ranked_choice_config || {},
//           approval_config: questionData.approval_config || {},
//           translated_questions: questionData.translated_questions || {}
//         }, { transaction });

//         // Create answers if provided
//         if (questionData.answers && questionData.answers.length > 0) {
//           for (let j = 0; j < questionData.answers.length; j++) {
//             const answerData = questionData.answers[j];
            
//             let answerImageUrl = null;
//             if (answerData.answer_image) {
//               answerImageUrl = await uploadService.uploadImage(answerData.answer_image, 'answers');
//             }

//             await Answer.create({
//               question_id: question.id,
//               answer_text: answerData.answer_text,
//               answer_image_url: answerImageUrl,
//               answer_order: j + 1,
//               comparison_item_id: answerData.comparison_item_id,
//               comparison_attributes: answerData.comparison_attributes || {},
//               image_description: answerData.image_description,
//               image_alt_text: answerData.image_alt_text,
//               translated_answers: answerData.translated_answers || {},
//               weight: answerData.weight || 1.0
//             }, { transaction });
//           }
//         }
//       }

//       // Generate content creator integration if enabled
//       if (is_content_creator_election) {
//         await this.setupContentCreatorIntegration(election.id, transaction);
//       }

//       // Initialize security components
//       await securityService.initializeElectionSecurity(election.id, securityData, transaction);

//       await transaction.commit();

//       // Return complete election with all relationships
//       return await this.getElectionById(election.id, creatorId);

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Create election service error:', error);
//       throw error;
//     }
//   }

//   // Get election by ID with all relationships
//   async getElectionById(electionId, userId = null) {
//     try {
//       const election = await Election.findByPk(electionId, {
//         include: [
//           {
//             model: Question,
//             as: 'questions',
//             include: [
//               {
//                 model: Answer,
//                 as: 'answers',
//                 order: [['answer_order', 'ASC']]
//               }
//             ],
//             order: [['question_order', 'ASC']]
//           },
//           {
//             model: ElectionAccess,
//             as: 'access_control'
//           },
//           {
//             model: ElectionBranding,
//             as: 'branding'
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery'
//           },
//           {
//             model: ElectionSecurity,
//             as: 'security_config'
//           }
//         ]
//       });

//       if (!election) {
//         return null;
//       }

//       // Add computed fields
//       const electionData = election.toJSON();
//       electionData.is_active = election.isActive();
//       electionData.is_expired = election.isExpired();
//       electionData.can_edit = election.canEdit();
//       electionData.can_delete = election.canDelete();
//       electionData.is_creator = userId ? election.creator_id === userId : false;

//       return electionData;

//     } catch (error) {
//       console.error('Get election by ID service error:', error);
//       throw error;
//     }
//   }

//   // Get elections with filters and pagination
//   async getElections(filters, userId = null) {
//     try {
//       const {
//         status,
//         voting_type,
//         creator_id,
//         search,
//         page = 1,
//         limit = 10,
//         sort_by = 'created_at',
//         sort_order = 'desc'
//       } = filters;

//       const offset = (page - 1) * limit;
//       const where = {};

//       // Apply filters
//       if (status) {
//         where.status = status;
//       }

//       if (voting_type) {
//         where.voting_type = voting_type;
//       }

//       if (creator_id) {
//         where.creator_id = creator_id;
//       }

//       if (search) {
//         where[Op.or] = [
//           { title: { [Op.iLike]: `%${search}%` } },
//           { description: { [Op.iLike]: `%${search}%` } }
//         ];
//       }

//       // Get total count
//       const totalCount = await Election.count({ where });

//       // Get elections
//       const elections = await Election.findAll({
//         where,
//         include: [
//           {
//             model: ElectionAccess,
//             as: 'access_control'
//           },
//           {
//             model: ElectionBranding,
//             as: 'branding'
//           },
//           {
//             model: ElectionLottery,
//             as: 'lottery'
//           }
//         ],
//         order: [[sort_by, sort_order.toUpperCase()]],
//         limit: parseInt(limit),
//         offset: parseInt(offset)
//       });

//       const electionsData = elections.map(election => {
//         const data = election.toJSON();
//         data.is_active = election.isActive();
//         data.is_expired = election.isExpired();
//         data.is_creator = userId ? election.creator_id === userId : false;
//         return data;
//       });

//       return {
//         elections: electionsData,
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / limit),
//         totalCount,
//         perPage: parseInt(limit)
//       };

//     } catch (error) {
//       console.error('Get elections service error:', error);
//       throw error;
//     }
//   }

//   // Update election
//   async updateElection(electionId, updateData, userId) {
//     const transaction = await sequelize.transaction();

//     try {
//       const election = await Election.findByPk(electionId);
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Extract nested updates
//       const {
//         questions,
//         access_control,
//         branding,
//         lottery,
//         security,
//         ...mainElectionData
//       } = updateData;

//       // Handle image/video uploads
//       if (updateData.topic_image) {
//         mainElectionData.topic_image_url = await uploadService.uploadImage(updateData.topic_image, 'elections');
//       }

//       if (updateData.topic_video) {
//         mainElectionData.topic_video_url = await uploadService.uploadVideo(updateData.topic_video, 'elections');
//       }

//       // Update main election
//       await election.update(mainElectionData, { transaction });

//       // Update related components if provided
//       if (access_control) {
//         await this.updateElectionAccess(electionId, access_control, transaction);
//       }

//       if (branding) {
//         await this.updateElectionBranding(electionId, branding, transaction);
//       }

//       if (lottery) {
//         await this.updateElectionLottery(electionId, lottery, transaction);
//       }

//       if (security) {
//         await this.updateElectionSecurity(electionId, security, transaction);
//       }

//       if (questions && Array.isArray(questions)) {
//         await this.updateElectionQuestions(electionId, questions, transaction);
//       }

//       await transaction.commit();

//       return await this.getElectionById(electionId, userId);

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Update election service error:', error);
//       throw error;
//     }
//   }

//   // Delete election
//   async deleteElection(electionId, userId) {
//     const transaction = await sequelize.transaction();

//     try {
//       const election = await Election.findByPk(electionId);
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Delete in correct order (children first)
//       // Get all questions first
//       const questions = await Question.findAll({
//         where: { election_id: electionId },
//         transaction
//       });

//       // Delete answers for each question
//       for (const question of questions) {
//         await Answer.destroy({
//           where: { question_id: question.id },
//           transaction
//         });
//       }

//       await Question.destroy({ where: { election_id: electionId }, transaction });
//       await ElectionAccess.destroy({ where: { election_id: electionId }, transaction });
//       await ElectionBranding.destroy({ where: { election_id: electionId }, transaction });
//       await ElectionLottery.destroy({ where: { election_id: electionId }, transaction });
//       await ElectionSecurity.destroy({ where: { election_id: electionId }, transaction });
      
//       await election.destroy({ transaction });

//       // Clean up uploaded files
//       await uploadService.cleanupElectionFiles(electionId);

//       await transaction.commit();

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Delete election service error:', error);
//       throw error;
//     }
//   }

//   // Clone election
//   async cloneElection(originalElectionId, newCreatorId, modifications = {}) {
//     const transaction = await sequelize.transaction();

//     try {
//       // Get original election with all data
//       const originalElection = await this.getElectionById(originalElectionId);
//       if (!originalElection) {
//         throw new Error('Original election not found');
//       }

//       // Prepare cloned data
//       const clonedData = {
//         ...originalElection,
//         ...modifications,
//         title: modifications.title || `${originalElection.title} (Copy)`,
//         cloned_from: originalElectionId,
//         custom_voting_url: null, // Reset custom URL
//         unique_election_id: uuidv4(), // New unique ID
//         status: ELECTION_STATUSES.DRAFT, // Always start as draft
//         total_votes: 0,
//         total_participants: 0
//       };

//       // Remove ID fields that shouldn't be copied
//       delete clonedData.id;
//       delete clonedData.created_at;
//       delete clonedData.updated_at;

//       // Create cloned election
//       const clonedElection = await this.createElection(newCreatorId, clonedData);

//       // Update clone count on original
//       await Election.increment('clone_count', {
//         where: { id: originalElectionId },
//         transaction
//       });

//       await transaction.commit();

//       return clonedElection;

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Clone election service error:', error);
//       throw error;
//     }
//   }

//   // Activate election
//   async activateElection(electionId, userId) {
//     const transaction = await sequelize.transaction();

//     try {
//       const election = await Election.findByPk(electionId, {
//         include: [
//           { model: Question, as: 'questions', include: [{ model: Answer, as: 'answers' }] },
//           { model: ElectionAccess, as: 'access_control' },
//           { model: ElectionSecurity, as: 'security_config' }
//         ]
//       });

//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Validate election can be activated
//       const validation = this.validateElectionForActivation(election);
//       if (!validation.valid) {
//         throw new Error(`Cannot activate election: ${validation.errors.join(', ')}`);
//       }

//       // Update status
//       await election.update({
//         status: ELECTION_STATUSES.ACTIVE
//       }, { transaction });

//       // Initialize security components
//       await securityService.activateElectionSecurity(electionId, transaction);

//       // Setup lottery if enabled
//       const lottery = await ElectionLottery.findOne({ where: { election_id: electionId } });
//       if (lottery && lottery.lottery_enabled) {
//         await lotteryService.initializeLottery(electionId, transaction);
//       }

//       // Send notifications
//       await notificationService.sendElectionActivatedNotification(electionId);

//       await transaction.commit();

//       return await this.getElectionById(electionId, userId);

//     } catch (error) {
//       await transaction.rollback();
//       console.error('Activate election service error:', error);
//       throw error;
//     }
//   }

//   // Get election statistics
//   async getElectionStatistics(electionId) {
//     try {
//       const election = await Election.findByPk(electionId, {
//         include: [
//           {
//             model: Question,
//             as: 'questions',
//             include: [{ model: Answer, as: 'answers' }]
//           },
//           { model: ElectionLottery, as: 'lottery' }
//         ]
//       });

//       if (!election) {
//         throw new Error('Election not found');
//       }

//       // Calculate statistics
//       const stats = {
//         election_info: {
//           id: election.id,
//           title: election.title,
//           status: election.status,
//           voting_type: election.voting_type,
//           start_date: election.start_date,
//           end_date: election.end_date,
//           is_active: election.isActive(),
//           is_expired: election.isExpired()
//         },
//         participation: {
//           total_votes: election.total_votes,
//           total_participants: election.total_participants,
//           participation_rate: 0 // Would need target audience size
//         },
//         questions: election.questions.map(question => ({
//           id: question.id,
//           question_text: question.question_text,
//           question_type: question.question_type,
//           response_count: question.response_count,
//           skip_count: question.skip_count,
//           answers: question.answers.map(answer => ({
//             id: answer.id,
//             answer_text: answer.answer_text,
//             selection_count: answer.selection_count,
//             ranking_sum: answer.ranking_sum,
//             approval_count: answer.approval_count
//           }))
//         })),
//         lottery: election.lottery ? {
//           enabled: election.lottery.lottery_enabled,
//           executed: election.lottery.lottery_executed,
//           total_prize_value: election.lottery.getTotalPrizeValue(),
//           winner_count: election.lottery.winner_count,
//           eligible_participants: election.lottery.eligible_participants
//         } : null,
//         timeline: {
//           created_at: election.created_at,
//           updated_at: election.updated_at,
//           days_since_creation: Math.floor((new Date() - election.created_at) / (1000 * 60 * 60 * 24)),
//           time_until_start: election.start_date > new Date() ? Math.floor((election.start_date - new Date()) / (1000 * 60 * 60 * 24)) : 0,
//           time_until_end: election.end_date > new Date() ? Math.floor((election.end_date - new Date()) / (1000 * 60 * 60 * 24)) : 0
//         }
//       };

//       return stats;

//     } catch (error) {
//       console.error('Get election statistics service error:', error);
//       throw error;
//     }
//   }

//   // Export election data
//   async exportElectionData(electionId, format = 'json') {
//     try {
//       const election = await this.getElectionById(electionId);
//       if (!election) {
//         throw new Error('Election not found');
//       }

//       if (format === 'csv') {
//         return this.exportElectionAsCSV(election);
//       } else {
//         return JSON.stringify(election, null, 2);
//       }

//     } catch (error) {
//       console.error('Export election data service error:', error);
//       throw error;
//     }
//   }

//   // Update election access control
//   async updateElectionAccess(electionId, accessData, transaction = null) {
//     try {
//       const shouldCommit = !transaction;
//       if (!transaction) {
//         transaction = await sequelize.transaction();
//       }

//       await ElectionAccess.update(accessData, {
//         where: { election_id: electionId },
//         transaction
//       });

//       if (shouldCommit) {
//         await transaction.commit();
//       }

//       return await ElectionAccess.findOne({ 
//         where: { election_id: electionId } 
//       });

//     } catch (error) {
//       if (transaction && !transaction.finished) {
//         await transaction.rollback();
//       }
//       console.error('Update election access service error:', error);
//       throw error;
//     }
//   }

//   // Update election branding
//   async updateElectionBranding(electionId, brandingData, transaction = null) {
//     try {
//       const shouldCommit = !transaction;
//       if (!transaction) {
//         transaction = await sequelize.transaction();
//       }

//       // Handle logo upload
//       if (brandingData.logo_image) {
//         brandingData.logo_url = await uploadService.uploadImage(brandingData.logo_image, 'branding');
//         delete brandingData.logo_image;
//       }

//       await ElectionBranding.update(brandingData, {
//         where: { election_id: electionId },
//         transaction
//       });

//       if (shouldCommit) {
//         await transaction.commit();
//       }

//       return await ElectionBranding.findOne({ 
//         where: { election_id: electionId } 
//       });

//     } catch (error) {
//       if (transaction && !transaction.finished) {
//         await transaction.rollback();
//       }
//       console.error('Update election branding service error:', error);
//       throw error;
//     }
//   }

//   // Update election lottery
//   async updateElectionLottery(electionId, lotteryData, transaction = null) {
//     try {
//       const shouldCommit = !transaction;
//       if (!transaction) {
//         transaction = await sequelize.transaction();
//       }

//       await ElectionLottery.update(lotteryData, {
//         where: { election_id: electionId },
//         transaction
//       });

//       if (shouldCommit) {
//         await transaction.commit();
//       }

//       return await ElectionLottery.findOne({ 
//         where: { election_id: electionId } 
//       });

//     } catch (error) {
//       if (transaction && !transaction.finished) {
//         await transaction.rollback();
//       }
//       console.error('Update election lottery service error:', error);
//       throw error;
//     }
//   }

//   // Update election security
//   async updateElectionSecurity(electionId, securityData, transaction = null) {
//     try {
//       const shouldCommit = !transaction;
//       if (!transaction) {
//         transaction = await sequelize.transaction();
//       }

//       await ElectionSecurity.update(securityData, {
//         where: { election_id: electionId },
//         transaction
//       });

//       // Update security configurations
//       await securityService.updateElectionSecurity(electionId, securityData, transaction);

//       if (shouldCommit) {
//         await transaction.commit();
//       }

//       return await ElectionSecurity.findOne({ 
//         where: { election_id: electionId } 
//       });

//     } catch (error) {
//       if (transaction && !transaction.finished) {
//         await transaction.rollback();
//       }
//       console.error('Update election security service error:', error);
//       throw error;
//     }
//   }

//   // Generate custom URL
//   async generateCustomUrl(electionId, customUrl) {
//     try {
//       const finalUrl = await this.generateUniqueCustomUrl(customUrl);
      
//       await Election.update(
//         { custom_voting_url: finalUrl },
//         { where: { id: electionId } }
//       );

//       return await Election.findByPk(electionId);

//     } catch (error) {
//       console.error('Generate custom URL service error:', error);
//       throw error;
//     }
//   }

//   // Get user's elections
//   async getUserElections(userId, filters) {
//     try {
//       const {
//         status,
//         page = 1,
//         limit = 10,
//         sort_by = 'created_at',
//         sort_order = 'desc'
//       } = filters;

//       const where = { creator_id: userId };
      
//       if (status) {
//         where.status = status;
//       }

//       const offset = (page - 1) * limit;

//       const totalCount = await Election.count({ where });

//       const elections = await Election.findAll({
//         where,
//         include: [
//           { model: ElectionAccess, as: 'access_control' },
//           { model: ElectionBranding, as: 'branding' },
//           { model: ElectionLottery, as: 'lottery' }
//         ],
//         order: [[sort_by, sort_order.toUpperCase()]],
//         limit: parseInt(limit),
//         offset: parseInt(offset)
//       });

//       const electionsData = elections.map(election => {
//         const data = election.toJSON();
//         data.is_active = election.isActive();
//         data.is_expired = election.isExpired();
//         data.can_edit = election.canEdit();
//         data.can_delete = election.canDelete();
//         return data;
//       });

//       return {
//         elections: electionsData,
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / limit),
//         totalCount,
//         perPage: parseInt(limit)
//       };

//     } catch (error) {
//       console.error('Get user elections service error:', error);
//       throw error;
//     }
//   }

//   // Update election statuses (cron job)
//   async updateElectionStatuses() {
//     try {
//       const now = new Date();

//       // Activate elections that should start
//       await Election.update(
//         { status: ELECTION_STATUSES.ACTIVE },
//         {
//           where: {
//             status: ELECTION_STATUSES.DRAFT,
//             start_date: { [Op.lte]: now },
//             end_date: { [Op.gt]: now }
//           }
//         }
//       );

//       // Complete elections that have ended
//       await Election.update(
//         { status: ELECTION_STATUSES.COMPLETED },
//         {
//           where: {
//             status: ELECTION_STATUSES.ACTIVE,
//             end_date: { [Op.lte]: now }
//           }
//         }
//       );

//       console.log('Election statuses updated successfully');

//     } catch (error) {
//       console.error('Update election statuses service error:', error);
//       throw error;
//     }
//   }

//   // Execute scheduled lotteries (cron job)
//   async executeScheduledLotteries() {
//     try {
//       const now = new Date();

//       // Find lotteries that need to be executed
//       const lotteriesToExecute = await ElectionLottery.findAll({
//         where: {
//           lottery_enabled: true,
//           lottery_executed: false,
//           [Op.or]: [
//             { lottery_trigger_time: { [Op.lte]: now } },
//             {
//               auto_trigger_at_election_end: true,
//               '$election.end_date$': { [Op.lte]: now },
//               '$election.status$': ELECTION_STATUSES.COMPLETED
//             }
//           ]
//         },
//         include: [{
//           model: Election,
//           as: 'election'
//         }]
//       });

//       for (const lottery of lotteriesToExecute) {
//         await lotteryService.executeLottery(lottery.election_id);
//       }

//       console.log(`Executed ${lotteriesToExecute.length} scheduled lotteries`);

//     } catch (error) {
//       console.error('Execute scheduled lotteries service error:', error);
//       throw error;
//     }
//   }

//   // Helper methods
//   async generateUniqueCustomUrl(baseUrl) {
//     const slug = slugify(baseUrl, { lower: true, strict: true });
//     let finalUrl = slug;
//     let counter = 1;

//     // Check if URL already exists
//     while (await Election.findOne({ where: { custom_voting_url: finalUrl } })) {
//       finalUrl = `${slug}-${counter}`;
//       counter++;
//     }

//     return finalUrl;
//   }

//   async setupContentCreatorIntegration(electionId, transaction) {
//     // Generate Vottery icon and setup content creator specific configurations
//     const iconUrl = await uploadService.generateVotteryIcon(electionId);
    
//     await Election.update(
//       { 
//         vottery_icon_url: iconUrl,
//         content_creator_stage: 'subscription_icon'
//       },
//       { where: { id: electionId }, transaction }
//     );
//   }

//   async updateElectionQuestions(electionId, questionsData, transaction) {
//     // Delete existing questions and answers
//     await Answer.destroy({
//       where: { '$question.election_id: electionId },
//       include: [{ model: Question, as: 'question' }],
//       transaction
//     });
    
//     await Question.destroy({
//       where: { election_id: electionId },
//       transaction
//     });

//     // Create new questions and answers
//     for (let i = 0; i < questionsData.length; i++) {
//       const questionData = questionsData[i];
      
//       const question = await Question.create({
//         election_id: electionId,
//         ...questionData,
//         question_order: i + 1
//       }, { transaction });

//       if (questionData.answers && questionData.answers.length > 0) {
//         for (let j = 0; j < questionData.answers.length; j++) {
//           const answerData = questionData.answers[j];
          
//           await Answer.create({
//             question_id: question.id,
//             ...answerData,
//             answer_order: j + 1
//           }, { transaction });
//         }
//       }
//     }
//   }

//   validateElectionForActivation(election) {
//     const errors = [];

//     // Check if election has questions
//     if (!election.questions || election.questions.length === 0) {
//       errors.push('Election must have at least one question');
//     }

//     // Check if questions have answers (for non-text questions)
//     election.questions.forEach((question, index) => {
//       if (question.requiresAnswers() && (!question.answers || question.answers.length < 2)) {
//         errors.push(`Question ${index + 1} must have at least 2 answer options`);
//       }
//     });

//     // Check dates
//     const now = new Date();
//     if (election.start_date < now && election.end_date < now) {
//       errors.push('Election dates are in the past');
//     }

//     if (election.start_date >= election.end_date) {
//       errors.push('End date must be after start date');
//     }

//     return {
//       valid: errors.length === 0,
//       errors
//     };
//   }

//   exportElectionAsCSV(election) {
//     // Simple CSV export implementation
//     const headers = ['Question', 'Question Type', 'Answer', 'Votes'];
//     const rows = [headers.join(',')];

//     election.questions.forEach(question => {
//       if (question.answers && question.answers.length > 0) {
//         question.answers.forEach(answer => {
//           rows.push([
//             `"${question.question_text}"`,
//             question.question_type,
//             `"${answer.answer_text || 'N/A'}"`,
//             answer.selection_count || 0
//           ].join(','));
//         });
//       } else {
//         rows.push([
//           `"${question.question_text}"`,
//           question.question_type,
//           'Open Text Response',
//           question.response_count || 0
//         ].join(','));
//       }
//     });

//     return rows.join('\n');
//   }
// }

// export const electionService = new ElectionService();
// export default electionService;
// import Election from '../models/Election.js';
// import ElectionAccess from '../models/ElectionAccess.js';
// import { query, withTransaction } from '../config/database.js';
// import { generateUniqueUrl } from '../utils/urlGenerator.js';
// import { encryptSensitiveData } from '../utils/encryption.js';
// import { ELECTION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants.js';

// class ElectionService {
//   constructor() {
//     this.electionModel = new Election();
//     this.electionAccessModel = new ElectionAccess();
//   }

//   // Create new election with all configurations
//   async createElection(electionData, userId) {
//     try {
//       return await withTransaction(async (client) => {
//         const {
//           title,
//           description,
//           topic_image_url,
//           topic_video_url,
//           start_date,
//           start_time,
//           end_date,
//           end_time,
//           voting_type,
//           timezone = 'UTC',
//           language = 'en-US',
//           custom_url,
//           corporate_style,
//           logo_branding_url,
//           results_visible = false,
//           vote_editing_allowed = false,
//           permission_type = 'world_citizens',
//           allowed_countries = [],
//           organization_id,
//           biometric_required = false,
//           authentication_methods = ['passkey'],
//           pricing_type = 'free',
//           general_fee = 0,
//           regional_fees = {},
//           processing_fee_percentage = 2.5,
//           lottery_enabled = false,
//           lottery_config = {},
//           questions = [],
//           meta_data = {}
//         } = electionData;

//         // Generate unique URL if not provided
//         const finalCustomUrl = custom_url || await generateUniqueUrl(title);

//         // Create the election
//         const election = await this.electionModel.create({
//           title,
//           description,
//           topic_image_url,
//           topic_video_url,
//           start_date,
//           start_time,
//           end_date,
//           end_time,
//           voting_type,
//           creator_id: userId,
//           status: ELECTION_STATUS.DRAFT,
//           timezone,
//           language,
//           custom_url: finalCustomUrl,
//           corporate_style,
//           logo_branding_url,
//           results_visible,
//           vote_editing_allowed,
//           meta_data: {
//             ...meta_data,
//             created_by_service: 'election_creation_service',
//             version: '1.0'
//           }
//         });

//         if (!election) {
//           throw new Error('Failed to create election');
//         }

//         // Create access settings
//         await this.electionAccessModel.create({
//           election_id: election.id,
//           permission_type,
//           allowed_countries,
//           organization_id,
//           biometric_required,
//           authentication_methods,
//           pricing_type,
//           general_fee,
//           regional_fees,
//           processing_fee_percentage,
//           meta_data: {
//             created_with_election: true
//           }
//         });

//         // Create questions if provided
//         if (questions && questions.length > 0) {
//           await this.createElectionQuestions(election.id, questions, client);
//         }

//         // Create security settings
//         await this.createSecuritySettings(election.id, {
//           encryption_enabled: true,
//           digital_signatures: true,
//           audit_trail: true
//         }, client);

//         return {
//           ...election,
//           custom_url: finalCustomUrl,
//           voting_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vote/${finalCustomUrl}`,
//           management_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/elections/${election.id}`
//         };
//       });
//     } catch (error) {
//       console.error('Create election service error:', error);
//       throw new Error(error.message || 'Failed to create election');
//     }
//   }

//   // Get election with full details
//   async getElectionDetails(electionId, userId = null) {
//     try {
//       const election = await this.electionModel.findById(electionId);
      
//       if (!election) {
//         throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
//       }

//       // Get access settings
//       const accessSettings = await this.electionAccessModel.findByElectionId(electionId);
      
//       // Get questions
//       const questions = await this.getElectionQuestions(electionId);
      
//       // Get statistics
//       const statistics = await this.electionModel.getStatistics(electionId);

//       return {
//         election: {
//           ...election,
//           voting_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vote/${election.custom_url}`,
//           management_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/elections/${election.id}`
//         },
//         access_settings: accessSettings,
//         questions: questions,
//         statistics: statistics
//       };
//     } catch (error) {
//       console.error('Get election details service error:', error);
//       throw new Error(error.message || 'Failed to get election details');
//     }
//   }

//   // Update election
//   async updateElection(electionId, updateData, userId) {
//     try {
//       return await withTransaction(async (client) => {
//         const election = await this.electionModel.findById(electionId);
        
//         if (!election) {
//           throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
//         }

//         const updatedElection = await this.electionModel.update(electionId, updateData);

//         if (updateData.access_settings) {
//           await this.electionAccessModel.update(electionId, updateData.access_settings);
//         }

//         return updatedElection;
//       });
//     } catch (error) {
//       console.error('Update election service error:', error);
//       throw new Error(error.message || 'Failed to update election');
//     }
//   }

//   // Delete election (soft delete)
//   async deleteElection(electionId, userId) {
//     try {
//       const deleted = await this.electionModel.softDelete(electionId);
      
//       if (!deleted) {
//         throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
//       }

//       return deleted;
//     } catch (error) {
//       console.error('Delete election service error:', error);
//       throw new Error(error.message || 'Failed to delete election');
//     }
//   }

//   // Update election status
//   async updateElectionStatus(electionId, newStatus, userId) {
//     try {
//       const updated = await this.electionModel.updateStatus(electionId, newStatus);
      
//       if (!updated) {
//         throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
//       }

//       return updated;
//     } catch (error) {
//       console.error('Update election status service error:', error);
//       throw new Error(error.message || 'Failed to update election status');
//     }
//   }

//   // Get user elections
//   async getUserElections(userId, filters = {}) {
//     try {
//       const result = await this.electionModel.findByCreatorId(userId, filters);
      
//       const enhancedElections = await Promise.all(
//         result.elections.map(async (election) => {
//           const statistics = await this.electionModel.getStatistics(election.id);
//           return {
//             ...election,
//             statistics,
//             voting_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vote/${election.custom_url}`,
//             management_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/elections/${election.id}`
//           };
//         })
//       );

//       return {
//         elections: enhancedElections,
//         total: result.total,
//         filters: filters
//       };
//     } catch (error) {
//       console.error('Get user elections service error:', error);
//       throw new Error(error.message || 'Failed to get user elections');
//     }
//   }

//   // Helper methods
//   async createElectionQuestions(electionId, questions, client) {
//     try {
//       const questionPromises = questions.map(async (questionData, index) => {
//         const questionSql = `
//           INSERT INTO vottery_questions_2 (
//             election_id, question_text, question_type, question_order,
//             image_url, description, required, min_selections, max_selections,
//             meta_data, created_at, updated_at
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           RETURNING *
//         `;

//         const questionValues = [
//           electionId,
//           questionData.question_text,
//           questionData.question_type,
//           index + 1,
//           questionData.image_url,
//           questionData.description,
//           questionData.required || false,
//           questionData.min_selections,
//           questionData.max_selections,
//           JSON.stringify(questionData.meta_data || {})
//         ];

//         const questionResult = await client.query(questionSql, questionValues);
//         const question = questionResult.rows[0];

//         // Create answers if provided
//         if (questionData.options && questionData.options.length > 0) {
//           await this.createQuestionAnswers(question.id, questionData.options, client);
//         }

//         return question;
//       });

//       return await Promise.all(questionPromises);
//     } catch (error) {
//       console.error('Create election questions error:', error);
//       throw error;
//     }
//   }

//   async createQuestionAnswers(questionId, answers, client) {
//     try {
//       const answerPromises = answers.map(async (answerData, index) => {
//         const answerSql = `
//           INSERT INTO vottery_answers_2 (
//             question_id, answer_text, answer_order, image_url,
//             meta_data, created_at, updated_at
//           ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           RETURNING *
//         `;

//         const answerValues = [
//           questionId,
//           answerData.answer_text || answerData.text,
//           index + 1,
//           answerData.image_url,
//           JSON.stringify(answerData.meta_data || {})
//         ];

//         const result = await client.query(answerSql, answerValues);
//         return result.rows[0];
//       });

//       return await Promise.all(answerPromises);
//     } catch (error) {
//       console.error('Create question answers error:', error);
//       throw error;
//     }
//   }

//   async getElectionQuestions(electionId) {
//     try {
//       const questionsSql = `
//         SELECT q.*, 
//           COALESCE(
//             json_agg(
//               json_build_object(
//                 'id', a.id,
//                 'answer_text', a.answer_text,
//                 'answer_order', a.answer_order,
//                 'image_url', a.image_url,
//                 'meta_data', a.meta_data
//               ) ORDER BY a.answer_order
//             ) FILTER (WHERE a.id IS NOT NULL), '[]'
//           ) as options
//         FROM vottery_questions_2 q
//         LEFT JOIN vottery_answers_2 a ON q.id = a.question_id
//         WHERE q.election_id = $1
//         GROUP BY q.id
//         ORDER BY q.question_order
//       `;

//       const result = await query(questionsSql, [electionId]);
//       return result.rows.map(question => ({
//         ...question,
//         meta_data: JSON.parse(question.meta_data || '{}'),
//         options: question.options.map(option => ({
//           ...option,
//           meta_data: JSON.parse(option.meta_data || '{}')
//         }))
//       }));
//     } catch (error) {
//       console.error('Get election questions error:', error);
//       return [];
//     }
//   }

//   async createSecuritySettings(electionId, securityConfig, client) {
//     try {
//       const securitySql = `
//         INSERT INTO vottery_election_security_2 (
//           election_id, encryption_enabled, digital_signatures_enabled,
//           audit_trail_enabled, hash_algorithm, encryption_method,
//           created_at, updated_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//         RETURNING *
//       `;

//       const values = [
//         electionId,
//         securityConfig.encryption_enabled || true,
//         securityConfig.digital_signatures || true,
//         securityConfig.audit_trail || true,
//         'sha256',
//         'aes-256-gcm'
//       ];

//       const result = await client.query(securitySql, values);
//       return result.rows[0];
//     } catch (error) {
//       console.error('Create security settings error:', error);
//       // Don't throw error for security settings - it's optional
//       return null;
//     }
//   }
// }

// const electionService = new ElectionService();

// export { electionService };
// export default electionService;
// // import Election from '../models/Election.js';
// // import ElectionAccess from '../models/ElectionAccess.js';
// // import { query, withTransaction } from '../config/database.js';
// // import { generateUniqueUrl } from '../utils/urlGenerator.js';
// // import { encryptSensitiveData } from '../utils/encryption.js';
// // import { ELECTION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants.js';

// // class ElectionService {
// //   constructor() {
// //     this.electionModel = new Election();
// //     this.electionAccessModel = new ElectionAccess();
// //   }

// //   // Create new election with all configurations
// //   async createElection(electionData, userId) {
// //     try {
// //       return await withTransaction(async (client) => {
// //         const {
// //           // Basic election data
// //           title,
// //           description,
// //           topic_image_url,
// //           topic_video_url,
// //           start_date,
// //           start_time,
// //           end_date,
// //           end_time,
// //           voting_type,
// //           timezone = 'UTC',
// //           language = 'en-US',
// //           custom_url,
// //           corporate_style,
// //           logo_branding_url,
// //           results_visible = false,
// //           vote_editing_allowed = false,
          
// //           // Access control data
// //           permission_type = 'world_citizens',
// //           allowed_countries = [],
// //           organization_id,
// //           biometric_required = false,
// //           authentication_methods = ['passkey'],
// //           pricing_type = 'free',
// //           general_fee = 0,
// //           regional_fees = {},
// //           processing_fee_percentage = 2.5,
          
// //           // Lottery data
// //           lottery_enabled = false,
// //           lottery_config = {},
          
// //           // Questions data
// //           questions = [],
          
// //           // Meta data
// //           meta_data = {}
// //         } = electionData;

// //         // Generate unique URL if not provided
// //         const finalCustomUrl = custom_url || await generateUniqueUrl(title);

// //         // Create the election
// //         const election = await this.electionModel.create({
// //           title,
// //           description,
// //           topic_image_url,
// //           topic_video_url,
// //           start_date,
// //           start_time,
// //           end_date,
// //           end_time,
// //           voting_type,
// //           creator_id: userId,
// //           status: ELECTION_STATUS.DRAFT,
// //           timezone,
// //           language,
// //           custom_url: finalCustomUrl,
// //           corporate_style,
// //           logo_branding_url,
// //           results_visible,
// //           vote_editing_allowed,
// //           meta_data: {
// //             ...meta_data,
// //             created_by_service: 'election_creation_service',
// //             version: '1.0'
// //           }
// //         });

// //         if (!election) {
// //           throw new Error('Failed to create election');
// //         }

// //         // Create access settings
// //         await this.electionAccessModel.create({
// //           election_id: election.id,
// //           permission_type,
// //           allowed_countries,
// //           organization_id,
// //           biometric_required,
// //           authentication_methods,
// //           pricing_type,
// //           general_fee,
// //           regional_fees,
// //           processing_fee_percentage,
// //           meta_data: {
// //             created_with_election: true
// //           }
// //         });

// //         // Create lottery configuration if enabled
// //         if (lottery_enabled && Object.keys(lottery_config).length > 0) {
// //           await this.createLotteryConfiguration(election.id, lottery_config, client);
// //         }

// //         // Create questions if provided
// //         if (questions && questions.length > 0) {
// //           await this.createElectionQuestions(election.id, questions, client);
// //         }

// //         // Create security settings
// //         await this.createSecuritySettings(election.id, {
// //           encryption_enabled: true,
// //           digital_signatures: true,
// //           audit_trail: true
// //         }, client);

// //         // Log election creation
// //         await this.logElectionActivity(election.id, userId, 'election_created', {
// //           title: election.title,
// //           voting_type: election.voting_type
// //         }, client);

// //         return {
// //           ...election,
// //           custom_url: finalCustomUrl,
// //           voting_url: `${process.env.FRONTEND_URL}/vote/${finalCustomUrl}`,
// //           management_url: `${process.env.FRONTEND_URL}/elections/${election.id}`
// //         };
// //       });
// //     } catch (error) {
// //       console.error('Create election service error:', error);
// //       throw new Error(error.message || 'Failed to create election');
// //     }
// //   }

// //   // Get election with full details
// //   async getElectionDetails(electionId, userId = null) {
// //     try {
// //       const election = await this.electionModel.findById(electionId);
      
// //       if (!election) {
// //         throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
// //       }

// //       // Get access settings
// //       const accessSettings = await this.electionAccessModel.findByElectionId(electionId);
      
// //       // Get questions
// //       const questions = await this.getElectionQuestions(electionId);
      
// //       // Get lottery configuration
// //       const lotteryConfig = await this.getLotteryConfiguration(electionId);
      
// //       // Get statistics
// //       const statistics = await this.electionModel.getStatistics(electionId);

// //       // Check if user can access (if userId provided)
// //       let canAccess = true;
// //       let accessReason = null;

// //       if (userId && accessSettings) {
// //         const accessCheck = await this.electionAccessModel.canUserAccess(
// //           electionId, 
// //           userId, 
// //           null // User country would need to be fetched
// //         );
// //         canAccess = accessCheck.canAccess;
// //         accessReason = accessCheck.reason;
// //       }

// //       return {
// //         election: {
// //           ...election,
// //           voting_url: `${process.env.FRONTEND_URL}/vote/${election.custom_url}`,
// //           management_url: `${process.env.FRONTEND_URL}/elections/${election.id}`
// //         },
// //         access_settings: accessSettings,
// //         questions: questions,
// //         lottery_config: lotteryConfig,
// //         statistics: statistics,
// //         user_access: {
// //           can_access: canAccess,
// //           reason: accessReason
// //         }
// //       };
// //     } catch (error) {
// //       console.error('Get election details service error:', error);
// //       throw new Error(error.message || 'Failed to get election details');
// //     }
// //   }

// //   // Update election
// //   async updateElection(electionId, updateData, userId) {
// //     try {
// //       return await withTransaction(async (client) => {
// //         // Check ownership
// //         const election = await this.electionModel.findById(electionId);
        
// //         if (!election) {
// //           throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
// //         }

// //         // Update election
// //         const updatedElection = await this.electionModel.update(electionId, updateData);

// //         // Update access settings if provided
// //         if (updateData.access_settings) {
// //           await this.electionAccessModel.update(electionId, updateData.access_settings);
// //         }

// //         // Update questions if provided
// //         if (updateData.questions) {
// //           await this.updateElectionQuestions(electionId, updateData.questions, client);
// //         }

// //         // Update lottery configuration if provided
// //         if (updateData.lottery_config) {
// //           await this.updateLotteryConfiguration(electionId, updateData.lottery_config, client);
// //         }

// //         // Log update activity
// //         await this.logElectionActivity(electionId, userId, 'election_updated', {
// //           updated_fields: Object.keys(updateData)
// //         }, client);

// //         return updatedElection;
// //       });
// //     } catch (error) {
// //       console.error('Update election service error:', error);
// //       throw new Error(error.message || 'Failed to update election');
// //     }
// //   }

// //   // Delete election (soft delete)
// //   async deleteElection(electionId, userId) {
// //     try {
// //       return await withTransaction(async (client) => {
// //         const deleted = await this.electionModel.softDelete(electionId);
        
// //         if (!deleted) {
// //           throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
// //         }

// //         // Log deletion activity
// //         await this.logElectionActivity(electionId, userId, 'election_deleted', {
// //           title: deleted.title
// //         }, client);

// //         return deleted;
// //       });
// //     } catch (error) {
// //       console.error('Delete election service error:', error);
// //       throw new Error(error.message || 'Failed to delete election');
// //     }
// //   }

// //   // Clone election
// //   async cloneElection(electionId, userId, cloneOptions = {}) {
// //     try {
// //       const { new_title, include_questions = true, include_lottery = false } = cloneOptions;

// //       const originalDetails = await this.getElectionDetails(electionId);
      
// //       const cloneData = {
// //         ...originalDetails.election,
// //         title: new_title || `${originalDetails.election.title} (Copy)`,
// //         access_settings: originalDetails.access_settings,
// //         questions: include_questions ? originalDetails.questions : [],
// //         lottery_config: include_lottery ? originalDetails.lottery_config : {}
// //       };

// //       return await this.createElection(cloneData, userId);
// //     } catch (error) {
// //       console.error('Clone election service error:', error);
// //       throw new Error(error.message || 'Failed to clone election');
// //     }
// //   }

// //   // Update election status
// //   async updateElectionStatus(electionId, newStatus, userId) {
// //     try {
// //       return await withTransaction(async (client) => {
// //         const updated = await this.electionModel.updateStatus(electionId, newStatus);
        
// //         if (!updated) {
// //           throw new Error(ERROR_MESSAGES.ELECTION_NOT_FOUND);
// //         }

// //         // Log status change
// //         await this.logElectionActivity(electionId, userId, 'election_status_changed', {
// //           old_status: updated.status,
// //           new_status: newStatus
// //         }, client);

// //         return updated;
// //       });
// //     } catch (error) {
// //       console.error('Update election status service error:', error);
// //       throw new Error(error.message || 'Failed to update election status');
// //     }
// //   }

// //   // Get user elections
// //   async getUserElections(userId, filters = {}) {
// //     try {
// //       const result = await this.electionModel.findByCreatorId(userId, filters);
      
// //       // Enhance with additional data
// //       const enhancedElections = await Promise.all(
// //         result.elections.map(async (election) => {
// //           const statistics = await this.electionModel.getStatistics(election.id);
// //           return {
// //             ...election,
// //             statistics,
// //             voting_url: `${process.env.FRONTEND_URL}/vote/${election.custom_url}`,
// //             management_url: `${process.env.FRONTEND_URL}/elections/${election.id}`
// //           };
// //         })
// //       );

// //       return {
// //         elections: enhancedElections,
// //         total: result.total,
// //         filters: filters
// //       };
// //     } catch (error) {
// //       console.error('Get user elections service error:', error);
// //       throw new Error(error.message || 'Failed to get user elections');
// //     }
// //   }

// //   // Helper methods
// //   async createElectionQuestions(electionId, questions, client) {
// //     const questionPromises = questions.map(async (questionData, index) => {
// //       const questionSql = `
// //         INSERT INTO vottery_questions_2 (
// //           election_id, question_text, question_type, question_order,
// //           image_url, description, required, min_selections, max_selections,
// //           meta_data, created_at, updated_at
// //         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// //         RETURNING *
// //       `;

// //       const questionValues = [
// //         electionId,
// //         questionData.question_text,
// //         questionData.question_type,
// //         index + 1,
// //         questionData.image_url,
// //         questionData.description,
// //         questionData.required || false,
// //         questionData.min_selections,
// //         questionData.max_selections,
// //         JSON.stringify(questionData.meta_data || {})
// //       ];

// //       const questionResult = await client.query(questionSql, questionValues);
// //       const question = questionResult.rows[0];

// //       // Create answers if provided
// //       if (questionData.options && questionData.options.length > 0) {
// //         await this.createQuestionAnswers(question.id, questionData.options, client);
// //       }

// //       return question;
// //     });

// //     return await Promise.all(questionPromises);
// //   }

// //   async createQuestionAnswers(questionId, answers, client) {
// //     const answerPromises = answers.map(async (answerData, index) => {
// //       const answerSql = `
// //         INSERT INTO vottery_answers_2 (
// //           question_id, answer_text, answer_order, image_url,
// //           meta_data, created_at, updated_at
// //         ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// //         RETURNING *
// //       `;

// //       const answerValues = [
// //         questionId,
// //         answerData.answer_text || answerData.text,
// //         index + 1,
// //         answerData.image_url,
// //         JSON.stringify(answerData.meta_data || {})
// //       ];

// //       const result = await client.query(answerSql, answerValues);
// //       return result.rows[0];
// //     });

// //     return await Promise.all(answerPromises);
// //   }

// //   async getElectionQuestions(electionId) {
// //     const questionsSql = `
// //       SELECT q.*, 
// //         COALESCE(
// //           json_agg(
// //             json_build_object(
// //               'id', a.id,
// //               'answer_text', a.answer_text,
// //               'answer_order', a.answer_order,
// //               'image_url', a.image_url,
// //               'meta_data', a.meta_data
// //             ) ORDER BY a.answer_order
// //           ) FILTER (WHERE a.id IS NOT NULL), '[]'
// //         ) as options
// //       FROM vottery_questions_2 q
// //       LEFT JOIN vottery_answers_2 a ON q.id = a.question_id
// //       WHERE q.election_id = $1
// //       GROUP BY q.id
// //       ORDER BY q.question_order
// //     `;

// //     const result = await query(questionsSql, [electionId]);
// //     return result.rows.map(question => ({
// //       ...question,
// //       meta_data: JSON.parse(question.meta_data || '{}'),
// //       options: question.options.map(option => ({
// //         ...option,
// //         meta_data: JSON.parse(option.meta_data || '{}')
// //       }))
// //     }));
// //   }

// //   async createLotteryConfiguration(electionId, lotteryConfig, client) {
// //     // Implementation would depend on lottery table structure
// //     // This is a placeholder
// //     console.log('Creating lottery configuration for election:', electionId);
// //     return lotteryConfig;
// //   }

// //   async getLotteryConfiguration(electionId) {
// //     // Implementation would depend on lottery table structure
// //     // This is a placeholder
// //     return null;
// //   }

// //   async updateLotteryConfiguration(electionId, lotteryConfig, client) {
// //     // Implementation would depend on lottery table structure
// //     // This is a placeholder
// //     console.log('Updating lottery configuration for election:', electionId);
// //     return lotteryConfig;
// //   }

// //   async createSecuritySettings(electionId, securityConfig, client) {
// //     const securitySql = `
// //       INSERT INTO vottery_election_security_2 (
// //         election_id, encryption_enabled, digital_signatures_enabled,
// //         audit_trail_enabled, hash_algorithm, encryption_method,
// //         created_at, updated_at
// //       ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// //       RETURNING *
// //     `;

// //     const values = [
// //       electionId,
// //       securityConfig.encryption_enabled || true,
// //       securityConfig.digital_signatures || true,
// //       securityConfig.audit_trail || true,
// //       'sha256',
// //       'aes-256-gcm'
// //     ];

// //     const result = await client.query(securitySql, values);
// //     return result.rows[0];
// //   }

// //   async logElectionActivity(electionId, userId, action, details, client) {
// //     const logSql = `
// //       INSERT INTO vottery_election_audit_2 (
// //         election_id, user_id, action, details, ip_address,
// //         user_agent, created_at
// //       ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
// //     `;

// //     const values = [
// //       electionId,
// //       userId,
// //       action,
// //       JSON.stringify(details),
// //       null, // IP would be passed from request
// //       null  // User agent would be passed from request
// //     ];

// //     await client.query(logSql, values);
// //   }
// // }

// // export default new ElectionService();