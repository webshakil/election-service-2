import crypto from 'node:crypto';
import { VALIDATION_LIMITS, REGIONAL_ZONES } from '../config/constants.js';

// Generate unique ID
export const generateUniqueId = (prefix = '', length = 8) => {
  const randomString = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return prefix ? `${prefix}_${randomString}` : randomString;
};

// Generate secure random string
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string input
export const sanitizeString = (str, maxLength = null) => {
  if (!str || typeof str !== 'string') return '';
  
  let sanitized = str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Format date for database
export const formatDateForDB = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format time for database
export const formatTimeForDB = (time) => {
  if (!time) return null;
  return time.includes(':') ? time : `${time}:00`;
};

// Check if date is in future
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Check if date is in past
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Get regional zone by country code
export const getRegionalZone = (countryCode) => {
  const regionMapping = {
    // Region 1: US & Canada
    'US': REGIONAL_ZONES.REGION_1,
    'CA': REGIONAL_ZONES.REGION_1,
    
    // Region 2: Western Europe
    'GB': REGIONAL_ZONES.REGION_2,
    'FR': REGIONAL_ZONES.REGION_2,
    'DE': REGIONAL_ZONES.REGION_2,
    'IT': REGIONAL_ZONES.REGION_2,
    'ES': REGIONAL_ZONES.REGION_2,
    'NL': REGIONAL_ZONES.REGION_2,
    'BE': REGIONAL_ZONES.REGION_2,
    'CH': REGIONAL_ZONES.REGION_2,
    'AT': REGIONAL_ZONES.REGION_2,
    'SE': REGIONAL_ZONES.REGION_2,
    'NO': REGIONAL_ZONES.REGION_2,
    'DK': REGIONAL_ZONES.REGION_2,
    'FI': REGIONAL_ZONES.REGION_2,
    
    // Region 3: Eastern Europe & Russia
    'RU': REGIONAL_ZONES.REGION_3,
    'PL': REGIONAL_ZONES.REGION_3,
    'CZ': REGIONAL_ZONES.REGION_3,
    'HU': REGIONAL_ZONES.REGION_3,
    'SK': REGIONAL_ZONES.REGION_3,
    'RO': REGIONAL_ZONES.REGION_3,
    'BG': REGIONAL_ZONES.REGION_3,
    'HR': REGIONAL_ZONES.REGION_3,
    'SI': REGIONAL_ZONES.REGION_3,
    'EE': REGIONAL_ZONES.REGION_3,
    'LV': REGIONAL_ZONES.REGION_3,
    'LT': REGIONAL_ZONES.REGION_3,
    'UA': REGIONAL_ZONES.REGION_3,
    'BY': REGIONAL_ZONES.REGION_3,
    
    // Region 4: Africa
    'ZA': REGIONAL_ZONES.REGION_4,
    'NG': REGIONAL_ZONES.REGION_4,
    'EG': REGIONAL_ZONES.REGION_4,
    'KE': REGIONAL_ZONES.REGION_4,
    'GH': REGIONAL_ZONES.REGION_4,
    'MA': REGIONAL_ZONES.REGION_4,
    'TN': REGIONAL_ZONES.REGION_4,
    'ET': REGIONAL_ZONES.REGION_4,
    
    // Region 5: Latin America & Caribbean
    'BR': REGIONAL_ZONES.REGION_5,
    'MX': REGIONAL_ZONES.REGION_5,
    'AR': REGIONAL_ZONES.REGION_5,
    'CL': REGIONAL_ZONES.REGION_5,
    'CO': REGIONAL_ZONES.REGION_5,
    'PE': REGIONAL_ZONES.REGION_5,
    'VE': REGIONAL_ZONES.REGION_5,
    'EC': REGIONAL_ZONES.REGION_5,
    'UY': REGIONAL_ZONES.REGION_5,
    'PY': REGIONAL_ZONES.REGION_5,
    'BO': REGIONAL_ZONES.REGION_5,
    'CR': REGIONAL_ZONES.REGION_5,
    'PA': REGIONAL_ZONES.REGION_5,
    'DO': REGIONAL_ZONES.REGION_5,
    'JM': REGIONAL_ZONES.REGION_5,
    'TT': REGIONAL_ZONES.REGION_5,
    
    // Region 6: Middle East, Asia, Eurasia, Melanesia, Micronesia, Polynesia
    'IN': REGIONAL_ZONES.REGION_6,
    'PK': REGIONAL_ZONES.REGION_6,
    'BD': REGIONAL_ZONES.REGION_6,
    'LK': REGIONAL_ZONES.REGION_6,
    'NP': REGIONAL_ZONES.REGION_6,
    'MM': REGIONAL_ZONES.REGION_6,
    'TH': REGIONAL_ZONES.REGION_6,
    'VN': REGIONAL_ZONES.REGION_6,
    'KH': REGIONAL_ZONES.REGION_6,
    'LA': REGIONAL_ZONES.REGION_6,
    'MY': REGIONAL_ZONES.REGION_6,
    'ID': REGIONAL_ZONES.REGION_6,
    'PH': REGIONAL_ZONES.REGION_6,
    'SA': REGIONAL_ZONES.REGION_6,
    'AE': REGIONAL_ZONES.REGION_6,
    'QA': REGIONAL_ZONES.REGION_6,
    'KW': REGIONAL_ZONES.REGION_6,
    'BH': REGIONAL_ZONES.REGION_6,
    'OM': REGIONAL_ZONES.REGION_6,
    'JO': REGIONAL_ZONES.REGION_6,
    'LB': REGIONAL_ZONES.REGION_6,
    'IL': REGIONAL_ZONES.REGION_6,
    'TR': REGIONAL_ZONES.REGION_6,
    'IR': REGIONAL_ZONES.REGION_6,
    'IQ': REGIONAL_ZONES.REGION_6,
    'KZ': REGIONAL_ZONES.REGION_6,
    'UZ': REGIONAL_ZONES.REGION_6,
    'KG': REGIONAL_ZONES.REGION_6,
    'TJ': REGIONAL_ZONES.REGION_6,
    'TM': REGIONAL_ZONES.REGION_6,
    'AF': REGIONAL_ZONES.REGION_6,
    'MN': REGIONAL_ZONES.REGION_6,
    'FJ': REGIONAL_ZONES.REGION_6,
    'PG': REGIONAL_ZONES.REGION_6,
    'SB': REGIONAL_ZONES.REGION_6,
    'NC': REGIONAL_ZONES.REGION_6,
    'VU': REGIONAL_ZONES.REGION_6,
    'WS': REGIONAL_ZONES.REGION_6,
    'TO': REGIONAL_ZONES.REGION_6,
    'TV': REGIONAL_ZONES.REGION_6,
    'KI': REGIONAL_ZONES.REGION_6,
    'NR': REGIONAL_ZONES.REGION_6,
    'PW': REGIONAL_ZONES.REGION_6,
    'FM': REGIONAL_ZONES.REGION_6,
    'MH': REGIONAL_ZONES.REGION_6,
    
    // Region 7: Australasia
    'AU': REGIONAL_ZONES.REGION_7,
    'NZ': REGIONAL_ZONES.REGION_7,
    'TW': REGIONAL_ZONES.REGION_7,
    'KR': REGIONAL_ZONES.REGION_7,
    'JP': REGIONAL_ZONES.REGION_7,
    'SG': REGIONAL_ZONES.REGION_7,
    
    // Region 8: China, Macau & Hong Kong
    'CN': REGIONAL_ZONES.REGION_8,
    'HK': REGIONAL_ZONES.REGION_8,
    'MO': REGIONAL_ZONES.REGION_8
  };
  
  return regionMapping[countryCode] || REGIONAL_ZONES.REGION_6; // Default to Region 6
};

// Calculate pagination
export const calculatePagination = (page = 1, limit = 20, total = 0) => {
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    offset: parseInt(offset),
    total: parseInt(total),
    totalPages: parseInt(totalPages),
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// Generate slug from text
export const generateSlug = (text, maxLength = 50) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    checks: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar: hasNonalphas
    },
    score: [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasNonalphas
    ].filter(Boolean).length
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Deep merge objects
export const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
};

// Check if value is object
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Retry function with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Escape SQL string
export const escapeSQLString = (str) => {
  if (!str) return str;
  return str.replace(/'/g, "''");
};

// Generate random color
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// Convert timezone
export const convertTimezone = (date, fromTz, toTz) => {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: fromTz }));
  return new Date(utcDate.toLocaleString("en-US", { timeZone: toTz }));
};

// Validate election dates
export const validateElectionDates = (startDate, startTime, endDate, endTime) => {
  const errors = [];
  
  if (!startDate || !endDate) {
    errors.push('Start date and end date are required');
    return { isValid: false, errors };
  }
  
  const start = new Date(`${startDate}T${startTime || '00:00:00'}`);
  const end = new Date(`${endDate}T${endTime || '23:59:59'}`);
  const now = new Date();
  
  if (start >= end) {
    errors.push('End date must be after start date');
  }
  
  if (start <= now) {
    errors.push('Start date must be in the future');
  }
  
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    errors.push('Election duration cannot exceed 365 days');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    duration: {
      days: Math.floor(diffDays),
      hours: Math.floor((diffDays % 1) * 24)
    }
  };
};

// Hash sensitive data (one-way)
export const hashData = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(String(data)).digest('hex');
};

// Generate voting ID
export const generateVotingId = (electionId, userId) => {
  const timestamp = Date.now();
  const hash = crypto.createHash('sha256')
    .update(`${electionId}-${userId}-${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  return `vote_${hash}`;
};

export default {
  generateUniqueId,
  generateSecureToken,
  isValidEmail,
  sanitizeString,
  formatDateForDB,
  formatTimeForDB,
  isFutureDate,
  isPastDate,
  getRegionalZone,
  calculatePagination,
  generateSlug,
  validatePasswordStrength,
  formatFileSize,
  isValidUrl,
  deepMerge,
  isObject,
  retryWithBackoff,
  escapeSQLString,
  generateRandomColor,
  convertTimezone,
  validateElectionDates,
  hashData,
  generateVotingId
};