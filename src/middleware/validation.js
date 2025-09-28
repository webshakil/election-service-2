import { validationResult as expressValidationResult } from 'express-validator';
import { ERROR_MESSAGES } from '../config/constants.js';

// Validation result middleware
export const validationResult = (req, res, next) => {
  const errors = expressValidationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
      error_count: formattedErrors.length
    });
  }

  next();
};

// Custom validation middleware for complex validations
export const customValidation = (validationFn) => {
  return async (req, res, next) => {
    try {
      const validationResult = await validationFn(req.body, req.params, req.query, req.user);
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message || ERROR_MESSAGES.VALIDATION_FAILED,
          code: 'CUSTOM_VALIDATION_ERROR',
          errors: validationResult.errors || [],
          details: validationResult.details
        });
      }

      // Attach validated data to request if provided
      if (validationResult.data) {
        req.validatedData = validationResult.data;
      }

      next();
    } catch (error) {
      console.error('Custom validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation processing error',
        code: 'VALIDATION_PROCESSING_ERROR'
      });
    }
  };
};

// File validation middleware
export const fileValidation = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    required = true,
    maxFiles = 1
  } = options;

  return (req, res, next) => {
    try {
      // Check if file is required
      if (required && !req.file && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'File is required',
          code: 'FILE_REQUIRED'
        });
      }

      // Skip validation if no file provided and not required
      if (!req.file && (!req.files || req.files.length === 0)) {
        return next();
      }

      const files = req.files || [req.file];

      // Check number of files
      if (files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxFiles} file(s) allowed`,
          code: 'TOO_MANY_FILES',
          max_files: maxFiles,
          received_files: files.length
        });
      }

      // Validate each file
      for (const file of files) {
        if (!file) continue;

        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: ERROR_MESSAGES.FILE_TOO_LARGE,
            code: 'FILE_TOO_LARGE',
            file_name: file.originalname,
            file_size: file.size,
            max_size: maxSize
          });
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_FILE_TYPE,
            code: 'INVALID_FILE_TYPE',
            file_name: file.originalname,
            file_type: file.mimetype,
            allowed_types: allowedTypes
          });
        }
      }

      next();
    } catch (error) {
      console.error('File validation error:', error);
      res.status(500).json({
        success: false,
        message: 'File validation error',
        code: 'FILE_VALIDATION_ERROR'
      });
    }
  };
};

// Date validation middleware
export const dateValidation = (dateFields = []) => {
  return (req, res, next) => {
    try {
      const errors = [];

      dateFields.forEach(fieldConfig => {
        const { field, required = false, futureOnly = false, pastOnly = false } = fieldConfig;
        const value = req.body[field];

        if (!value && required) {
          errors.push({
            field: field,
            message: `${field} is required`,
            code: 'DATE_REQUIRED'
          });
          return;
        }

        if (value) {
          const date = new Date(value);
          const now = new Date();

          // Check if valid date
          if (isNaN(date.getTime())) {
            errors.push({
              field: field,
              message: `${field} must be a valid date`,
              code: 'INVALID_DATE',
              value: value
            });
            return;
          }

          // Check future only
          if (futureOnly && date <= now) {
            errors.push({
              field: field,
              message: `${field} must be in the future`,
              code: 'DATE_MUST_BE_FUTURE',
              value: value
            });
          }

          // Check past only
          if (pastOnly && date >= now) {
            errors.push({
              field: field,
              message: `${field} must be in the past`,
              code: 'DATE_MUST_BE_PAST',
              value: value
            });
          }
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Date validation failed',
          code: 'DATE_VALIDATION_ERROR',
          errors: errors
        });
      }

      next();
    } catch (error) {
      console.error('Date validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Date validation processing error',
        code: 'DATE_VALIDATION_PROCESSING_ERROR'
      });
    }
  };
};

// Election status validation
export const electionStatusValidation = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { action } = req.body;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required',
        code: 'ELECTION_ID_REQUIRED'
      });
    }

    // Import here to avoid circular dependency
    const { query } = await import('../config/database.js');
    
    const electionQuery = `
      SELECT id, status, start_date, end_date, creator_id
      FROM vottery_elections_2
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await query(electionQuery, [electionId]);
    const election = result.rows[0];

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
        code: 'ELECTION_NOT_FOUND'
      });
    }

    // Validate status transitions based on action
    const validTransitions = {
      activate: ['draft'],
      pause: ['active'],
      resume: ['paused'],
      complete: ['active', 'paused'],
      cancel: ['draft', 'active', 'paused']
    };

    if (action && validTransitions[action]) {
      if (!validTransitions[action].includes(election.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot ${action} election with status '${election.status}'`,
          code: 'INVALID_STATUS_TRANSITION',
          current_status: election.status,
          valid_statuses: validTransitions[action]
        });
      }
    }

    // Attach election to request
    req.election = election;
    next();

  } catch (error) {
    console.error('Election status validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Election status validation error',
      code: 'ELECTION_STATUS_VALIDATION_ERROR'
    });
  }
};

// Question type validation
export const questionTypeValidation = (req, res, next) => {
  try {
    const { questions } = req.body;
    const { voting_type } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return next();
    }

    const errors = [];

    questions.forEach((question, index) => {
      const { question_type, options, min_selections, max_selections } = question;

      // Validate based on question type and voting type
      switch (question_type) {
        case 'multiple_choice':
          if (!options || !Array.isArray(options) || options.length < 2) {
            errors.push({
              field: `questions[${index}].options`,
              message: 'Multiple choice questions must have at least 2 options',
              code: 'INSUFFICIENT_OPTIONS'
            });
          }
          break;

        case 'image_based':
          if (!options || !Array.isArray(options) || options.length < 2) {
            errors.push({
              field: `questions[${index}].options`,
              message: 'Image-based questions must have at least 2 image options',
              code: 'INSUFFICIENT_IMAGE_OPTIONS'
            });
          }

          // Check if image URLs are provided
          options.forEach((option, optionIndex) => {
            if (!option.image_url) {
              errors.push({
                field: `questions[${index}].options[${optionIndex}].image_url`,
                message: 'Image URL is required for image-based options',
                code: 'IMAGE_URL_REQUIRED'
              });
            }
          });
          break;

        case 'comparison':
          if (!options || !Array.isArray(options) || options.length < 2) {
            errors.push({
              field: `questions[${index}].options`,
              message: 'Comparison questions must have at least 2 items to compare',
              code: 'INSUFFICIENT_COMPARISON_OPTIONS'
            });
          }
          break;

        case 'open_text':
          // Open text questions don't need pre-defined options
          break;

        default:
          errors.push({
            field: `questions[${index}].question_type`,
            message: 'Invalid question type',
            code: 'INVALID_QUESTION_TYPE',
            value: question_type
          });
      }

      // Validate voting type compatibility
      if (voting_type === 'approval' && max_selections && max_selections < 2) {
        errors.push({
          field: `questions[${index}].max_selections`,
          message: 'Approval voting requires at least 2 maximum selections',
          code: 'INVALID_APPROVAL_SELECTIONS'
        });
      }

      if (voting_type === 'ranked_choice' && question_type !== 'open_text') {
        if (!options || options.length < 2) {
          errors.push({
            field: `questions[${index}].options`,
            message: 'Ranked choice voting requires at least 2 options to rank',
            code: 'INSUFFICIENT_RANKING_OPTIONS'
          });
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Question type validation failed',
        code: 'QUESTION_TYPE_VALIDATION_ERROR',
        errors: errors
      });
    }

    next();
  } catch (error) {
    console.error('Question type validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Question type validation processing error',
      code: 'QUESTION_TYPE_VALIDATION_PROCESSING_ERROR'
    });
  }
};

// Pagination validation
export const paginationValidation = (req, res, next) => {
  try {
    const { limit = 20, offset = 0, page = 1 } = req.query;

    // Convert to numbers
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const pageNum = parseInt(page);

    // Validate limit
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 100',
        code: 'INVALID_LIMIT',
        value: limit
      });
    }

    // Validate offset
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Offset must be a non-negative number',
        code: 'INVALID_OFFSET',
        value: offset
      });
    }

    // Validate page
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive number',
        code: 'INVALID_PAGE',
        value: page
      });
    }

    // Calculate offset from page if needed
    const calculatedOffset = page > 1 ? (pageNum - 1) * limitNum : offsetNum;

    // Attach validated pagination to request
    req.pagination = {
      limit: limitNum,
      offset: calculatedOffset,
      page: pageNum
    };

    next();
  } catch (error) {
    console.error('Pagination validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Pagination validation error',
      code: 'PAGINATION_VALIDATION_ERROR'
    });
  }
};

// Sanitization middleware
export const sanitizeInput = (fields = []) => {
  return (req, res, next) => {
    try {
      fields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          // Basic sanitization - remove potential XSS
          req.body[field] = req.body[field]
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        }
      });

      next();
    } catch (error) {
      console.error('Input sanitization error:', error);
      res.status(500).json({
        success: false,
        message: 'Input sanitization error',
        code: 'SANITIZATION_ERROR'
      });
    }
  };
};

export default {
  validationResult,
  customValidation,
  fileValidation,
  dateValidation,
  electionStatusValidation,
  questionTypeValidation,
  paginationValidation,
  sanitizeInput
};