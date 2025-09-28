import crypto from 'node:crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or generate
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('⚠️ ENCRYPTION_KEY not found in environment variables');
    // Generate a key for development (NOT for production)
    return crypto.randomBytes(KEY_LENGTH);
  }
  
  // If key is provided as hex string, convert to buffer
  if (key.length === KEY_LENGTH * 2) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is provided as string, hash it to get consistent key
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
};

// Encrypt sensitive data
export const encryptSensitiveData = (data) => {
  try {
    if (!data) {
      throw new Error('No data provided for encryption');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setIV(iv);

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

// Decrypt sensitive data
export const decryptSensitiveData = (encryptedData) => {
  try {
    if (!encryptedData || !encryptedData.encrypted) {
      throw new Error('Invalid encrypted data provided');
    }

    const key = getEncryptionKey();
    const decipher = crypto.createDecipher(encryptedData.algorithm || ALGORITHM, key);
    
    if (encryptedData.iv) {
      decipher.setIV(Buffer.from(encryptedData.iv, 'hex'));
    }
    
    if (encryptedData.authTag) {
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    }

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
};

// Hash data (one-way)
export const hashData = (data, algorithm = 'sha256') => {
  try {
    const hash = crypto.createHash(algorithm);
    hash.update(typeof data === 'string' ? data : JSON.stringify(data));
    return hash.digest('hex');
  } catch (error) {
    console.error('❌ Hash error:', error);
    throw new Error('Failed to hash data');
  }
};

// Generate secure random string
export const generateSecureToken = (length = 32) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    console.error('❌ Token generation error:', error);
    throw new Error('Failed to generate secure token');
  }
};

// Generate cryptographic salt
export const generateSalt = (length = SALT_LENGTH) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    console.error('❌ Salt generation error:', error);
    throw new Error('Failed to generate salt');
  }
};

// Key derivation function
export const deriveKey = (password, salt, iterations = 10000, keyLength = KEY_LENGTH) => {
  try {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  } catch (error) {
    console.error('❌ Key derivation error:', error);
    throw new Error('Failed to derive key');
  }
};

// Encrypt with password-based key
export const encryptWithPassword = (data, password) => {
  try {
    const salt = generateSalt();
    const key = deriveKey(password, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setIV(iv);

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      salt,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('❌ Password encryption error:', error);
    throw new Error('Failed to encrypt with password');
  }
};

// Decrypt with password-based key
export const decryptWithPassword = (encryptedData, password) => {
  try {
    const key = deriveKey(password, encryptedData.salt);
    const decipher = crypto.createDecipher(encryptedData.algorithm || ALGORITHM, key);
    
    decipher.setIV(Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('❌ Password decryption error:', error);
    throw new Error('Failed to decrypt with password');
  }
};

// Generate RSA key pair
export const generateRSAKeyPair = (keySize = 2048) => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  } catch (error) {
    console.error('❌ RSA key generation error:', error);
    throw new Error('Failed to generate RSA key pair');
  }
};

// RSA encrypt
export const rsaEncrypt = (data, publicKey) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(dataString));
    return encrypted.toString('base64');
  } catch (error) {
    console.error('❌ RSA encryption error:', error);
    throw new Error('Failed to RSA encrypt data');
  }
};

// RSA decrypt
export const rsaDecrypt = (encryptedData, privateKey) => {
  try {
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
    const dataString = decrypted.toString('utf8');
    
    try {
      return JSON.parse(dataString);
    } catch {
      return dataString;
    }
  } catch (error) {
    console.error('❌ RSA decryption error:', error);
    throw new Error('Failed to RSA decrypt data');
  }
};

// Digital signature
export const createDigitalSignature = (data, privateKey) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataString);
    return sign.sign(privateKey, 'hex');
  } catch (error) {
    console.error('❌ Digital signature error:', error);
    throw new Error('Failed to create digital signature');
  }
};

// Verify digital signature
export const verifyDigitalSignature = (data, signature, publicKey) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(dataString);
    return verify.verify(publicKey, signature, 'hex');
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
};

// HMAC generation
export const generateHMAC = (data, secret, algorithm = 'sha256') => {
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(typeof data === 'string' ? data : JSON.stringify(data));
    return hmac.digest('hex');
  } catch (error) {
    console.error('❌ HMAC generation error:', error);
    throw new Error('Failed to generate HMAC');
  }
};

// Verify HMAC
export const verifyHMAC = (data, expectedHMAC, secret, algorithm = 'sha256') => {
  try {
    const calculatedHMAC = generateHMAC(data, secret, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHMAC, 'hex'),
      Buffer.from(expectedHMAC, 'hex')
    );
  } catch (error) {
    console.error('❌ HMAC verification error:', error);
    return false;
  }
};

// Secure compare (timing attack resistant)
export const secureCompare = (a, b) => {
  try {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  } catch (error) {
    return false;
  }
};

// Encrypt file buffer
export const encryptFile = (fileBuffer) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setIV(iv);

    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('❌ File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

// Decrypt file buffer
export const decryptFile = (encryptedData) => {
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipher(encryptedData.algorithm || ALGORITHM, key);
    
    decipher.setIV(Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(encryptedData.encrypted),
      decipher.final()
    ]);

    return decrypted;
  } catch (error) {
    console.error('❌ File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

export default {
  encryptSensitiveData,
  decryptSensitiveData,
  hashData,
  generateSecureToken,
  generateSalt,
  deriveKey,
  encryptWithPassword,
  decryptWithPassword,
  generateRSAKeyPair,
  rsaEncrypt,
  rsaDecrypt,
  createDigitalSignature,
  verifyDigitalSignature,
  generateHMAC,
  verifyHMAC,
  secureCompare,
  encryptFile,
  decryptFile
};
// import { randomBytes, createHash, createCipheriv, createDecipheriv, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

// // Encryption utilities using modern Node.js crypto
// class EncryptionUtils {
//   // Generate secure random bytes
//   static generateSecureRandom(size = 32) {
//     return randomBytes(size);
//   }

//   // Generate secure random string
//   static generateSecureRandomString(length = 32) {
//     return randomBytes(length).toString('hex');
//   }

//   // Hash data using SHA-256
//   static hashSHA256(data) {
//     return createHash('sha256').update(data).digest('hex');
//   }

//   // Hash data using SHA-512
//   static hashSHA512(data) {
//     return createHash('sha512').update(data).digest('hex');
//   }

//   // Generate password hash using PBKDF2
//   static generatePasswordHash(password, salt = null, iterations = 100000) {
//     if (!salt) {
//       salt = randomBytes(32);
//     }
    
//     const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512');
    
//     return {
//       hash: hash.toString('hex'),
//       salt: salt.toString('hex'),
//       iterations
//     };
//   }

//   // Verify password against hash
//   static verifyPassword(password, storedHash, storedSalt, iterations = 100000) {
//     const salt = Buffer.from(storedSalt, 'hex');
//     const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512');
//     const expectedHash = Buffer.from(storedHash, 'hex');
    
//     return timingSafeEqual(hash, expectedHash);
//   }

//   // Encrypt data using AES-256-GCM
//   static encryptAES(plaintext, key = null) {
//     try {
//       if (!key) {
//         key = randomBytes(32);
//       } else if (typeof key === 'string') {
//         key = Buffer.from(key, 'hex');
//       }

//       const iv = randomBytes(16);
//       const cipher = createCipheriv('aes-256-gcm', key, iv);
      
//       let encrypted = cipher.update(plaintext, 'utf8', 'hex');
//       encrypted += cipher.final('hex');
      
//       const authTag = cipher.getAuthTag();
      
//       return {
//         encrypted,
//         key: key.toString('hex'),
//         iv: iv.toString('hex'),
//         authTag: authTag.toString('hex')
//       };
//     } catch (error) {
//       throw new Error(`Encryption failed: ${error.message}`);
//     }
//   }

//   // Decrypt data using AES-256-GCM
//   static decryptAES(encryptedData) {
//     try {
//       const { encrypted, key, iv, authTag } = encryptedData;
      
//       const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
//       decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
//       let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//       decrypted += decipher.final('utf8');
      
//       return decrypted;
//     } catch (error) {
//       throw new Error(`Decryption failed: ${error.message}`);
//     }
//   }

//   // Generate HMAC for data integrity
//   static generateHMAC(data, secret) {
//     return createHash('sha256').update(data + secret).digest('hex');
//   }

//   // Verify HMAC
//   static verifyHMAC(data, secret, expectedHMAC) {
//     const calculatedHMAC = this.generateHMAC(data, secret);
//     const expected = Buffer.from(expectedHMAC, 'hex');
//     const calculated = Buffer.from(calculatedHMAC, 'hex');
    
//     return timingSafeEqual(expected, calculated);
//   }

//   // Generate digital signature (simple implementation)
//   static generateSignature(data, secretKey) {
//     const timestamp = Date.now().toString();
//     const payload = `${data}${timestamp}${secretKey}`;
//     const signature = this.hashSHA256(payload);
    
//     return {
//       signature,
//       timestamp
//     };
//   }

//   // Verify digital signature
//   static verifySignature(data, signature, timestamp, secretKey, maxAge = 300000) {
//     // Check if signature is not too old (default 5 minutes)
//     const now = Date.now();
//     if (now - parseInt(timestamp) > maxAge) {
//       return false;
//     }
    
//     const expectedPayload = `${data}${timestamp}${secretKey}`;
//     const expectedSignature = this.hashSHA256(expectedPayload);
    
//     return timingSafeEqual(
//       Buffer.from(signature, 'hex'),
//       Buffer.from(expectedSignature, 'hex')
//     );
//   }

//   // Generate secure token
//   static generateSecureToken(length = 32) {
//     return randomBytes(length).toString('base64url');
//   }

//   // Hash chain for tamper detection
//   static generateHashChain(data, previousHash = '') {
//     const currentData = JSON.stringify(data);
//     const chainInput = `${previousHash}${currentData}${Date.now()}`;
//     return this.hashSHA256(chainInput);
//   }

//   // Verify hash chain integrity
//   static verifyHashChain(data, hash, previousHash = '') {
//     const currentData = JSON.stringify(data);
//     const chainInput = `${previousHash}${currentData}`;
    
//     // Since we don't have the exact timestamp, we'll do a simplified check
//     // In production, you'd store the timestamp with the hash
//     const baseHash = this.hashSHA256(chainInput);
//     return hash.startsWith(baseHash.substring(0, 32));
//   }

//   // Generate nonce for cryptographic operations
//   static generateNonce(length = 16) {
//     return randomBytes(length).toString('hex');
//   }

//   // Time-based one-time password (TOTP) - simplified version
//   static generateTOTP(secret, timeWindow = 30) {
//     const time = Math.floor(Date.now() / 1000);
//     const timeCounter = Math.floor(time / timeWindow);
    
//     const hmac = createHash('sha1').update(`${secret}${timeCounter}`).digest('hex');
//     const offset = parseInt(hmac.substr(-1), 16);
//     const code = parseInt(hmac.substr(offset * 2, 8), 16) % 1000000;
    
//     return code.toString().padStart(6, '0');
//   }

//   // Verify TOTP
//   static verifyTOTP(token, secret, timeWindow = 30, tolerance = 1) {
//     for (let i = -tolerance; i <= tolerance; i++) {
//       const time = Math.floor(Date.now() / 1000) + (i * timeWindow);
//       const timeCounter = Math.floor(time / timeWindow);
      
//       const hmac = createHash('sha1').update(`${secret}${timeCounter}`).digest('hex');
//       const offset = parseInt(hmac.substr(-1), 16);
//       const code = parseInt(hmac.substr(offset * 2, 8), 16) % 1000000;
//       const expectedToken = code.toString().padStart(6, '0');
      
//       if (token === expectedToken) {
//         return true;
//       }
//     }
    
//     return false;
//   }

//   // Generate encryption key from password
//   static deriveKeyFromPassword(password, salt, iterations = 100000, keyLength = 32) {
//     const saltBuffer = typeof salt === 'string' ? Buffer.from(salt, 'hex') : salt;
//     return pbkdf2Sync(password, saltBuffer, iterations, keyLength, 'sha512');
//   }

//   // Constant time string comparison
//   static constantTimeCompare(a, b) {
//     if (a.length !== b.length) {
//       return false;
//     }
    
//     const bufferA = Buffer.from(a);
//     const bufferB = Buffer.from(b);
    
//     return timingSafeEqual(bufferA, bufferB);
//   }

//   // Generate cryptographically secure UUID v4
//   static generateSecureUUID() {
//     const bytes = randomBytes(16);
    
//     // Set version (4) and variant bits
//     bytes[6] = (bytes[6] & 0x0f) | 0x40;
//     bytes[8] = (bytes[8] & 0x3f) | 0x80;
    
//     const hex = bytes.toString('hex');
//     return [
//       hex.substring(0, 8),
//       hex.substring(8, 12),
//       hex.substring(12, 16),
//       hex.substring(16, 20),
//       hex.substring(20, 32)
//     ].join('-');
//   }

//   // Generate random integer in range
//   static generateSecureRandomInt(min = 0, max = 100) {
//     const range = max - min + 1;
//     const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    
//     let randomValue;
//     do {
//       const randomBytes = this.generateSecureRandom(bytesNeeded);
//       randomValue = 0;
//       for (let i = 0; i < bytesNeeded; i++) {
//         randomValue = (randomValue << 8) + randomBytes[i];
//       }
//     } while (randomValue >= Math.floor(2 ** (bytesNeeded * 8) / range) * range);
    
//     return min + (randomValue % range);
//   }

//   // Secure data erasure (overwrite memory)
//   static secureErase(buffer) {
//     if (Buffer.isBuffer(buffer)) {
//       buffer.fill(0);
//     }
//   }

//   // Generate blockchain-style hash
//   static generateBlockHash(data, previousHash = '', nonce = 0) {
//     const blockData = {
//       data,
//       previousHash,
//       nonce,
//       timestamp: Date.now()
//     };
    
//     return this.hashSHA256(JSON.stringify(blockData));
//   }

//   // Mine hash with difficulty (proof of work concept)
//   static mineHash(data, previousHash = '', difficulty = 4) {
//     const target = '0'.repeat(difficulty);
//     let nonce = 0;
//     let hash;
    
//     do {
//       hash = this.generateBlockHash(data, previousHash, nonce);
//       nonce++;
//     } while (!hash.startsWith(target));
    
//     return {
//       hash,
//       nonce: nonce - 1,
//       timestamp: Date.now()
//     };
//   }
// }

// export default EncryptionUtils;