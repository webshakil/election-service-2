// Utility Constants - Additional constants for utility functions

export const URL_PATTERNS = {
  ELECTION_URL: /^[a-z0-9-]+$/,
  CUSTOM_URL: /^[a-zA-Z0-9-_]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

export const COUNTRY_CODES = {
  // Major countries for regional mapping
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  RU: 'Russia',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  SK: 'Slovakia',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SI: 'Slovenia',
  EE: 'Estonia',
  LV: 'Latvia',
  LT: 'Lithuania',
  UA: 'Ukraine',
  BY: 'Belarus',
  ZA: 'South Africa',
  NG: 'Nigeria',
  EG: 'Egypt',
  KE: 'Kenya',
  GH: 'Ghana',
  MA: 'Morocco',
  TN: 'Tunisia',
  ET: 'Ethiopia',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  VE: 'Venezuela',
  EC: 'Ecuador',
  UY: 'Uruguay',
  PY: 'Paraguay',
  BO: 'Bolivia',
  CR: 'Costa Rica',
  PA: 'Panama',
  DO: 'Dominican Republic',
  JM: 'Jamaica',
  TT: 'Trinidad and Tobago',
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  NP: 'Nepal',
  MM: 'Myanmar',
  TH: 'Thailand',
  VN: 'Vietnam',
  KH: 'Cambodia',
  LA: 'Laos',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  OM: 'Oman',
  JO: 'Jordan',
  LB: 'Lebanon',
  IL: 'Israel',
  TR: 'Turkey',
  IR: 'Iran',
  IQ: 'Iraq',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  KG: 'Kyrgyzstan',
  TJ: 'Tajikistan',
  TM: 'Turkmenistan',
  AF: 'Afghanistan',
  MN: 'Mongolia',
  AU: 'Australia',
  NZ: 'New Zealand',
  TW: 'Taiwan',
  KR: 'South Korea',
  JP: 'Japan',
  SG: 'Singapore',
  CN: 'China',
  HK: 'Hong Kong',
  MO: 'Macau'
};

export const TIMEZONE_MAPPINGS = {
  'UTC': 'Coordinated Universal Time',
  'EST': 'Eastern Standard Time',
  'CST': 'Central Standard Time',
  'MST': 'Mountain Standard Time',
  'PST': 'Pacific Standard Time',
  'GMT': 'Greenwich Mean Time',
  'CET': 'Central European Time',
  'EET': 'Eastern European Time',
  'JST': 'Japan Standard Time',
  'CST_CHINA': 'China Standard Time',
  'IST': 'India Standard Time',
  'AEST': 'Australian Eastern Standard Time'
};

export const LANGUAGE_NAMES = {
  'af': 'Afrikaans',
  'ar': 'Arabic',
  'bn': 'Bengali',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'zh-HK': 'Chinese (Hong Kong)',
  'en-US': 'English (US)',
  'en-UK': 'English (UK)',
  'en-IN': 'English (India)',
  'en-pirate': 'English (Pirate)',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'hi': 'Hindi',
  'sw': 'Swahili',
  'xh': 'Xhosa',
  'zu': 'Zulu',
  'da': 'Danish',
  'nl': 'Dutch',
  'fi': 'Finnish',
  'no': 'Norwegian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'el': 'Greek',
  'tr': 'Turkish',
  'he': 'Hebrew',
  'fa': 'Persian',
  'ur': 'Urdu',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'ca': 'Catalan',
  'eu': 'Basque',
  'gl': 'Galician',
  'cy': 'Welsh',
  'ga': 'Irish',
  'mt': 'Maltese',
  'is': 'Icelandic',
  'fo': 'Faroese',
  'lb': 'Luxembourgish',
  'rm': 'Romansh'
};

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  US_FORMAT: 'MM/DD/YYYY',
  EU_FORMAT: 'DD/MM/YYYY',
  TIME_24H: 'HH:mm:ss',
  TIME_12H: 'hh:mm:ss A',
  DISPLAY_DATE: 'MMMM D, YYYY',
  DISPLAY_DATETIME: 'MMMM D, YYYY [at] h:mm A'
};

export const MIME_TYPES = {
  // Images
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  
  // Videos
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  MOV: 'video/quicktime',
  AVI: 'video/x-msvideo',
  
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Other
  JSON: 'application/json',
  XML: 'application/xml',
  CSV: 'text/csv',
  TEXT: 'text/plain'
};

export const ENCRYPTION_ALGORITHMS = {
  AES_256_GCM: 'aes-256-gcm',
  AES_256_CBC: 'aes-256-cbc',
  RSA_OAEP: 'rsa-oaep',
  ECDH: 'ecdh'
};

export const HASH_FUNCTIONS = {
  SHA1: 'sha1',
  SHA256: 'sha256',
  SHA512: 'sha512',
  MD5: 'md5',
  BLAKE2B: 'blake2b'
};

export const REGEX_PATTERNS = {
  // Strong password: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // URL slug: lowercase letters, numbers, hyphens
  URL_SLUG: /^[a-z0-9-]+$/,
  
  // Hexadecimal color
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // IPv4 address
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  
  // Username: alphanumeric and underscore, 3-20 chars
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  
  // Credit card number (basic)
  CREDIT_CARD: /^\d{13,19}$/
};

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml'
};

export const CACHE_DURATIONS = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
  MONTH: 2629746 // 30.44 days
};

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly'
};

export const DATABASE_OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  LIKE: 'LIKE',
  ILIKE: 'ILIKE',
  IN: 'IN',
  NOT_IN: 'NOT IN',
  IS_NULL: 'IS NULL',
  IS_NOT_NULL: 'IS NOT NULL',
  BETWEEN: 'BETWEEN',
  EXISTS: 'EXISTS'
};

export const SORT_DIRECTIONS = {
  ASC: 'ASC',
  DESC: 'DESC'
};

export const API_RATE_LIMITS = {
  FREE_USER: 100,
  BASIC_USER: 500,
  PREMIUM_USER: 1000,
  ADMIN_USER: 5000,
  MANAGER_USER: 10000
};

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WEBHOOK: 'webhook'
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const CLOUDINARY_TRANSFORMATIONS = {
  THUMBNAIL: 'w_150,h_150,c_fill',
  MEDIUM: 'w_400,h_300,c_fill',
  LARGE: 'w_800,h_600,c_fill',
  PROFILE: 'w_200,h_200,c_fill,g_face',
  BANNER: 'w_1200,h_300,c_fill'
};

export const WEBHOOK_EVENTS = {
  ELECTION_CREATED: 'election.created',
  ELECTION_UPDATED: 'election.updated',
  ELECTION_DELETED: 'election.deleted',
  ELECTION_ACTIVATED: 'election.activated',
  ELECTION_COMPLETED: 'election.completed',
  VOTE_CAST: 'vote.cast',
  LOTTERY_DRAWN: 'lottery.drawn',
  WINNER_SELECTED: 'winner.selected'
};

export const CONTENT_CREATOR_INTEGRATION = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  TWITCH: 'twitch',
  CUSTOM: 'custom'
};

export const ANALYTICS_METRICS = {
  TOTAL_VOTES: 'total_votes',
  UNIQUE_VOTERS: 'unique_voters',
  COMPLETION_RATE: 'completion_rate',
  DROP_OFF_RATE: 'drop_off_rate',
  ENGAGEMENT_TIME: 'engagement_time',
  CONVERSION_RATE: 'conversion_rate',
  GEOGRAPHIC_DISTRIBUTION: 'geographic_distribution',
  DEVICE_BREAKDOWN: 'device_breakdown'
};

export const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  MAXIMUM: 'maximum'
};

export const BACKUP_TYPES = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
  DIFFERENTIAL: 'differential'
};

export const ELECTION_TEMPLATES = {
  POLITICAL: 'political',
  CORPORATE: 'corporate',
  EDUCATIONAL: 'educational',
  COMMUNITY: 'community',
  ENTERTAINMENT: 'entertainment',
  MARKET_RESEARCH: 'market_research',
  FEEDBACK: 'feedback',
  CUSTOM: 'custom'
};

export const VOTING_METHODS = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  RANKING: 'ranking',
  RATING: 'rating',
  APPROVAL: 'approval',
  OPEN_ENDED: 'open_ended'
};

export const PRIZE_DISTRIBUTION_METHODS = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  HYBRID: 'hybrid'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTOCURRENCY: 'cryptocurrency'
};

export const CURRENCY_CODES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  INR: 'INR',
  BRL: 'BRL',
  RUB: 'RUB',
  KRW: 'KRW',
  SGD: 'SGD',
  HKD: 'HKD'
};

export const TIME_UNITS = {
  SECOND: 'second',
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

export const FEATURE_FLAGS = {
  LOTTERY_SYSTEM: 'lottery_system',
  CONTENT_CREATOR_INTEGRATION: 'content_creator_integration',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  MULTI_LANGUAGE: 'multi_language',
  REAL_TIME_RESULTS: 'real_time_results',
  MOBILE_APP: 'mobile_app',
  API_ACCESS: 'api_access',
  WEBHOOK_SUPPORT: 'webhook_support'
};

export const ENVIRONMENT_TYPES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
};

export const SERVICE_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  MAINTENANCE: 'maintenance'
};

export const MONITORING_ALERTS = {
  HIGH_CPU: 'high_cpu',
  HIGH_MEMORY: 'high_memory',
  HIGH_ERROR_RATE: 'high_error_rate',
  SLOW_RESPONSE: 'slow_response',
  DATABASE_CONNECTION: 'database_connection',
  EXTERNAL_SERVICE: 'external_service'
};

// Export all constants as default
export default {
  URL_PATTERNS,
  COUNTRY_CODES,
  TIMEZONE_MAPPINGS,
  LANGUAGE_NAMES,
  HTTP_STATUS_CODES,
  DATE_FORMATS,
  MIME_TYPES,
  ENCRYPTION_ALGORITHMS,
  HASH_FUNCTIONS,
  REGEX_PATTERNS,
  CONTENT_TYPES,
  CACHE_DURATIONS,
  LOG_LEVELS,
  DATABASE_OPERATORS,
  SORT_DIRECTIONS,
  API_RATE_LIMITS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  CLOUDINARY_TRANSFORMATIONS,
  WEBHOOK_EVENTS,
  CONTENT_CREATOR_INTEGRATION,
  ANALYTICS_METRICS,
  SECURITY_LEVELS,
  BACKUP_TYPES,
  ELECTION_TEMPLATES,
  VOTING_METHODS,
  PRIZE_DISTRIBUTION_METHODS,
  PAYMENT_METHODS,
  CURRENCY_CODES,
  TIME_UNITS,
  FEATURE_FLAGS,
  ENVIRONMENT_TYPES,
  SERVICE_STATUS,
  MONITORING_ALERTS
};