import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'node:crypto';
import { ElectionSecurity } from '../models/index.js';

class SecurityService {
  // Initialize election security
  async initializeElectionSecurity(electionId, securityConfig, transaction) {
    try {
      // Generate encryption key
      const encryptionKeyId = this.generateEncryptionKey();
      
      // Create security configuration
      await ElectionSecurity.update({
        encryption_key_id: encryptionKeyId,
        last_key_rotation: new Date(),
        last_integrity_check: new Date()
      }, { 
        where: { election_id: electionId },
        transaction 
      });

      console.log(`Security initialized for election ${electionId}`);

    } catch (error) {
      console.error('Initialize election security error:', error);
      throw error;
    }
  }

  // Activate election security
  async activateElectionSecurity(electionId, transaction) {
    try {
      const security = await ElectionSecurity.findOne({
        where: { election_id: electionId }
      });

      if (!security) {
        throw new Error('Security configuration not found');
      }

      // Perform final security checks
      await this.performSecurityChecks(electionId);

      // Log activation
      security.logSecurityIncident({
        type: 'ELECTION_ACTIVATED',
        description: 'Election security activated',
        severity: 'INFO'
      });

      await security.save({ transaction });

      console.log(`Security activated for election ${electionId}`);

    } catch (error) {
      console.error('Activate election security error:', error);
      throw error;
    }
  }

  // Update election security
  async updateElectionSecurity(electionId, securityData, transaction) {
    try {
      const security = await ElectionSecurity.findOne({
        where: { election_id: electionId }
      });

      if (!security) {
        throw new Error('Security configuration not found');
      }

      // Check if key rotation is needed
      if (securityData.encryption_enabled && security.needsKeyRotation()) {
        securityData.encryption_key_id = this.generateEncryptionKey();
        securityData.last_key_rotation = new Date();
      }

      await security.update(securityData, { transaction });

      console.log(`Security updated for election ${electionId}`);
      return security;

    } catch (error) {
      console.error('Update election security error:', error);
      throw error;
    }
  }

  // Generate encryption key
  generateEncryptionKey() {
    return randomBytes(32).toString('hex');
  }

  // Hash data
  hashData(data) {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Encrypt sensitive data
  encryptData(data, key) {
    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };

    } catch (error) {
      console.error('Encrypt data error:', error);
      throw error;
    }
  }

  // Decrypt sensitive data
  decryptData(encryptedData, key) {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);

    } catch (error) {
      console.error('Decrypt data error:', error);
      throw error;
    }
  }

  // Generate digital signature
  generateSignature(data) {
    return createHash('sha256')
      .update(JSON.stringify(data) + process.env.SIGNATURE_SECRET)
      .digest('hex');
  }

  // Verify digital signature
  verifySignature(data, signature) {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }

  // Create audit trail entry
  createAuditTrail(electionId, action, details, userId = null) {
    return {
      election_id: electionId,
      action,
      details,
      user_id: userId,
      timestamp: new Date(),
      hash: this.hashData({ electionId, action, details, userId, timestamp: new Date() }),
      ip_address: null, // Would be filled from request
      user_agent: null  // Would be filled from request
    };
  }

  // Perform security checks
  async performSecurityChecks(electionId) {
    try {
      const security = await ElectionSecurity.findOne({
        where: { election_id: electionId }
      });

      if (!security) {
        throw new Error('Security configuration not found');
      }

      const checks = {
        encryption_check: security.encryption_enabled,
        digital_signatures_check: security.digital_signatures_enabled,
        audit_trail_check: security.audit_trail_enabled,
        tamper_detection_check: security.tamper_detection_enabled
      };

      // Log security check results
      security.logSecurityIncident({
        type: 'SECURITY_CHECK',
        description: 'Security checks performed',
        details: checks,
        severity: 'INFO'
      });

      await security.save();

      return checks;

    } catch (error) {
      console.error('Perform security checks error:', error);
      throw error;
    }
  }

  // Validate IP address
  validateIPAddress(ip, allowedRanges = []) {
    if (allowedRanges.length === 0) return true;

    return allowedRanges.some(range => {
      // Simple IP range validation - in production, use proper CIDR matching
      return ip.startsWith(range);
    });
  }

  // Detect VPN/Proxy
  async detectVPNProxy(ip) {
    // This would integrate with a VPN/Proxy detection service
    // For now, return false
    return false;
  }

  // Rate limiting check
  checkRateLimit(userId, action, windowMs = 60000, maxRequests = 10) {
    // This would implement rate limiting logic
    // For now, return true (allowed)
    return true;
  }

  // Generate secure token
  generateSecureToken(length = 32) {
    return randomBytes(length).toString('hex');
  }

  // Generate one-time link for content creators
  generateOneTimeLink(electionId, userId) {
    const token = this.generateSecureToken();
    const timestamp = Date.now();
    const signature = this.generateSignature({ electionId, userId, token, timestamp });
    
    return {
      token,
      timestamp,
      signature,
      expires_at: new Date(timestamp + 24 * 60 * 60 * 1000), // 24 hours
      url: `/vote/${electionId}/${token}?sig=${signature}&t=${timestamp}`
    };
  }

  // Verify one-time link
  verifyOneTimeLink(electionId, userId, token, signature, timestamp) {
    // Check expiration
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - timestamp > expirationTime) {
      return { valid: false, reason: 'Link expired' };
    }

    // Verify signature
    const expectedSignature = this.generateSignature({ electionId, userId, token, timestamp });
    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }

    return { valid: true };
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove potential XSS vectors
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    return input;
  }

  // Log security incident
  async logSecurityIncident(electionId, incident) {
    try {
      const security = await ElectionSecurity.findOne({
        where: { election_id: electionId }
      });

      if (security) {
        security.logSecurityIncident(incident);
        await security.save();
      }

    } catch (error) {
      console.error('Log security incident error:', error);
    }
  }

  // Get security level assessment
  async getSecurityAssessment(electionId) {
    try {
      const security = await ElectionSecurity.findOne({
        where: { election_id: electionId }
      });

      if (!security) {
        return { level: 'unknown', score: 0 };
      }

      const level = security.getSecurityLevel();
      const score = this.calculateSecurityScore(security);

      return {
        level,
        score,
        recommendations: this.getSecurityRecommendations(security)
      };

    } catch (error) {
      console.error('Get security assessment error:', error);
      throw error;
    }
  }

  // Calculate security score
  calculateSecurityScore(security) {
    let score = 0;
    
    if (security.encryption_enabled) score += 20;
    if (security.digital_signatures_enabled) score += 20;
    if (security.audit_trail_enabled) score += 15;
    if (security.tamper_detection_enabled) score += 15;
    if (security.biometric_required) score += 10;
    if (security.multi_factor_enabled) score += 10;
    if (security.blockchain_integration) score += 10;

    return Math.min(score, 100);
  }

  // Get security recommendations
  getSecurityRecommendations(security) {
    const recommendations = [];

    if (!security.encryption_enabled) {
      recommendations.push('Enable end-to-end encryption for enhanced security');
    }

    if (!security.digital_signatures_enabled) {
      recommendations.push('Enable digital signatures for vote integrity');
    }

    if (!security.audit_trail_enabled) {
      recommendations.push('Enable audit trail for compliance and transparency');
    }

    if (!security.multi_factor_enabled) {
      recommendations.push('Consider enabling multi-factor authentication');
    }

    if (!security.biometric_required) {
      recommendations.push('Consider requiring biometric authentication for high-security elections');
    }

    return recommendations;
  }
}

export const securityService = new SecurityService();
export default securityService;
// import crypto from 'node:crypto';
// import { query, withTransaction } from '../config/database.js';
// import { AUDIT_ACTIONS, HASH_ALGORITHMS } from '../config/constants.js';

// class SecurityService {
//   constructor() {
//     this.auditTable = 'vottery_election_audit_2';
//     this.securityTable = 'vottery_election_security_2';
//   }

//   // Generate secure hash
//   generateHash(data, algorithm = HASH_ALGORITHMS.SHA256) {
//     return crypto.createHash(algorithm).update(String(data)).digest('hex');
//   }

//   // Generate secure random token
//   generateSecureToken(length = 32) {
//     return crypto.randomBytes(length).toString('hex');
//   }

//   // Encrypt sensitive data
//   encryptData(data, key = null) {
//     try {
//       const encryptionKey = key || process.env.ENCRYPTION_KEY;
//       if (!encryptionKey) {
//         throw new Error('Encryption key not provided');
//       }

//       const algorithm = 'aes-256-gcm';
//       const iv = crypto.randomBytes(16);
//       const cipher = crypto.createCipher(algorithm, encryptionKey);
      
//       let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
//       encrypted += cipher.final('hex');
      
//       const authTag = cipher.getAuthTag();
      
//       return {
//         encrypted,
//         iv: iv.toString('hex'),
//         authTag: authTag.toString('hex')
//       };
//     } catch (error) {
//       console.error('Encryption error:', error);
//       throw new Error('Failed to encrypt data');
//     }
//   }

//   // Decrypt sensitive data
//   decryptData(encryptedData, key = null) {
//     try {
//       const encryptionKey = key || process.env.ENCRYPTION_KEY;
//       if (!encryptionKey) {
//         throw new Error('Encryption key not provided');
//       }

//       const algorithm = 'aes-256-gcm';
//       const decipher = crypto.createDecipher(algorithm, encryptionKey);
      
//       decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
//       let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
//       decrypted += decipher.final('utf8');
      
//       return JSON.parse(decrypted);
//     } catch (error) {
//       console.error('Decryption error:', error);
//       throw new Error('Failed to decrypt data');
//     }
//   }

//   // Log audit trail
//   async logAuditTrail(auditData) {
//     try {
//       const {
//         election_id,
//         user_id,
//         action,
//         details = {},
//         ip_address = null,
//         user_agent = null,
//         resource_type = 'election',
//         resource_id = null
//       } = auditData;

//       const sql = `
//         INSERT INTO ${this.auditTable} (
//           election_id, user_id, action, details, ip_address, user_agent,
//           resource_type, resource_id, created_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
//         RETURNING *
//       `;

//       const values = [
//         election_id,
//         user_id,
//         action,
//         JSON.stringify(details),
//         ip_address,
//         user_agent,
//         resource_type,
//         resource_id
//       ];

//       const result = await query(sql, values);
//       return result.rows[0];
//     } catch (error) {
//       console.error('Audit trail logging error:', error);
//       throw new Error('Failed to log audit trail');
//     }
//   }

//   // Get audit trail for election
//   async getElectionAuditTrail(electionId, options = {}) {
//     try {
//       const { limit = 50, offset = 0, action = null, userId = null } = options;

//       let sql = `
//         SELECT a.*, u.first_name, u.last_name, u.sngine_email
//         FROM ${this.auditTable} a
//         LEFT JOIN vottery_user_management u ON a.user_id = u.id
//         WHERE a.election_id = $1
//       `;

//       const values = [electionId];
//       let paramCount = 1;

//       if (action) {
//         paramCount++;
//         sql += ` AND a.action = $${paramCount}`;
//         values.push(action);
//       }

//       if (userId) {
//         paramCount++;
//         sql += ` AND a.user_id = $${paramCount}`;
//         values.push(userId);
//       }

//       sql += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//       values.push(limit, offset);

//       const result = await query(sql, values);
      
//       return result.rows.map(row => ({
//         ...row,
//         details: JSON.parse(row.details || '{}')
//       }));
//     } catch (error) {
//       console.error('Get audit trail error:', error);
//       throw new Error('Failed to get audit trail');
//     }
//   }

//   // Create security configuration for election
//   async createSecurityConfig(electionId, securityConfig) {
//     try {
//       const {
//         encryption_enabled = true,
//         digital_signatures_enabled = true,
//         audit_trail_enabled = true,
//         hash_algorithm = HASH_ALGORITHMS.SHA256,
//         encryption_method = 'aes-256-gcm',
//         key_length = 256,
//         public_key = null,
//         private_key = null
//       } = securityConfig;

//       const sql = `
//         INSERT INTO ${this.securityTable} (
//           election_id, encryption_enabled, digital_signatures_enabled,
//           audit_trail_enabled, hash_algorithm, encryption_method,
//           key_length, public_key, private_key, created_at, updated_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//         RETURNING *
//       `;

//       const values = [
//         electionId,
//         encryption_enabled,
//         digital_signatures_enabled,
//         audit_trail_enabled,
//         hash_algorithm,
//         encryption_method,
//         key_length,
//         public_key,
//         private_key
//       ];

//       const result = await query(sql, values);
//       return result.rows[0];
//     } catch (error) {
//       console.error('Create security config error:', error);
//       throw new Error('Failed to create security configuration');
//     }
//   }

//   // Get security configuration
//   async getSecurityConfig(electionId) {
//     try {
//       const sql = `SELECT * FROM ${this.securityTable} WHERE election_id = $1`;
//       const result = await query(sql, [electionId]);
//       return result.rows[0];
//     } catch (error) {
//       console.error('Get security config error:', error);
//       throw new Error('Failed to get security configuration');
//     }
//   }

//   // Generate digital signature
//   generateDigitalSignature(data, privateKey = null) {
//     try {
//       const key = privateKey || process.env.PRIVATE_KEY;
//       if (!key) {
//         throw new Error('Private key not available');
//       }

//       const sign = crypto.createSign('RSA-SHA256');
//       sign.update(JSON.stringify(data));
//       return sign.sign(key, 'hex');
//     } catch (error) {
//       console.error('Digital signature generation error:', error);
//       throw new Error('Failed to generate digital signature');
//     }
//   }

//   // Verify digital signature
//   verifyDigitalSignature(data, signature, publicKey = null) {
//     try {
//       const key = publicKey || process.env.PUBLIC_KEY;
//       if (!key) {
//         throw new Error('Public key not available');
//       }

//       const verify = crypto.createVerify('RSA-SHA256');
//       verify.update(JSON.stringify(data));
//       return verify.verify(key, signature, 'hex');
//     } catch (error) {
//       console.error('Digital signature verification error:', error);
//       return false;
//     }
//   }

//   // Generate cryptographic proof
//   generateCryptographicProof(electionId, voteData) {
//     try {
//       const timestamp = new Date().toISOString();
//       const proofData = {
//         election_id: electionId,
//         vote_data: voteData,
//         timestamp,
//         nonce: this.generateSecureToken(16)
//       };

//       const hash = this.generateHash(proofData);
//       const signature = this.generateDigitalSignature(proofData);

//       return {
//         proof_data: proofData,
//         hash,
//         signature,
//         created_at: timestamp
//       };
//     } catch (error) {
//       console.error('Generate cryptographic proof error:', error);
//       throw new Error('Failed to generate cryptographic proof');
//     }
//   }

//   // Verify cryptographic proof
//   verifyCryptographicProof(proof) {
//     try {
//       // Verify hash
//       const calculatedHash = this.generateHash(proof.proof_data);
//       if (calculatedHash !== proof.hash) {
//         return { valid: false, reason: 'Hash verification failed' };
//       }

//       // Verify signature
//       const signatureValid = this.verifyDigitalSignature(proof.proof_data, proof.signature);
//       if (!signatureValid) {
//         return { valid: false, reason: 'Signature verification failed' };
//       }

//       return { valid: true, reason: 'Proof verified successfully' };
//     } catch (error) {
//       console.error('Verify cryptographic proof error:', error);
//       return { valid: false, reason: 'Proof verification error' };
//     }
//   }

//   // Generate election integrity hash
//   async generateElectionIntegrityHash(electionId) {
//     try {
//       // Get all election data
//       const electionSql = `SELECT * FROM vottery_elections_2 WHERE id = $1`;
//       const electionResult = await query(electionSql, [electionId]);
//       const election = electionResult.rows[0];

//       // Get all questions
//       const questionsSql = `SELECT * FROM vottery_questions_2 WHERE election_id = $1 ORDER BY question_order`;
//       const questionsResult = await query(questionsSql, [electionId]);
      
//       // Get all answers
//       const answersSql = `
//         SELECT a.* FROM vottery_answers_2 a
//         JOIN vottery_questions_2 q ON a.question_id = q.id
//         WHERE q.election_id = $1
//         ORDER BY q.question_order, a.answer_order
//       `;
//       const answersResult = await query(answersSql, [electionId]);

//       // Create integrity data
//       const integrityData = {
//         election,
//         questions: questionsResult.rows,
//         answers: answersResult.rows,
//         timestamp: new Date().toISOString()
//       };

//       return this.generateHash(integrityData);
//     } catch (error) {
//       console.error('Generate election integrity hash error:', error);
//       throw new Error('Failed to generate election integrity hash');
//     }
//   }

//   // Validate election integrity
//   async validateElectionIntegrity(electionId, expectedHash) {
//     try {
//       const currentHash = await this.generateElectionIntegrityHash(electionId);
//       return currentHash === expectedHash;
//     } catch (error) {
//       console.error('Validate election integrity error:', error);
//       return false;
//     }
//   }

//   // Security audit report
//   async generateSecurityAuditReport(electionId) {
//     try {
//       // Get audit trail summary
//       const auditSummarySQL = `
//         SELECT 
//           action,
//           COUNT(*) as count,
//           MIN(created_at) as first_occurrence,
//           MAX(created_at) as last_occurrence
//         FROM ${this.auditTable}
//         WHERE election_id = $1
//         GROUP BY action
//         ORDER BY count DESC
//       `;

//       const auditSummary = await query(auditSummarySQL, [electionId]);

//       // Get security configuration
//       const securityConfig = await this.getSecurityConfig(electionId);

//       // Get election details
//       const electionSQL = `SELECT id, title, status, created_at FROM vottery_elections_2 WHERE id = $1`;
//       const electionResult = await query(electionSQL, [electionId]);
//       const election = electionResult.rows[0];

//       return {
//         election,
//         security_config: securityConfig,
//         audit_summary: auditSummary.rows,
//         integrity_hash: await this.generateElectionIntegrityHash(electionId),
//         report_generated_at: new Date().toISOString()
//       };
//     } catch (error) {
//       console.error('Generate security audit report error:', error);
//       throw new Error('Failed to generate security audit report');
//     }
//   }
// }

// export default new SecurityService();