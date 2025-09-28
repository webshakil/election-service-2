import { body, param } from 'express-validator';
import { PRIZE_TYPES } from '../config/constants.js';

// Validation for lottery configuration
export const validateLotteryConfig = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('lottery_enabled')
    .optional()
    .isBoolean()
    .withMessage('Lottery enabled must be a boolean'),

  body('prize_type')
    .if(body('lottery_enabled').equals(true))
    .isIn(Object.values(PRIZE_TYPES))
    .withMessage(`Prize type must be one of: ${Object.values(PRIZE_TYPES).join(', ')}`),

  // Monetary prize validation
  body('monetary_amount')
    .if(body('prize_type').equals(PRIZE_TYPES.MONETARY))
    .isFloat({ min: 0.01 })
    .withMessage('Monetary amount must be greater than 0'),

  body('monetary_currency')
    .if(body('prize_type').equals(PRIZE_TYPES.MONETARY))
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code (e.g., USD)')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Currency must be uppercase 3-letter code'),

  // Non-monetary prize validation
  body('non_monetary_description')
    .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
    .isLength({ min: 10, max: 1000 })
    .withMessage('Non-monetary description must be between 10 and 1000 characters')
    .trim(),

  body('non_monetary_value_estimate')
    .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Non-monetary value estimate must be a positive number'),

  body('voucher_codes')
    .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
    .optional()
    .isArray()
    .withMessage('Voucher codes must be an array'),

  // Projected revenue validation
  body('projected_revenue_amount')
    .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
    .isFloat({ min: 1 })
    .withMessage('Projected revenue amount must be greater than 0'),

  body('projected_revenue_percentage')
    .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
    .isFloat({ min: 1, max: 100 })
    .withMessage('Revenue percentage must be between 1 and 100'),

  body('revenue_source')
    .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Revenue source must be between 1 and 100 characters')
    .trim(),

  // Winner configuration
  body('winner_count')
    .if(body('lottery_enabled').equals(true))
    .isInt({ min: 1, max: 100 })
    .withMessage('Winner count must be between 1 and 100'),

  body('prize_distribution')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Prize distribution must be an array')
    .custom((value) => {
      if (!Array.isArray(value)) return true;
      
      // Check if all ranks are present and valid
      const totalPercentage = value.reduce((sum, item) => {
        if (!item.rank || !item.percentage) {
          throw new Error('Each prize distribution item must have rank and percentage');
        }
        if (item.rank < 1 || item.percentage <= 0 || item.percentage > 100) {
          throw new Error('Invalid rank or percentage in prize distribution');
        }
        return sum + item.percentage;
      }, 0);

      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Prize distribution percentages must sum to 100%');
      }

      return true;
    }),

  // Lottery machine settings
  body('machine_visible')
    .optional()
    .isBoolean()
    .withMessage('Machine visible must be a boolean'),

  body('machine_animation_enabled')
    .optional()
    .isBoolean()
    .withMessage('Machine animation enabled must be a boolean'),

  body('machine_style')
    .optional()
    .isIn(['transparent_oval', 'classic_sphere', 'modern_cylinder'])
    .withMessage('Machine style must be one of: transparent_oval, classic_sphere, modern_cylinder'),

  body('ball_color_scheme')
    .optional()
    .isIn(['rainbow', 'monochrome', 'custom'])
    .withMessage('Ball color scheme must be one of: rainbow, monochrome, custom'),

  body('custom_ball_colors')
    .if(body('ball_color_scheme').equals('custom'))
    .isArray({ min: 1, max: 20 })
    .withMessage('Custom ball colors must be an array with 1-20 colors'),

  body('custom_ball_colors.*')
    .if(body('ball_color_scheme').equals('custom'))
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Each custom ball color must be a valid hex color'),

  // Trigger settings
  body('auto_trigger_at_election_end')
    .optional()
    .isBoolean()
    .withMessage('Auto trigger at election end must be a boolean'),

  body('lottery_trigger_time')
    .optional()
    .isISO8601()
    .withMessage('Lottery trigger time must be a valid ISO 8601 date')
    .custom((value) => {
      const triggerTime = new Date(value);
      const now = new Date();
      if (triggerTime <= now) {
        throw new Error('Lottery trigger time must be in the future');
      }
      return true;
    }),

  // Distribution settings
  body('distribution_method')
    .optional()
    .isIn(['automatic', 'manual', 'hybrid'])
    .withMessage('Distribution method must be one of: automatic, manual, hybrid'),

  body('distribution_threshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distribution threshold must be a positive number'),

  // Terms and conditions
  body('terms_acceptance_required')
    .optional()
    .isBoolean()
    .withMessage('Terms acceptance required must be a boolean'),

  body('lottery_terms_url')
    .optional()
    .isURL()
    .withMessage('Lottery terms URL must be a valid URL'),

  body('age_restriction')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age restriction must be between 13 and 120'),

  body('geographic_restrictions')
    .optional()
    .isArray()
    .withMessage('Geographic restrictions must be an array'),

  // Notification settings
  body('notification_settings')
    .optional()
    .isObject()
    .withMessage('Notification settings must be an object'),

  body('notification_settings.email_winners')
    .optional()
    .isBoolean()
    .withMessage('Email winners setting must be a boolean'),

  body('notification_settings.email_participants')
    .optional()
    .isBoolean()
    .withMessage('Email participants setting must be a boolean'),

  body('notification_settings.social_media_announcement')
    .optional()
    .isBoolean()
    .withMessage('Social media announcement setting must be a boolean'),

  body('notification_settings.in_app_notification')
    .optional()
    .isBoolean()
    .withMessage('In app notification setting must be a boolean'),

  // Content creator settings
  body('content_creator_announcement')
    .optional()
    .isObject()
    .withMessage('Content creator announcement must be an object'),

  body('content_creator_announcement.enabled')
    .optional()
    .isBoolean()
    .withMessage('Content creator announcement enabled must be a boolean'),

  body('content_creator_announcement.announcement_content')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Announcement content cannot exceed 1000 characters'),

  body('content_creator_announcement.follow_up_content_url')
    .optional()
    .isURL()
    .withMessage('Follow up content URL must be a valid URL')
];

// Validation for adding lottery participant
export const validateAddParticipant = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('participant_id')
    .isInt({ min: 1 })
    .withMessage('Participant ID must be a positive integer'),

  body('voting_id')
    .optional()
    .isUUID()
    .withMessage('Voting ID must be a valid UUID')
];

// Validation for lottery execution
export const validateLotteryExecution = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer')
];

// Validation for prize distribution
export const validatePrizeDistribution = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer')
];

// Validation for lottery scheduling
export const validateLotterySchedule = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('trigger_time')
    .isISO8601()
    .withMessage('Trigger time must be a valid ISO 8601 date')
    .custom((value) => {
      const triggerTime = new Date(value);
      const now = new Date();
      if (triggerTime <= now) {
        throw new Error('Trigger time must be in the future');
      }
      return true;
    })
];

export default {
  validateLotteryConfig,
  validateAddParticipant,
  validateLotteryExecution,
  validatePrizeDistribution,
  validateLotterySchedule
};
// import { body, param } from 'express-validator';
// import { PRIZE_TYPES } from '../config/constants.js';

// // Validation for lottery configuration
// export const validateLotteryConfig = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer'),

//   body('lottery_enabled')
//     .optional()
//     .isBoolean()
//     .withMessage('Lottery enabled must be a boolean'),

//   body('prize_type')
//     .if(body('lottery_enabled').equals(true))
//     .isIn(Object.values(PRIZE_TYPES))
//     .withMessage(`Prize type must be one of: ${Object.values(PRIZE_TYPES).join(', ')}`),

//   // Monetary prize validation
//   body('monetary_amount')
//     .if(body('prize_type').equals(PRIZE_TYPES.MONETARY))
//     .isFloat({ min: 0.01 })
//     .withMessage('Monetary amount must be greater than 0'),

//   body('monetary_currency')
//     .if(body('prize_type').equals(PRIZE_TYPES.MONETARY))
//     .isLength({ min: 3, max: 3 })
//     .withMessage('Currency must be a 3-character code (e.g., USD)')
//     .matches(/^[A-Z]{3}$/)
//     .withMessage('Currency must be uppercase 3-letter code'),

//   // Non-monetary prize validation
//   body('non_monetary_description')
//     .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
//     .isLength({ min: 10, max: 1000 })
//     .withMessage('Non-monetary description must be between 10 and 1000 characters')
//     .trim(),

//   body('non_monetary_value_estimate')
//     .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Non-monetary value estimate must be a positive number'),

//   body('voucher_codes')
//     .if(body('prize_type').equals(PRIZE_TYPES.NON_MONETARY))
//     .optional()
//     .isArray()
//     .withMessage('Voucher codes must be an array'),

//   // Projected revenue validation
//   body('projected_revenue_amount')
//     .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
//     .isFloat({ min: 1 })
//     .withMessage('Projected revenue amount must be greater than 0'),

//   body('projected_revenue_percentage')
//     .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
//     .isFloat({ min: 1, max: 100 })
//     .withMessage('Revenue percentage must be between 1 and 100'),

//   body('revenue_source')
//     .if(body('prize_type').equals(PRIZE_TYPES.PROJECTED_REVENUE))
//     .optional()
//     .isLength({ min: 1, max: 100 })
//     .withMessage('Revenue source must be between 1 and 100 characters')
//     .trim(),

//   // Winner configuration
//   body('winner_count')
//     .if(body('lottery_enabled').equals(true))
//     .isInt({ min: 1, max: 100 })
//     .withMessage('Winner count must be between 1 and 100'),

//   body('prize_distribution')
//     .optional()
//     .isArray({ min: 1 })
//     .withMessage('Prize distribution must be an array')
//     .custom((value) => {
//       if (!Array.isArray(value)) return true;
      
//       // Check if all ranks are present and valid
//       const totalPercentage = value.reduce((sum, item) => {
//         if (!item.rank || !item.percentage) {
//           throw new Error('Each prize distribution item must have rank and percentage');
//         }
//         if (item.rank < 1 || item.percentage <= 0 || item.percentage > 100) {
//           throw new Error('Invalid rank or percentage in prize distribution');
//         }
//         return sum + item.percentage;
//       }, 0);

//       if (Math.abs(totalPercentage - 100) > 0.01) {
//         throw new Error('Prize distribution percentages must sum to 100%');
//       }

//       return true;
//     }),

//   // Lottery machine settings
//   body('machine_visible')
//     .optional()
//     .isBoolean()
//     .withMessage('Machine visible must be a boolean'),

//   body('machine_animation_enabled')
//     .optional()
//     .isBoolean()
//     .withMessage('Machine animation enabled must be a boolean'),

//   body('machine_style')
//     .optional()
//     .isIn(['transparent_oval', 'classic_sphere', 'modern_cylinder'])
//     .withMessage('Machine style must be one of: transparent_oval, classic_sphere, modern_cylinder'),

//   body('ball_color_scheme')
//     .optional()
//     .isIn(['rainbow', 'monochrome', 'custom'])
//     .withMessage('Ball color scheme must be one of: rainbow, monochrome, custom'),

//   body('custom_ball_colors')
//     .if(body('ball_color_scheme').equals('custom'))
//     .isArray({ min: 1, max: 20 })
//     .withMessage('Custom ball colors must be an array with 1-20 colors'),

//   body('custom_ball_colors.*')
//     .if(body('ball_color_scheme').equals('custom'))
//     .matches(/^#[0-9A-Fa-f]{6}$/)
//     .withMessage('Each custom ball color must be a valid hex color'),

//   // Trigger settings
//   body('auto_trigger_at_election_end')
//     .optional()
//     .isBoolean()
//     .withMessage('Auto trigger at election end must be a boolean'),

//   body('lottery_trigger_time')
//     .optional()
//     .isISO8601()
//     .withMessage('Lottery trigger time must be a valid ISO 8601 date')
//     .custom((value) => {
//       const triggerTime = new Date(value);
//       const now = new Date();
//       if (triggerTime <= now) {
//         throw new Error('Lottery trigger time must be in the future');
//       }
//       return true;
//     }),

//   // Distribution settings
//   body('distribution_method')
//     .optional()
//     .isIn(['automatic', 'manual', 'hybrid'])
//     .withMessage('Distribution method must be one of: automatic, manual, hybrid'),

//   body('distribution_threshold')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Distribution threshold must be a positive number'),

//   // Terms and conditions
//   body('terms_acceptance_required')
//     .optional()
//     .isBoolean()
//     .withMessage('Terms acceptance required must be a boolean'),

//   body('lottery_terms_url')
//     .optional()
//     .isURL()
//     .withMessage('Lottery terms URL must be a valid URL'),

//   body('age_restriction')
//     .optional()
//     .isInt({ min: 13, max: 120 })
//     .withMessage('Age restriction must be between 13 and 120'),

//   body('geographic_restrictions')
//     .optional()
//     .isArray()
//     .withMessage('Geographic restrictions must be an array'),

//   // Notification settings
//   body('notification_settings')
//     .optional()
//     .isObject()
//     .withMessage('Notification settings must be an object'),

//   body('notification_settings.email_winners')
//     .optional()
//     .isBoolean()
//     .withMessage('Email winners setting must be a boolean'),

//   body('notification_settings.email_participants')
//     .optional()
//     .isBoolean()
//     .withMessage('Email participants setting must be a boolean'),

//   body('notification_settings.social_media_announcement')
//     .optional()
//     .isBoolean()
//     .withMessage('Social media announcement setting must be a boolean'),

//   body('notification_settings.in_app_notification')
//     .optional()
//     .isBoolean()
//     .withMessage('In app notification setting must be a boolean'),

//   // Content creator settings
//   body('content_creator_announcement')
//     .optional()
//     .isObject()
//     .withMessage('Content creator announcement must be an object'),

//   body('content_creator_announcement.enabled')
//     .optional()
//     .isBoolean()
//     .withMessage('Content creator announcement enabled must be a boolean'),

//   body('content_creator_announcement.announcement_content')
//     .optional()
//     .isLength({ max: 1000 })
//     .withMessage('Announcement content cannot exceed 1000 characters'),

//   body('content_creator_announcement.follow_up_content_url')
//     .optional()
//     .isURL()
//     .withMessage('Follow up content URL must be a valid URL')
// ];

// // Validation for adding lottery participant
// export const validateAddParticipant = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer'),

//   body('participant_id')
//     .isInt({ min: 1 })
//     .withMessage('Participant ID must be a positive integer'),

//   body('voting_id')
//     .optional()
//     .isUUID()
//     .withMessage('Voting ID must be a valid UUID')
// ];

// // Validation for lottery execution
// export const validateLotteryExecution = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer')
// ];

// // Validation for prize distribution
// export const validatePrizeDistribution = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer')
// ];

// // Validation for lottery scheduling
// export const validateLotterySchedule = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer'),

//   body('trigger_time')
//     .isISO8601()
//     .withMessage('Trigger time must be a valid ISO 8601 date')
//     .custom((value) => {
//       const triggerTime = new Date(value);
//       const now = new Date();
//       if (triggerTime <= now) {
//         throw new Error('Trigger time must be in the future');
//       }
//       return true;
//     })
// ];

// export default {
//   validateLotteryConfig,
//   validateAddParticipant,
//   validateLotteryExecution,
//   validatePrizeDistribution,
//   validateLotterySchedule
// };