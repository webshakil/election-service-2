import { body, param, query } from 'express-validator';
import { 
  VOTING_TYPES, 
  QUESTION_TYPES, 
  AUTHENTICATION_METHODS,
  PERMISSION_TYPES,
  PRICING_TYPES,
  PRIZE_TYPES 
} from '../config/constants.js';

// Validation for election creation
export const validateElectionCreation = [
  body('title')
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .trim(),

  body('voting_body_content')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Voting body content cannot exceed 10000 characters'),

  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .custom((value) => {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.start_date);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('timezone')
    .optional()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('Timezone must be a valid timezone string'),

  body('voting_type')
    .isIn(Object.values(VOTING_TYPES))
    .withMessage(`Voting type must be one of: ${Object.values(VOTING_TYPES).join(', ')}`),

  body('authentication_method')
    .optional()
    .isIn(Object.values(AUTHENTICATION_METHODS))
    .withMessage(`Authentication method must be one of: ${Object.values(AUTHENTICATION_METHODS).join(', ')}`),

  body('biometric_required')
    .optional()
    .isBoolean()
    .withMessage('Biometric required must be a boolean'),

  body('custom_voting_url')
    .optional()
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom URL can only contain letters, numbers, hyphens, and underscores'),

  body('is_content_creator_election')
    .optional()
    .isBoolean()
    .withMessage('Content creator election flag must be a boolean'),

  body('projected_revenue_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Projected revenue amount must be a positive number'),

  body('supported_languages')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Supported languages must be an array with at least one language'),

  // Questions validation
  body('questions')
    .optional()
    .isArray()
    .withMessage('Questions must be an array'),

  body('questions.*.question_text')
    .if(body('questions').exists())
    .isLength({ min: 3, max: 1000 })
    .withMessage('Question text must be between 3 and 1000 characters')
    .trim(),

  body('questions.*.question_type')
    .if(body('questions').exists())
    .isIn(Object.values(QUESTION_TYPES))
    .withMessage(`Question type must be one of: ${Object.values(QUESTION_TYPES).join(', ')}`),

  body('questions.*.answers')
    .if(body('questions').exists())
    .optional()
    .isArray()
    .withMessage('Question answers must be an array'),

  // Access control validation
  body('access_control.permission_type')
    .optional()
    .isIn(Object.values(PERMISSION_TYPES))
    .withMessage(`Permission type must be one of: ${Object.values(PERMISSION_TYPES).join(', ')}`),

  body('access_control.pricing_type')
    .optional()
    .isIn(Object.values(PRICING_TYPES))
    .withMessage(`Pricing type must be one of: ${Object.values(PRICING_TYPES).join(', ')}`),

  body('access_control.general_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('General fee must be a positive number'),

  body('access_control.processing_fee_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Processing fee percentage must be between 0 and 100'),

  body('access_control.max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),

  body('access_control.min_age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Min age must be between 13 and 120'),

  body('access_control.max_age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Max age must be between 13 and 120')
    .custom((value, { req }) => {
      const minAge = req.body.access_control?.min_age;
      if (minAge && value <= minAge) {
        throw new Error('Max age must be greater than min age');
      }
      return true;
    }),

  // Lottery validation
  body('lottery.lottery_enabled')
    .optional()
    .isBoolean()
    .withMessage('Lottery enabled must be a boolean'),

  body('lottery.prize_type')
    .if(body('lottery.lottery_enabled').equals(true))
    .isIn(Object.values(PRIZE_TYPES))
    .withMessage(`Prize type must be one of: ${Object.values(PRIZE_TYPES).join(', ')}`),

  body('lottery.monetary_amount')
    .if(body('lottery.prize_type').equals(PRIZE_TYPES.MONETARY))
    .isFloat({ min: 0.01 })
    .withMessage('Monetary amount must be greater than 0'),

  body('lottery.winner_count')
    .if(body('lottery.lottery_enabled').equals(true))
    .isInt({ min: 1, max: 100 })
    .withMessage('Winner count must be between 1 and 100'),

  body('lottery.projected_revenue_percentage')
    .if(body('lottery.prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
    .isFloat({ min: 1, max: 100 })
    .withMessage('Revenue percentage must be between 1 and 100'),

  // Branding validation
  body('branding.primary_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),

  body('branding.corporate_style_enabled')
    .optional()
    .isBoolean()
    .withMessage('Corporate style enabled must be a boolean'),

  body('branding.white_label_enabled')
    .optional()
    .isBoolean()
    .withMessage('White label enabled must be a boolean')
];

// Validation for election update
export const validateElectionUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .trim(),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.body.start_date) {
        const endDate = new Date(value);
        const startDate = new Date(req.body.start_date);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('voting_type')
    .optional()
    .isIn(Object.values(VOTING_TYPES))
    .withMessage(`Voting type must be one of: ${Object.values(VOTING_TYPES).join(', ')}`),

  body('custom_voting_url')
    .optional()
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom URL can only contain letters, numbers, hyphens, and underscores')
];

// Validation for branding update
export const validateBrandingUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('primary_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),

  body('secondary_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Secondary color must be a valid hex color'),

  body('background_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Background color must be a valid hex color'),

  body('text_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Text color must be a valid hex color'),

  body('font_family')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Font family must be between 3 and 100 characters'),

  body('corporate_style_enabled')
    .optional()
    .isBoolean()
    .withMessage('Corporate style enabled must be a boolean'),

  body('white_label_enabled')
    .optional()
    .isBoolean()
    .withMessage('White label enabled must be a boolean')
];

// Validation for access control update
export const validateAccessControlUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('permission_type')
    .optional()
    .isIn(Object.values(PERMISSION_TYPES))
    .withMessage(`Permission type must be one of: ${Object.values(PERMISSION_TYPES).join(', ')}`),

  body('pricing_type')
    .optional()
    .isIn(Object.values(PRICING_TYPES))
    .withMessage(`Pricing type must be one of: ${Object.values(PRICING_TYPES).join(', ')}`),

  body('general_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('General fee must be a positive number'),

  body('processing_fee_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Processing fee percentage must be between 0 and 100'),

  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),

  body('allowed_countries')
    .optional()
    .isArray()
    .withMessage('Allowed countries must be an array'),

  body('blocked_countries')
    .optional()
    .isArray()
    .withMessage('Blocked countries must be an array')
];

// Validation for security update
export const validateSecurityUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('encryption_enabled')
    .optional()
    .isBoolean()
    .withMessage('Encryption enabled must be a boolean'),

  body('digital_signatures_enabled')
    .optional()
    .isBoolean()
    .withMessage('Digital signatures enabled must be a boolean'),

  body('audit_trail_enabled')
    .optional()
    .isBoolean()
    .withMessage('Audit trail enabled must be a boolean'),

  body('biometric_required')
    .optional()
    .isBoolean()
    .withMessage('Biometric required must be a boolean'),

  body('anonymous_voting')
    .optional()
    .isBoolean()
    .withMessage('Anonymous voting must be a boolean'),

  body('session_timeout')
    .optional()
    .isInt({ min: 5, max: 720 })
    .withMessage('Session timeout must be between 5 and 720 minutes')
];

// Validation for custom URL generation
export const validateCustomUrl = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('custom_url')
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom URL can only contain letters, numbers, hyphens, and underscores')
];

// Validation for query parameters
export const validateElectionQuery = [
  query('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'cancelled'])
    .withMessage('Status must be one of: draft, active, completed, cancelled'),

  query('voting_type')
    .optional()
    .isIn(Object.values(VOTING_TYPES))
    .withMessage(`Voting type must be one of: ${Object.values(VOTING_TYPES).join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'start_date', 'end_date', 'title', 'total_votes'])
    .withMessage('Sort by must be one of: created_at, updated_at, start_date, end_date, title, total_votes'),

  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc')
];

export default {
  validateElectionCreation,
  validateElectionUpdate,
  validateBrandingUpdate,
  validateAccessControlUpdate,
  validateSecurityUpdate,
  validateCustomUrl,
  validateElectionQuery
};