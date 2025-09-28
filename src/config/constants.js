// Election Status Constants
export const ELECTION_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELETED: 'deleted'
};

// Voting Types
export const VOTING_TYPES = {
  PLURALITY: 'plurality',
  RANKED_CHOICE: 'ranked_choice',
  APPROVAL: 'approval'
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  OPEN_TEXT: 'open_text',
  IMAGE_BASED: 'image_based',
  COMPARISON: 'comparison'
};

// Authentication Methods
export const AUTHENTICATION_METHODS = {
  PASSKEY: 'passkey',
  OAUTH: 'oauth',
  MAGIC_LINK: 'magic_link',
  EMAIL_PASSWORD: 'email_password'
};

// User Types (based on vottery_user_management table)
export const USER_TYPES = {
  INDIVIDUAL_FREE: 'individual_free',
  INDIVIDUAL_SUBSCRIBED: 'individual_subscribed',
  ORGANIZATION_FREE: 'organization_free',
  ORGANIZATION_SUBSCRIBED: 'organization_subscribed',
  CONTENT_CREATOR: 'content_creator'
};

// Admin Roles (based on vottery_user_management table)
export const ADMIN_ROLES = {
  MANAGER: 'manager',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  AUDITOR: 'auditor',
  ANALYST: 'analyst',
  EDITOR: 'editor',
  SPONSOR: 'sponsor',
  ADVERTISER: 'advertiser'
};

// Permission Types
export const PERMISSION_TYPES = {
  WORLD_CITIZENS: 'world_citizens',
  REGISTERED_MEMBERS: 'registered_members',
  ORGANIZATION_MEMBERS: 'organization_members',
  COUNTRY_RESIDENTS: 'country_residents',
  SELECTED_COUNTRIES: 'selected_countries'
};

// Pricing Types
export const PRICING_TYPES = {
  FREE: 'free',
  PAID_GENERAL: 'paid_general',
  PAID_REGIONAL: 'paid_regional'
};

// Prize Types
export const PRIZE_TYPES = {
  MONETARY: 'monetary',
  NON_MONETARY: 'non_monetary',
  PROJECTED_REVENUE: 'projected_revenue'
};

// Subscription Limits
export const SUBSCRIPTION_LIMITS = {
  FREE_ELECTIONS: 3,
  FREE_MAX_PARTICIPANTS: 100,
  FREE_MAX_QUESTIONS: 5,
  SUBSCRIBED_UNLIMITED: -1
};

// Regional Zones for Pricing
export const REGIONAL_ZONES = {
  REGION_1: 'region_1', // US & Canada
  REGION_2: 'region_2', // Western Europe
  REGION_3: 'region_3', // Eastern Europe & Russia
  REGION_4: 'region_4', // Africa
  REGION_5: 'region_5', // Latin America & Caribbean
  REGION_6: 'region_6', // Middle East, Asia, Eurasia, Melanesia, Micronesia, & Polynesia
  REGION_7: 'region_7', // Australasia: Australia & New Zealand, Taiwan, South Korea, Japan, & Singapore
  REGION_8: 'region_8'  // China, Macau & Hong Kong
};

// Biometric Types
export const BIOMETRIC_TYPES = {
  NONE: 'none',
  FINGERPRINT: 'fingerprint',
  FACE_ID: 'face_id'
};

// Vote Statuses
export const VOTE_STATUSES = {
  CAST: 'cast',
  VERIFIED: 'verified',
  COUNTED: 'counted',
  INVALIDATED: 'invalidated'
};

// Lottery Statuses
export const LOTTERY_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Content Creator Stages
export const CONTENT_CREATOR_STAGES = {
  SUBSCRIPTION_ICON: 'subscription_icon',
  ICON_HIDDEN: 'icon_hidden',
  ICON_VISIBLE: 'icon_visible',
  VOTING_ACTIVE: 'voting_active',
  RESULTS_PUBLISHED: 'results_published'
};

// Supported Languages (subset of 70+ languages)
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
  AR: 'ar',
  HI: 'hi',
  BN: 'bn',
  UR: 'ur',
  FA: 'fa',
  TR: 'tr',
  NL: 'nl',
  SV: 'sv',
  NO: 'no',
  DA: 'da',
  FI: 'fi',
  PL: 'pl',
  CS: 'cs',
  SK: 'sk',
  HU: 'hu',
  RO: 'ro',
  BG: 'bg',
  HR: 'hr',
  SR: 'sr',
  UK: 'uk',
  EL: 'el',
  HE: 'he',
  TH: 'th',
  VI: 'vi',
  ID: 'id',
  MS: 'ms',
  TL: 'tl',
  SW: 'sw',
  AM: 'am',
  ZU: 'zu',
  XH: 'xh',
  AF: 'af'
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SUBSCRIPTION_REQUIRED: 'Active subscription required',
  ELECTION_NOT_ACTIVE: 'Election is not active',
  ALREADY_VOTED: 'User has already voted in this election',
  INVALID_VOTE_DATA: 'Invalid vote data provided',
  ELECTION_EXPIRED: 'Election has expired'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ELECTION_CREATED: 'Election created successfully',
  ELECTION_UPDATED: 'Election updated successfully',
  ELECTION_DELETED: 'Election deleted successfully',
  VOTE_CAST: 'Vote cast successfully',
  VOTE_UPDATED: 'Vote updated successfully',
  LOTTERY_EXECUTED: 'Lottery executed successfully'
};

// Database Table Names
export const TABLE_NAMES = {
  ELECTIONS: 'vottery_election_2_elections',
  QUESTIONS: 'vottery_election_2_questions',
  ANSWERS: 'vottery_election_2_answers',
  ELECTION_ACCESS: 'vottery_election_2_election_access',
  ELECTION_BRANDING: 'vottery_election_2_election_branding',
  ELECTION_LOTTERY: 'vottery_election_2_election_lottery',
  ELECTION_SECURITY: 'vottery_election_2_election_security',
  VOTES: 'vottery_election_2_votes',
  VOTE_ANSWERS: 'vottery_election_2_vote_answers',
  ONE_TIME_TOKENS: 'vottery_election_2_one_time_tokens',
  USER_MANAGEMENT: 'vottery_user_management'
};

// Image Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  MAX_IMAGES_PER_QUESTION: 50,
  MAX_ANSWERS_PER_QUESTION: 100,
  MAX_QUESTIONS_PER_ELECTION: 50
};

// Rate Limiting
export const RATE_LIMITS = {
  VOTE_ATTEMPTS_PER_HOUR: 5,
  ELECTION_CREATION_PER_DAY: 10,
  API_REQUESTS_PER_MINUTE: 100
};

export default {
  ELECTION_STATUSES,
  VOTING_TYPES,
  QUESTION_TYPES,
  AUTHENTICATION_METHODS,
  USER_TYPES,
  ADMIN_ROLES,
  PERMISSION_TYPES,
  PRICING_TYPES,
  PRIZE_TYPES,
  SUBSCRIPTION_LIMITS,
  REGIONAL_ZONES,
  BIOMETRIC_TYPES,
  VOTE_STATUSES,
  LOTTERY_STATUSES,
  CONTENT_CREATOR_STAGES,
  SUPPORTED_LANGUAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLE_NAMES,
  UPLOAD_LIMITS,
  RATE_LIMITS
};
// // Election Creation Constants

// export const ELECTION_STATUS = {
//   DRAFT: 'draft',
//   ACTIVE: 'active',
//   COMPLETED: 'completed',
//   CANCELLED: 'cancelled',
//   PAUSED: 'paused'
// };

// export const ELECTION_STATUSES = ELECTION_STATUS; // Alias for compatibility

// export const VOTING_TYPES = {
//   PLURALITY: 'plurality',
//   RANKED_CHOICE: 'ranked_choice',
//   APPROVAL: 'approval'
// };

// export const QUESTION_TYPES = {
//   MULTIPLE_CHOICE: 'multiple_choice',
//   OPEN_TEXT: 'open_text',
//   IMAGE_BASED: 'image_based',
//   COMPARISON: 'comparison'
// };

// export const USER_TYPES = {
//   INDIVIDUAL_FREE: 'individual_free',
//   INDIVIDUAL_SUBSCRIBED: 'individual_subscribed',
//   ORGANIZATION_FREE: 'organization_free',
//   ORGANIZATION_SUBSCRIBED: 'organization_subscribed',
//   VOTER: 'voter',
//   CONTENT_CREATOR: 'content_creator'
// };

// export const ADMIN_ROLES = {
//   MANAGER: 'manager',
//   ADMIN: 'admin',
//   MODERATOR: 'moderator',
//   AUDITOR: 'auditor',
//   EDITOR: 'editor',
//   ADVERTISER: 'advertiser',
//   ANALYST: 'analyst',
//   SPONSOR: 'sponsor'
// };

// export const SUBSCRIPTION_STATUS = {
//   ACTIVE: 'active',
//   INACTIVE: 'inactive',
//   EXPIRED: 'expired',
//   CANCELLED: 'cancelled',
//   PENDING: 'pending'
// };

// export const SUBSCRIPTION_PLANS = {
//   FREE: 'free',
//   PAY_AS_YOU_GO: 'pay_as_you_go',
//   MONTHLY: 'monthly',
//   QUARTERLY: 'quarterly',
//   SEMI_ANNUAL: 'semi_annual',
//   YEARLY: 'yearly'
// };

// export const PERMISSION_TYPES = {
//   REGISTERED_MEMBERS: 'registered_members',
//   WORLD_CITIZENS: 'world_citizens',
//   COUNTRY_RESIDENTS: 'country_residents',
//   SELECTED_COUNTRIES: 'selected_countries'
// };

// export const REGIONAL_ZONES = {
//   REGION_1: 'region_1', // US & Canada
//   REGION_2: 'region_2', // Western Europe
//   REGION_3: 'region_3', // Eastern Europe & Russia
//   REGION_4: 'region_4', // Africa
//   REGION_5: 'region_5', // Latin America & Caribbean
//   REGION_6: 'region_6', // Middle East, Asia, Eurasia, Melanesia, Micronesia, Polynesia
//   REGION_7: 'region_7', // Australasia
//   REGION_8: 'region_8'  // China, Macau & Hong Kong
// };

// export const PRICING_TYPES = {
//   FREE: 'free',
//   GENERAL_FEE: 'general_fee',
//   REGIONAL_FEE: 'regional_fee'
// };

// export const AUTHENTICATION_METHODS = {
//   PASSKEY: 'passkey',
//   OAUTH: 'oauth',
//   MAGIC_LINK: 'magic_link',
//   EMAIL_PASSWORD: 'email_password'
// };

// export const OAUTH_PROVIDERS = {
//   GOOGLE: 'google',
//   FACEBOOK: 'facebook',
//   TWITTER: 'twitter',
//   LINKEDIN: 'linkedin'
// };

// export const PRIZE_TYPES = {
//   MONETARY: 'monetary',
//   NON_MONETARY: 'non_monetary',
//   PROJECTED_REVENUE: 'projected_revenue'
// };

// export const BIOMETRIC_TYPES = {
//   NONE: 'none',
//   FINGERPRINT: 'fingerprint',
//   FACE_ID: 'face_id',
//   REQUIRED: 'required'
// };

// export const ENCRYPTION_TYPES = {
//   RSA: 'rsa',
//   ELGAMAL: 'elgamal',
//   AES: 'aes'
// };

// export const ENCRYPTION_ALGORITHMS = {
//   AES_256_GCM: 'aes-256-gcm',
//   AES_256_CBC: 'aes-256-cbc',
//   RSA_OAEP: 'rsa-oaep',
//   ECDH: 'ecdh'
// };

// export const HASH_ALGORITHMS = {
//   SHA256: 'sha256',
//   SHA512: 'sha512',
//   BLAKE2B: 'blake2b'
// };

// export const SUPPORTED_LANGUAGES = [
//   'af', 'ar', 'bn', 'zh-CN', 'zh-TW', 'zh-HK', 'en-US', 'en-UK', 'en-IN', 'en-pirate',
//   'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'hi', 'sw', 'xh', 'zu',
//   'da', 'nl', 'fi', 'no', 'sv', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr',
//   'sl', 'et', 'lv', 'lt', 'el', 'tr', 'he', 'fa', 'ur', 'th', 'vi', 'id',
//   'ms', 'tl', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'is', 'fo', 'lb', 'rm'
// ];

// export const CONTENT_CREATOR_STAGES = {
//   SUBSCRIPTION: 'subscription',
//   ICON_CREATION: 'icon_creation',
//   VISIBILITY_CONTROL: 'visibility_control',
//   PERSONALIZED_VOTING: 'personalized_voting',
//   LOTTERY_RESULTS: 'lottery_results'
// };

// export const VALIDATION_LIMITS = {
//   ELECTION_TITLE_MIN: 5,
//   ELECTION_TITLE_MAX: 200,
//   ELECTION_DESCRIPTION_MIN: 10,
//   ELECTION_DESCRIPTION_MAX: 5000,
//   QUESTION_TITLE_MIN: 5,
//   QUESTION_TITLE_MAX: 500,
//   QUESTION_DESCRIPTION_MAX: 2000,
//   ANSWER_TEXT_MIN: 1,
//   ANSWER_TEXT_MAX: 300,
//   ANSWER_OPTIONS_MIN: 2,
//   ANSWER_OPTIONS_MAX: 100,
//   COMPARISON_ITEMS_MIN: 2,
//   COMPARISON_ITEMS_MAX: 20,
//   IMAGE_OPTIONS_MIN: 2,
//   IMAGE_OPTIONS_MAX: 50,
//   OPEN_TEXT_MIN: 1,
//   OPEN_TEXT_MAX: 5000,
//   LOTTERY_WINNERS_MIN: 1,
//   LOTTERY_WINNERS_MAX: 100,
//   CUSTOM_URL_MIN: 5,
//   CUSTOM_URL_MAX: 100,
//   PRIZE_AMOUNT_MIN: 0.01,
//   PRIZE_AMOUNT_MAX: 1000000,
//   PROCESSING_FEE_MIN: 0,
//   PROCESSING_FEE_MAX: 30
// };

// export const FILE_LIMITS = {
//   MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//   MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
//   MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
//   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
//   ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
// };

// export const FILE_UPLOAD_LIMITS = FILE_LIMITS; // Alias for compatibility

// export const DEFAULT_SETTINGS = {
//   ELECTION_DURATION_DAYS: 7,
//   RESULTS_VISIBLE_DEFAULT: false,
//   VOTE_EDITING_ALLOWED_DEFAULT: false,
//   BIOMETRIC_REQUIRED_DEFAULT: false,
//   LOTTERY_ENABLED_DEFAULT: false,
//   PROCESSING_FEE_DEFAULT: 2.5, // 2.5%
//   DEFAULT_TIMEZONE: 'UTC',
//   DEFAULT_LANGUAGE: 'en-US',
//   MAX_FREE_ELECTIONS: 3,
//   MAX_FREE_PARTICIPANTS: 100
// };

// export const SUBSCRIPTION_LIMITS = {
//   FREE: {
//     MAX_ELECTIONS: 3,
//     MAX_PARTICIPANTS: 100,
//     MAX_QUESTIONS: 5,
//     MAX_OPTIONS: 10
//   },
//   SUBSCRIBED: {
//     MAX_ELECTIONS: -1, // Unlimited
//     MAX_PARTICIPANTS: -1, // Unlimited
//     MAX_QUESTIONS: -1, // Unlimited
//     MAX_OPTIONS: -1 // Unlimited
//   }
// };

// export const ERROR_CODES = {
//   VALIDATION_ERROR: 'VALIDATION_ERROR',
//   UNAUTHORIZED: 'UNAUTHORIZED',
//   FORBIDDEN: 'FORBIDDEN',
//   NOT_FOUND: 'NOT_FOUND',
//   CONFLICT: 'CONFLICT',
//   RATE_LIMIT: 'RATE_LIMIT',
//   UPLOAD_ERROR: 'UPLOAD_ERROR',
//   DATABASE_ERROR: 'DATABASE_ERROR',
//   ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
//   PAYMENT_ERROR: 'PAYMENT_ERROR'
// };

// export const SUCCESS_MESSAGES = {
//   ELECTION_CREATED: 'Election created successfully',
//   ELECTION_UPDATED: 'Election updated successfully',
//   ELECTION_DELETED: 'Election deleted successfully',
//   QUESTION_ADDED: 'Question added successfully',
//   IMAGE_UPLOADED: 'Image uploaded successfully',
//   LOTTERY_CONFIGURED: 'Lottery configured successfully'
// };

// export const ERROR_MESSAGES = {
//   INVALID_USER_TYPE: 'Invalid user type for this operation',
//   SUBSCRIPTION_REQUIRED: 'Subscription required for this feature',
//   INVALID_ELECTION_STATUS: 'Invalid election status for this operation',
//   ELECTION_NOT_FOUND: 'Election not found',
//   UNAUTHORIZED_ACCESS: 'Unauthorized access to this resource',
//   INVALID_VOTING_TYPE: 'Invalid voting type selected',
//   INVALID_QUESTION_TYPE: 'Invalid question type',
//   FILE_TOO_LARGE: 'File size exceeds maximum limit',
//   INVALID_FILE_TYPE: 'Invalid file type',
//   UPLOAD_FAILED: 'File upload failed',
//   DATABASE_CONNECTION_ERROR: 'Database connection error',
//   VALIDATION_FAILED: 'Validation failed'
// };

// export const AUDIT_ACTIONS = {
//   ELECTION_CREATED: 'election_created',
//   ELECTION_UPDATED: 'election_updated',
//   ELECTION_DELETED: 'election_deleted',
//   ELECTION_STATUS_CHANGED: 'election_status_changed',
//   QUESTION_ADDED: 'question_added',
//   QUESTION_UPDATED: 'question_updated',
//   QUESTION_DELETED: 'question_deleted',
//   IMAGE_UPLOADED: 'image_uploaded',
//   IMAGE_DELETED: 'image_deleted',
//   LOTTERY_CONFIGURED: 'lottery_configured',
//   ACCESS_SETTINGS_CHANGED: 'access_settings_changed'
// };

// export default {
//   ELECTION_STATUS,
//   VOTING_TYPES,
//   QUESTION_TYPES,
//   USER_TYPES,
//   ADMIN_ROLES,
//   SUBSCRIPTION_STATUS,
//   SUBSCRIPTION_PLANS,
//   PERMISSION_TYPES,
//   REGIONAL_ZONES,
//   PRICING_TYPES,
//   AUTHENTICATION_METHODS,
//   OAUTH_PROVIDERS,
//   PRIZE_TYPES,
//   BIOMETRIC_TYPES,
//   ENCRYPTION_TYPES,
//   ENCRYPTION_ALGORITHMS,
//   HASH_ALGORITHMS,
//   SUPPORTED_LANGUAGES,
//   CONTENT_CREATOR_STAGES,
//   VALIDATION_LIMITS,
//   FILE_LIMITS,
//   DEFAULT_SETTINGS,
//   ERROR_CODES,
//   SUCCESS_MESSAGES,
//   ERROR_MESSAGES,
//   AUDIT_ACTIONS
// };
// // Election Creation Constants

// export const ELECTION_STATUS = {
//   DRAFT: 'draft',
//   ACTIVE: 'active',
//   COMPLETED: 'completed',
//   CANCELLED: 'cancelled',
//   PAUSED: 'paused'
// };

// export const ELECTION_STATUSES = ELECTION_STATUS; // Alias for compatibility

// export const VOTING_TYPES = {
//   PLURALITY: 'plurality',
//   RANKED_CHOICE: 'ranked_choice',
//   APPROVAL: 'approval'
// };

// export const QUESTION_TYPES = {
//   MULTIPLE_CHOICE: 'multiple_choice',
//   OPEN_TEXT: 'open_text',
//   IMAGE_BASED: 'image_based',
//   COMPARISON: 'comparison'
// };

// export const USER_TYPES = {
//   INDIVIDUAL_FREE: 'individual_free',
//   INDIVIDUAL_SUBSCRIBED: 'individual_subscribed',
//   ORGANIZATION_FREE: 'organization_free',
//   ORGANIZATION_SUBSCRIBED: 'organization_subscribed',
//   VOTER: 'voter',
//   CONTENT_CREATOR: 'content_creator'
// };

// export const ADMIN_ROLES = {
//   MANAGER: 'manager',
//   ADMIN: 'admin',
//   MODERATOR: 'moderator',
//   AUDITOR: 'auditor',
//   EDITOR: 'editor',
//   ADVERTISER: 'advertiser',
//   ANALYST: 'analyst',
//   SPONSOR: 'sponsor'
// };

// export const SUBSCRIPTION_STATUS = {
//   ACTIVE: 'active',
//   INACTIVE: 'inactive',
//   EXPIRED: 'expired',
//   CANCELLED: 'cancelled',
//   PENDING: 'pending'
// };

// export const SUBSCRIPTION_PLANS = {
//   FREE: 'free',
//   PAY_AS_YOU_GO: 'pay_as_you_go',
//   MONTHLY: 'monthly',
//   QUARTERLY: 'quarterly',
//   SEMI_ANNUAL: 'semi_annual',
//   YEARLY: 'yearly'
// };

// export const PERMISSION_TYPES = {
//   REGISTERED_MEMBERS: 'registered_members',
//   WORLD_CITIZENS: 'world_citizens',
//   COUNTRY_RESIDENTS: 'country_residents',
//   SELECTED_COUNTRIES: 'selected_countries'
// };

// export const REGIONAL_ZONES = {
//   REGION_1: 'region_1', // US & Canada
//   REGION_2: 'region_2', // Western Europe
//   REGION_3: 'region_3', // Eastern Europe & Russia
//   REGION_4: 'region_4', // Africa
//   REGION_5: 'region_5', // Latin America & Caribbean
//   REGION_6: 'region_6', // Middle East, Asia, Eurasia, Melanesia, Micronesia, Polynesia
//   REGION_7: 'region_7', // Australasia
//   REGION_8: 'region_8'  // China, Macau & Hong Kong
// };

// export const PRICING_TYPES = {
//   FREE: 'free',
//   GENERAL_FEE: 'general_fee',
//   REGIONAL_FEE: 'regional_fee'
// };

// export const AUTHENTICATION_METHODS = {
//   PASSKEY: 'passkey',
//   OAUTH: 'oauth',
//   MAGIC_LINK: 'magic_link',
//   EMAIL_PASSWORD: 'email_password'
// };

// export const OAUTH_PROVIDERS = {
//   GOOGLE: 'google',
//   FACEBOOK: 'facebook',
//   TWITTER: 'twitter',
//   LINKEDIN: 'linkedin'
// };

// export const PRIZE_TYPES = {
//   MONETARY: 'monetary',
//   NON_MONETARY: 'non_monetary',
//   PROJECTED_REVENUE: 'projected_revenue'
// };

// export const BIOMETRIC_TYPES = {
//   NONE: 'none',
//   FINGERPRINT: 'fingerprint',
//   FACE_ID: 'face_id',
//   REQUIRED: 'required'
// };

// export const ENCRYPTION_TYPES = {
//   RSA: 'rsa',
//   ELGAMAL: 'elgamal',
//   AES: 'aes'
// };

// export const ENCRYPTION_ALGORITHMS = {
//   AES_256_GCM: 'aes-256-gcm',
//   AES_256_CBC: 'aes-256-cbc',
//   RSA_OAEP: 'rsa-oaep',
//   ECDH: 'ecdh'
// };

// export const HASH_ALGORITHMS = {
//   SHA256: 'sha256',
//   SHA512: 'sha512',
//   BLAKE2B: 'blake2b'
// };

// export const SUPPORTED_LANGUAGES = [
//   'af', 'ar', 'bn', 'zh-CN', 'zh-TW', 'zh-HK', 'en-US', 'en-UK', 'en-IN', 'en-pirate',
//   'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'hi', 'sw', 'xh', 'zu',
//   'da', 'nl', 'fi', 'no', 'sv', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr',
//   'sl', 'et', 'lv', 'lt', 'el', 'tr', 'he', 'fa', 'ur', 'th', 'vi', 'id',
//   'ms', 'tl', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'is', 'fo', 'lb', 'rm'
// ];

// export const CONTENT_CREATOR_STAGES = {
//   SUBSCRIPTION: 'subscription',
//   ICON_CREATION: 'icon_creation',
//   VISIBILITY_CONTROL: 'visibility_control',
//   PERSONALIZED_VOTING: 'personalized_voting',
//   LOTTERY_RESULTS: 'lottery_results'
// };

// export const VALIDATION_LIMITS = {
//   ELECTION_TITLE_MIN: 5,
//   ELECTION_TITLE_MAX: 200,
//   ELECTION_DESCRIPTION_MIN: 10,
//   ELECTION_DESCRIPTION_MAX: 5000,
//   QUESTION_TITLE_MIN: 5,
//   QUESTION_TITLE_MAX: 500,
//   QUESTION_DESCRIPTION_MAX: 2000,
//   ANSWER_TEXT_MIN: 1,
//   ANSWER_TEXT_MAX: 300,
//   ANSWER_OPTIONS_MIN: 2,
//   ANSWER_OPTIONS_MAX: 100,
//   COMPARISON_ITEMS_MIN: 2,
//   COMPARISON_ITEMS_MAX: 20,
//   IMAGE_OPTIONS_MIN: 2,
//   IMAGE_OPTIONS_MAX: 50,
//   OPEN_TEXT_MIN: 1,
//   OPEN_TEXT_MAX: 5000,
//   LOTTERY_WINNERS_MIN: 1,
//   LOTTERY_WINNERS_MAX: 100,
//   CUSTOM_URL_MIN: 5,
//   CUSTOM_URL_MAX: 100,
//   PRIZE_AMOUNT_MIN: 0.01,
//   PRIZE_AMOUNT_MAX: 1000000,
//   PROCESSING_FEE_MIN: 0,
//   PROCESSING_FEE_MAX: 30
// };

// export const FILE_LIMITS = {
//   MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//   MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
//   MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
//   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
//   ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
// };

// export const FILE_UPLOAD_LIMITS = FILE_LIMITS; // Alias for compatibility

// export const DEFAULT_SETTINGS = {
//   ELECTION_DURATION_DAYS: 7,
//   RESULTS_VISIBLE_DEFAULT: false,
//   VOTE_EDITING_ALLOWED_DEFAULT: false,
//   BIOMETRIC_REQUIRED_DEFAULT: false,
//   LOTTERY_ENABLED_DEFAULT: false,
//   PROCESSING_FEE_DEFAULT: 2.5, // 2.5%
//   DEFAULT_TIMEZONE: 'UTC',
//   DEFAULT_LANGUAGE: 'en-US',
//   MAX_FREE_ELECTIONS: 3,
//   MAX_FREE_PARTICIPANTS: 100
// };

// export const SUBSCRIPTION_LIMITS = {
//   FREE: {
//     MAX_ELECTIONS: 3,
//     MAX_PARTICIPANTS: 100,
//     MAX_QUESTIONS: 5,
//     MAX_OPTIONS: 10
//   },
//   SUBSCRIBED: {
//     MAX_ELECTIONS: -1, // Unlimited
//     MAX_PARTICIPANTS: -1, // Unlimited
//     MAX_QUESTIONS: -1, // Unlimited
//     MAX_OPTIONS: -1 // Unlimited
//   }
// };

// export const ERROR_CODES = {
//   VALIDATION_ERROR: 'VALIDATION_ERROR',
//   UNAUTHORIZED: 'UNAUTHORIZED',
//   FORBIDDEN: 'FORBIDDEN',
//   NOT_FOUND: 'NOT_FOUND',
//   CONFLICT: 'CONFLICT',
//   RATE_LIMIT: 'RATE_LIMIT',
//   UPLOAD_ERROR: 'UPLOAD_ERROR',
//   DATABASE_ERROR: 'DATABASE_ERROR',
//   ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
//   PAYMENT_ERROR: 'PAYMENT_ERROR'
// };

// export const SUCCESS_MESSAGES = {
//   ELECTION_CREATED: 'Election created successfully',
//   ELECTION_UPDATED: 'Election updated successfully',
//   ELECTION_DELETED: 'Election deleted successfully',
//   QUESTION_ADDED: 'Question added successfully',
//   IMAGE_UPLOADED: 'Image uploaded successfully',
//   LOTTERY_CONFIGURED: 'Lottery configured successfully'
// };

// export const ERROR_MESSAGES = {
//   INVALID_USER_TYPE: 'Invalid user type for this operation',
//   SUBSCRIPTION_REQUIRED: 'Subscription required for this feature',
//   INVALID_ELECTION_STATUS: 'Invalid election status for this operation',
//   ELECTION_NOT_FOUND: 'Election not found',
//   UNAUTHORIZED_ACCESS: 'Unauthorized access to this resource',
//   INVALID_VOTING_TYPE: 'Invalid voting type selected',
//   INVALID_QUESTION_TYPE: 'Invalid question type',
//   FILE_TOO_LARGE: 'File size exceeds maximum limit',
//   INVALID_FILE_TYPE: 'Invalid file type',
//   UPLOAD_FAILED: 'File upload failed',
//   DATABASE_CONNECTION_ERROR: 'Database connection error',
//   VALIDATION_FAILED: 'Validation failed'
// };

// export const AUDIT_ACTIONS = {
//   ELECTION_CREATED: 'election_created',
//   ELECTION_UPDATED: 'election_updated',
//   ELECTION_DELETED: 'election_deleted',
//   ELECTION_STATUS_CHANGED: 'election_status_changed',
//   QUESTION_ADDED: 'question_added',
//   QUESTION_UPDATED: 'question_updated',
//   QUESTION_DELETED: 'question_deleted',
//   IMAGE_UPLOADED: 'image_uploaded',
//   IMAGE_DELETED: 'image_deleted',
//   LOTTERY_CONFIGURED: 'lottery_configured',
//   ACCESS_SETTINGS_CHANGED: 'access_settings_changed'
// };

// export default {
//   ELECTION_STATUS,
//   VOTING_TYPES,
//   QUESTION_TYPES,
//   USER_TYPES,
//   ADMIN_ROLES,
//   SUBSCRIPTION_STATUS,
//   SUBSCRIPTION_PLANS,
//   PERMISSION_TYPES,
//   REGIONAL_ZONES,
//   PRICING_TYPES,
//   AUTHENTICATION_METHODS,
//   OAUTH_PROVIDERS,
//   PRIZE_TYPES,
//   BIOMETRIC_TYPES,
//   ENCRYPTION_TYPES,
//   ENCRYPTION_ALGORITHMS,
//   HASH_ALGORITHMS,
//   SUPPORTED_LANGUAGES,
//   CONTENT_CREATOR_STAGES,
//   VALIDATION_LIMITS,
//   FILE_LIMITS,
//   DEFAULT_SETTINGS,
//   ERROR_CODES,
//   SUCCESS_MESSAGES,
//   ERROR_MESSAGES,
//   AUDIT_ACTIONS
// };
// // Election Creation Constants

// export const ELECTION_STATUS = {
//   DRAFT: 'draft',
//   ACTIVE: 'active',
//   COMPLETED: 'completed',
//   CANCELLED: 'cancelled',
//   PAUSED: 'paused'
// };

// export const VOTING_TYPES = {
//   PLURALITY: 'plurality',
//   RANKED_CHOICE: 'ranked_choice',
//   APPROVAL: 'approval'
// };

// export const QUESTION_TYPES = {
//   MULTIPLE_CHOICE: 'multiple_choice',
//   OPEN_TEXT: 'open_text',
//   IMAGE_BASED: 'image_based',
//   COMPARISON: 'comparison'
// };

// export const USER_TYPES = {
//   INDIVIDUAL_FREE: 'individual_free',
//   INDIVIDUAL_SUBSCRIBED: 'individual_subscribed',
//   ORGANIZATION_FREE: 'organization_free',
//   ORGANIZATION_SUBSCRIBED: 'organization_subscribed',
//   VOTER: 'voter',
//   CONTENT_CREATOR: 'content_creator'
// };

// export const ADMIN_ROLES = {
//   MANAGER: 'manager',
//   ADMIN: 'admin',
//   MODERATOR: 'moderator',
//   AUDITOR: 'auditor',
//   EDITOR: 'editor',
//   ADVERTISER: 'advertiser',
//   ANALYST: 'analyst',
//   SPONSOR: 'sponsor'
// };

// export const SUBSCRIPTION_STATUS = {
//   ACTIVE: 'active',
//   INACTIVE: 'inactive',
//   EXPIRED: 'expired',
//   CANCELLED: 'cancelled',
//   PENDING: 'pending'
// };

// export const SUBSCRIPTION_PLANS = {
//   FREE: 'free',
//   PAY_AS_YOU_GO: 'pay_as_you_go',
//   MONTHLY: 'monthly',
//   QUARTERLY: 'quarterly',
//   SEMI_ANNUAL: 'semi_annual',
//   YEARLY: 'yearly'
// };

// export const PERMISSION_TYPES = {
//   REGISTERED_MEMBERS: 'registered_members',
//   WORLD_CITIZENS: 'world_citizens',
//   COUNTRY_RESIDENTS: 'country_residents',
//   SELECTED_COUNTRIES: 'selected_countries'
// };

// export const REGIONAL_ZONES = {
//   REGION_1: 'region_1', // US & Canada
//   REGION_2: 'region_2', // Western Europe
//   REGION_3: 'region_3', // Eastern Europe & Russia
//   REGION_4: 'region_4', // Africa
//   REGION_5: 'region_5', // Latin America & Caribbean
//   REGION_6: 'region_6', // Middle East, Asia, Eurasia, Melanesia, Micronesia, Polynesia
//   REGION_7: 'region_7', // Australasia
//   REGION_8: 'region_8'  // China, Macau & Hong Kong
// };

// export const PRICING_TYPES = {
//   FREE: 'free',
//   GENERAL_FEE: 'general_fee',
//   REGIONAL_FEE: 'regional_fee'
// };

// export const AUTHENTICATION_METHODS = {
//   PASSKEY: 'passkey',
//   OAUTH: 'oauth',
//   MAGIC_LINK: 'magic_link',
//   EMAIL_PASSWORD: 'email_password'
// };

// export const OAUTH_PROVIDERS = {
//   GOOGLE: 'google',
//   FACEBOOK: 'facebook',
//   TWITTER: 'twitter',
//   LINKEDIN: 'linkedin'
// };

// export const PRIZE_TYPES = {
//   MONETARY: 'monetary',
//   NON_MONETARY: 'non_monetary',
//   PROJECTED_REVENUE: 'projected_revenue'
// };

// export const BIOMETRIC_TYPES = {
//   NONE: 'none',
//   FINGERPRINT: 'fingerprint',
//   FACE_ID: 'face_id',
//   REQUIRED: 'required'
// };

// export const ENCRYPTION_TYPES = {
//   RSA: 'rsa',
//   ELGAMAL: 'elgamal',
//   AES: 'aes'
// };

// export const ENCRYPTION_ALGORITHMS = {
//   AES_256_GCM: 'aes-256-gcm',
//   AES_256_CBC: 'aes-256-cbc',
//   RSA_OAEP: 'rsa-oaep',
//   ECDH: 'ecdh'
// };

// export const HASH_ALGORITHMS = {
//   SHA256: 'sha256',
//   SHA512: 'sha512',
//   BLAKE2B: 'blake2b'
// };

// export const SUPPORTED_LANGUAGES = [
//   'af', 'ar', 'bn', 'zh-CN', 'zh-TW', 'zh-HK', 'en-US', 'en-UK', 'en-IN', 'en-pirate',
//   'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'hi', 'sw', 'xh', 'zu',
//   'da', 'nl', 'fi', 'no', 'sv', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr',
//   'sl', 'et', 'lv', 'lt', 'el', 'tr', 'he', 'fa', 'ur', 'th', 'vi', 'id',
//   'ms', 'tl', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'is', 'fo', 'lb', 'rm'
// ];

// export const CONTENT_CREATOR_STAGES = {
//   SUBSCRIPTION: 'subscription',
//   ICON_CREATION: 'icon_creation',
//   VISIBILITY_CONTROL: 'visibility_control',
//   PERSONALIZED_VOTING: 'personalized_voting',
//   LOTTERY_RESULTS: 'lottery_results'
// };

// export const VALIDATION_LIMITS = {
//   ELECTION_TITLE_MIN: 5,
//   ELECTION_TITLE_MAX: 200,
//   ELECTION_DESCRIPTION_MIN: 10,
//   ELECTION_DESCRIPTION_MAX: 5000,
//   QUESTION_TITLE_MIN: 5,
//   QUESTION_TITLE_MAX: 500,
//   QUESTION_DESCRIPTION_MAX: 2000,
//   ANSWER_TEXT_MIN: 1,
//   ANSWER_TEXT_MAX: 300,
//   ANSWER_OPTIONS_MIN: 2,
//   ANSWER_OPTIONS_MAX: 100,
//   COMPARISON_ITEMS_MIN: 2,
//   COMPARISON_ITEMS_MAX: 20,
//   IMAGE_OPTIONS_MIN: 2,
//   IMAGE_OPTIONS_MAX: 50,
//   OPEN_TEXT_MIN: 1,
//   OPEN_TEXT_MAX: 5000,
//   LOTTERY_WINNERS_MIN: 1,
//   LOTTERY_WINNERS_MAX: 100,
//   CUSTOM_URL_MIN: 5,
//   CUSTOM_URL_MAX: 100,
//   PRIZE_AMOUNT_MIN: 0.01,
//   PRIZE_AMOUNT_MAX: 1000000,
//   PROCESSING_FEE_MIN: 0,
//   PROCESSING_FEE_MAX: 30
// };

// export const FILE_LIMITS = {
//   MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//   MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
//   MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
//   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
//   ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
// };

// export const DEFAULT_SETTINGS = {
//   ELECTION_DURATION_DAYS: 7,
//   RESULTS_VISIBLE_DEFAULT: false,
//   VOTE_EDITING_ALLOWED_DEFAULT: false,
//   BIOMETRIC_REQUIRED_DEFAULT: false,
//   LOTTERY_ENABLED_DEFAULT: false,
//   PROCESSING_FEE_DEFAULT: 2.5, // 2.5%
//   DEFAULT_TIMEZONE: 'UTC',
//   DEFAULT_LANGUAGE: 'en-US',
//   MAX_FREE_ELECTIONS: 3,
//   MAX_FREE_PARTICIPANTS: 100
// };

// export const ERROR_CODES = {
//   VALIDATION_ERROR: 'VALIDATION_ERROR',
//   UNAUTHORIZED: 'UNAUTHORIZED',
//   FORBIDDEN: 'FORBIDDEN',
//   NOT_FOUND: 'NOT_FOUND',
//   CONFLICT: 'CONFLICT',
//   RATE_LIMIT: 'RATE_LIMIT',
//   UPLOAD_ERROR: 'UPLOAD_ERROR',
//   DATABASE_ERROR: 'DATABASE_ERROR',
//   ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
//   PAYMENT_ERROR: 'PAYMENT_ERROR'
// };

// export const SUCCESS_MESSAGES = {
//   ELECTION_CREATED: 'Election created successfully',
//   ELECTION_UPDATED: 'Election updated successfully',
//   ELECTION_DELETED: 'Election deleted successfully',
//   QUESTION_ADDED: 'Question added successfully',
//   IMAGE_UPLOADED: 'Image uploaded successfully',
//   LOTTERY_CONFIGURED: 'Lottery configured successfully'
// };

// export const ERROR_MESSAGES = {
//   INVALID_USER_TYPE: 'Invalid user type for this operation',
//   SUBSCRIPTION_REQUIRED: 'Subscription required for this feature',
//   INVALID_ELECTION_STATUS: 'Invalid election status for this operation',
//   ELECTION_NOT_FOUND: 'Election not found',
//   UNAUTHORIZED_ACCESS: 'Unauthorized access to this resource',
//   INVALID_VOTING_TYPE: 'Invalid voting type selected',
//   INVALID_QUESTION_TYPE: 'Invalid question type',
//   FILE_TOO_LARGE: 'File size exceeds maximum limit',
//   INVALID_FILE_TYPE: 'Invalid file type',
//   UPLOAD_FAILED: 'File upload failed',
//   DATABASE_CONNECTION_ERROR: 'Database connection error',
//   VALIDATION_FAILED: 'Validation failed'
// };

// export const AUDIT_ACTIONS = {
//   ELECTION_CREATED: 'election_created',
//   ELECTION_UPDATED: 'election_updated',
//   ELECTION_DELETED: 'election_deleted',
//   ELECTION_STATUS_CHANGED: 'election_status_changed',
//   QUESTION_ADDED: 'question_added',
//   QUESTION_UPDATED: 'question_updated',
//   QUESTION_DELETED: 'question_deleted',
//   IMAGE_UPLOADED: 'image_uploaded',
//   IMAGE_DELETED: 'image_deleted',
//   LOTTERY_CONFIGURED: 'lottery_configured',
//   ACCESS_SETTINGS_CHANGED: 'access_settings_changed'
// };

// export default {
//   ELECTION_STATUS,
//   VOTING_TYPES,
//   QUESTION_TYPES,
//   USER_TYPES,
//   ADMIN_ROLES,
//   SUBSCRIPTION_STATUS,
//   SUBSCRIPTION_PLANS,
//   PERMISSION_TYPES,
//   REGIONAL_ZONES,
//   PRICING_TYPES,
//   AUTHENTICATION_METHODS,
//   OAUTH_PROVIDERS,
//   PRIZE_TYPES,
//   BIOMETRIC_TYPES,
//   ENCRYPTION_TYPES,
//   ENCRYPTION_ALGORITHMS,
//   HASH_ALGORITHMS,
//   SUPPORTED_LANGUAGES,
//   CONTENT_CREATOR_STAGES,
//   VALIDATION_LIMITS,
//   FILE_LIMITS,
//   DEFAULT_SETTINGS,
//   ERROR_CODES,
//   SUCCESS_MESSAGES,
//   ERROR_MESSAGES,
//   AUDIT_ACTIONS
// };
// // // Election Creation Constants

// // export const ELECTION_STATUS = {
// //   DRAFT: 'draft',
// //   ACTIVE: 'active',
// //   COMPLETED: 'completed',
// //   CANCELLED: 'cancelled',
// //   PAUSED: 'paused'
// // };

// // export const VOTING_TYPES = {
// //   PLURALITY: 'plurality',
// //   RANKED_CHOICE: 'ranked_choice',
// //   APPROVAL: 'approval'
// // };

// // export const QUESTION_TYPES = {
// //   MULTIPLE_CHOICE: 'multiple_choice',
// //   OPEN_TEXT: 'open_text',
// //   IMAGE_BASED: 'image_based',
// //   COMPARISON: 'comparison'
// // };

// // export const USER_TYPES = {
// //   INDIVIDUAL_FREE: 'individual_free',
// //   INDIVIDUAL_SUBSCRIBED: 'individual_subscribed',
// //   ORGANIZATION_FREE: 'organization_free',
// //   ORGANIZATION_SUBSCRIBED: 'organization_subscribed',
// //   VOTER: 'voter',
// //   CONTENT_CREATOR: 'content_creator'
// // };

// // export const ADMIN_ROLES = {
// //   MANAGER: 'manager',
// //   ADMIN: 'admin',
// //   MODERATOR: 'moderator',
// //   AUDITOR: 'auditor',
// //   EDITOR: 'editor',
// //   ADVERTISER: 'advertiser',
// //   ANALYST: 'analyst',
// //   SPONSOR: 'sponsor'
// // };

// // export const SUBSCRIPTION_STATUS = {
// //   ACTIVE: 'active',
// //   INACTIVE: 'inactive',
// //   EXPIRED: 'expired',
// //   CANCELLED: 'cancelled',
// //   PENDING: 'pending'
// // };

// // export const SUBSCRIPTION_PLANS = {
// //   FREE: 'free',
// //   PAY_AS_YOU_GO: 'pay_as_you_go',
// //   MONTHLY: 'monthly',
// //   QUARTERLY: 'quarterly',
// //   SEMI_ANNUAL: 'semi_annual',
// //   YEARLY: 'yearly'
// // };

// // export const PERMISSION_TYPES = {
// //   REGISTERED_MEMBERS: 'registered_members',
// //   WORLD_CITIZENS: 'world_citizens',
// //   COUNTRY_RESIDENTS: 'country_residents',
// //   SELECTED_COUNTRIES: 'selected_countries'
// // };

// // export const REGIONAL_ZONES = {
// //   REGION_1: 'region_1', // US & Canada
// //   REGION_2: 'region_2', // Western Europe
// //   REGION_3: 'region_3', // Eastern Europe & Russia
// //   REGION_4: 'region_4', // Africa
// //   REGION_5: 'region_5', // Latin America & Caribbean
// //   REGION_6: 'region_6', // Middle East, Asia, Eurasia, Melanesia, Micronesia, Polynesia
// //   REGION_7: 'region_7', // Australasia
// //   REGION_8: 'region_8'  // China, Macau & Hong Kong
// // };

// // export const PRICING_TYPES = {
// //   FREE: 'free',
// //   GENERAL_FEE: 'general_fee',
// //   REGIONAL_FEE: 'regional_fee'
// // };

// // export const AUTHENTICATION_METHODS = {
// //   PASSKEY: 'passkey',
// //   OAUTH: 'oauth',
// //   MAGIC_LINK: 'magic_link',
// //   EMAIL_PASSWORD: 'email_password'
// // };

// // export const OAUTH_PROVIDERS = {
// //   GOOGLE: 'google',
// //   FACEBOOK: 'facebook',
// //   TWITTER: 'twitter',
// //   LINKEDIN: 'linkedin'
// // };

// // export const PRIZE_TYPES = {
// //   MONETARY: 'monetary',
// //   NON_MONETARY: 'non_monetary',
// //   PROJECTED_REVENUE: 'projected_revenue'
// // };

// // export const BIOMETRIC_TYPES = {
// //   NONE: 'none',
// //   FINGERPRINT: 'fingerprint',
// //   FACE_ID: 'face_id',
// //   REQUIRED: 'required'
// // };

// // export const ENCRYPTION_TYPES = {
// //   RSA: 'rsa',
// //   ELGAMAL: 'elgamal',
// //   AES: 'aes'
// // };

// // export const HASH_ALGORITHMS = {
// //   SHA256: 'sha256',
// //   SHA512: 'sha512',
// //   BLAKE2B: 'blake2b'
// // };

// // export const SUPPORTED_LANGUAGES = [
// //   'af', 'ar', 'bn', 'zh-CN', 'zh-TW', 'zh-HK', 'en-US', 'en-UK', 'en-IN', 'en-pirate',
// //   'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'hi', 'sw', 'xh', 'zu',
// //   'da', 'nl', 'fi', 'no', 'sv', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr',
// //   'sl', 'et', 'lv', 'lt', 'el', 'tr', 'he', 'fa', 'ur', 'th', 'vi', 'id',
// //   'ms', 'tl', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'is', 'fo', 'lb', 'rm'
// // ];

// // export const CONTENT_CREATOR_STAGES = {
// //   SUBSCRIPTION: 'subscription',
// //   ICON_CREATION: 'icon_creation',
// //   VISIBILITY_CONTROL: 'visibility_control',
// //   PERSONALIZED_VOTING: 'personalized_voting',
// //   LOTTERY_RESULTS: 'lottery_results'
// // };

// // export const VALIDATION_LIMITS = {
// //   ELECTION_TITLE_MIN: 5,
// //   ELECTION_TITLE_MAX: 200,
// //   ELECTION_DESCRIPTION_MIN: 10,
// //   ELECTION_DESCRIPTION_MAX: 5000,
// //   QUESTION_TITLE_MIN: 5,
// //   QUESTION_TITLE_MAX: 500,
// //   QUESTION_DESCRIPTION_MAX: 2000,
// //   ANSWER_TEXT_MIN: 1,
// //   ANSWER_TEXT_MAX: 300,
// //   ANSWER_OPTIONS_MIN: 2,
// //   ANSWER_OPTIONS_MAX: 100,
// //   COMPARISON_ITEMS_MIN: 2,
// //   COMPARISON_ITEMS_MAX: 20,
// //   IMAGE_OPTIONS_MIN: 2,
// //   IMAGE_OPTIONS_MAX: 50,
// //   OPEN_TEXT_MIN: 1,
// //   OPEN_TEXT_MAX: 5000,
// //   LOTTERY_WINNERS_MIN: 1,
// //   LOTTERY_WINNERS_MAX: 100,
// //   CUSTOM_URL_MIN: 5,
// //   CUSTOM_URL_MAX: 100,
// //   PRIZE_AMOUNT_MIN: 0.01,
// //   PRIZE_AMOUNT_MAX: 1000000,
// //   PROCESSING_FEE_MIN: 0,
// //   PROCESSING_FEE_MAX: 30
// // };

// // export const FILE_LIMITS = {
// //   MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
// //   MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
// //   MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
// //   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
// //   ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
// // };

// // export const DEFAULT_SETTINGS = {
// //   ELECTION_DURATION_DAYS: 7,
// //   RESULTS_VISIBLE_DEFAULT: false,
// //   VOTE_EDITING_ALLOWED_DEFAULT: false,
// //   BIOMETRIC_REQUIRED_DEFAULT: false,
// //   LOTTERY_ENABLED_DEFAULT: false,
// //   PROCESSING_FEE_DEFAULT: 2.5, // 2.5%
// //   DEFAULT_TIMEZONE: 'UTC',
// //   DEFAULT_LANGUAGE: 'en-US',
// //   MAX_FREE_ELECTIONS: 3,
// //   MAX_FREE_PARTICIPANTS: 100
// // };

// // export const ERROR_CODES = {
// //   VALIDATION_ERROR: 'VALIDATION_ERROR',
// //   UNAUTHORIZED: 'UNAUTHORIZED',
// //   FORBIDDEN: 'FORBIDDEN',
// //   NOT_FOUND: 'NOT_FOUND',
// //   CONFLICT: 'CONFLICT',
// //   RATE_LIMIT: 'RATE_LIMIT',
// //   UPLOAD_ERROR: 'UPLOAD_ERROR',
// //   DATABASE_ERROR: 'DATABASE_ERROR',
// //   ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
// //   PAYMENT_ERROR: 'PAYMENT_ERROR'
// // };

// // export const SUCCESS_MESSAGES = {
// //   ELECTION_CREATED: 'Election created successfully',
// //   ELECTION_UPDATED: 'Election updated successfully',
// //   ELECTION_DELETED: 'Election deleted successfully',
// //   QUESTION_ADDED: 'Question added successfully',
// //   IMAGE_UPLOADED: 'Image uploaded successfully',
// //   LOTTERY_CONFIGURED: 'Lottery configured successfully'
// // };

// // export const ERROR_MESSAGES = {
// //   INVALID_USER_TYPE: 'Invalid user type for this operation',
// //   SUBSCRIPTION_REQUIRED: 'Subscription required for this feature',
// //   INVALID_ELECTION_STATUS: 'Invalid election status for this operation',
// //   ELECTION_NOT_FOUND: 'Election not found',
// //   UNAUTHORIZED_ACCESS: 'Unauthorized access to this resource',
// //   INVALID_VOTING_TYPE: 'Invalid voting type selected',
// //   INVALID_QUESTION_TYPE: 'Invalid question type',
// //   FILE_TOO_LARGE: 'File size exceeds maximum limit',
// //   INVALID_FILE_TYPE: 'Invalid file type',
// //   UPLOAD_FAILED: 'File upload failed',
// //   DATABASE_CONNECTION_ERROR: 'Database connection error',
// //   VALIDATION_FAILED: 'Validation failed'
// // };

// // export const AUDIT_ACTIONS = {
// //   ELECTION_CREATED: 'election_created',
// //   ELECTION_UPDATED: 'election_updated',
// //   ELECTION_DELETED: 'election_deleted',
// //   ELECTION_STATUS_CHANGED: 'election_status_changed',
// //   QUESTION_ADDED: 'question_added',
// //   QUESTION_UPDATED: 'question_updated',
// //   QUESTION_DELETED: 'question_deleted',
// //   IMAGE_UPLOADED: 'image_uploaded',
// //   IMAGE_DELETED: 'image_deleted',
// //   LOTTERY_CONFIGURED: 'lottery_configured',
// //   ACCESS_SETTINGS_CHANGED: 'access_settings_changed'
// // };

// // export default {
// //   ELECTION_STATUS,
// //   VOTING_TYPES,
// //   QUESTION_TYPES,
// //   USER_TYPES,
// //   ADMIN_ROLES,
// //   SUBSCRIPTION_STATUS,
// //   SUBSCRIPTION_PLANS,
// //   PERMISSION_TYPES,
// //   REGIONAL_ZONES,
// //   PRICING_TYPES,
// //   AUTHENTICATION_METHODS,
// //   OAUTH_PROVIDERS,
// //   PRIZE_TYPES,
// //   BIOMETRIC_TYPES,
// //   ENCRYPTION_TYPES,
// //   HASH_ALGORITHMS,
// //   SUPPORTED_LANGUAGES,
// //   CONTENT_CREATOR_STAGES,
// //   VALIDATION_LIMITS,
// //   FILE_LIMITS,
// //   DEFAULT_SETTINGS,
// //   ERROR_CODES,
// //   SUCCESS_MESSAGES,
// //   ERROR_MESSAGES,
// //   AUDIT_ACTIONS
// // };