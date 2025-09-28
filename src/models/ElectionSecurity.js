import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { AUTHENTICATION_METHODS, ENCRYPTION_ALGORITHMS } from '../config/constants.js';

const ElectionSecurity = sequelize.define('vottery_election_security_2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'vottery_election_2',
      key: 'id'
    }
  },
  
  // Encryption Configuration
  encryption_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  encryption_algorithm: {
    type: DataTypes.ENUM(...Object.values(ENCRYPTION_ALGORITHMS)),
    defaultValue: ENCRYPTION_ALGORITHMS.SYMMETRIC
  },
  
  end_to_end_encryption: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  encryption_key_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  key_rotation_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  key_rotation_interval: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // days
  },
  
  last_key_rotation: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Digital Signatures
  digital_signatures_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  signature_algorithm: {
    type: DataTypes.ENUM('rsa', 'ecdsa', 'ed25519'),
    defaultValue: 'rsa'
  },
  
  public_key: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  private_key_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  // Authentication Configuration
  authentication_methods: {
    type: DataTypes.JSONB,
    defaultValue: [AUTHENTICATION_METHODS.PASSKEY]
  },
  
  multi_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  oauth_providers: {
    type: DataTypes.JSONB,
    defaultValue: ['google', 'facebook', 'twitter', 'linkedin']
  },
  
  passkey_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  magic_link_expiry: {
    type: DataTypes.INTEGER,
    defaultValue: 15 // minutes
  },
  
  // Biometric Security
  biometric_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  biometric_types: {
    type: DataTypes.JSONB,
    defaultValue: ['fingerprint', 'face_id']
  },
  
  biometric_fallback_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  biometric_storage_encrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Privacy Protection
  anonymous_voting: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  voter_anonymity_level: {
    type: DataTypes.ENUM('none', 'basic', 'advanced', 'perfect'),
    defaultValue: 'advanced'
  },
  
  mixnet_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  zero_knowledge_proofs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Audit Trail
  audit_trail_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  immutable_logging: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  blockchain_integration: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  blockchain_network: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  audit_retention_days: {
    type: DataTypes.INTEGER,
    defaultValue: 2555 // ~7 years
  },
  
  // Tamper Protection
  tamper_detection_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  hash_chain_verification: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  integrity_check_interval: {
    type: DataTypes.INTEGER,
    defaultValue: 60 // minutes
  },
  
  last_integrity_check: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Access Control
  ip_whitelisting_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  allowed_ip_ranges: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  geo_blocking_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  blocked_countries: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  vpn_detection_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  proxy_detection_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Rate Limiting
  rate_limiting_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  max_requests_per_minute: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  
  max_requests_per_hour: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  
  ddos_protection_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Session Management
  session_timeout: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // minutes
  },
  
  concurrent_sessions_allowed: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  session_encryption: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  secure_cookie_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Compliance
  gdpr_compliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  ccpa_compliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  data_retention_policy: {
    type: DataTypes.JSONB,
    defaultValue: {
      personal_data_retention_days: 365,
      voting_data_retention_days: 2555,
      audit_data_retention_days: 2555
    }
  },
  
  right_to_deletion_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Monitoring and Alerts
  security_monitoring_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  failed_login_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  
  account_lockout_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // minutes
  },
  
  suspicious_activity_alerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  security_incident_log: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Content Creator Security
  content_creator_link_encryption: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  one_time_link_expiry: {
    type: DataTypes.INTEGER,
    defaultValue: 24 // hours
  },
  
  link_sharing_prevention: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  creator_verification_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Metadata
  security_configuration_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  last_security_review: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  security_certification: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Timestamps
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vottery_election_security_2',
  timestamps: true,
  indexes: [
    {
      fields: ['election_id'],
      unique: true
    }
  ],
  hooks: {
    beforeUpdate: (security) => {
      security.updated_at = new Date();
      security.security_configuration_version += 1;
    }
  }
});

// Instance methods
ElectionSecurity.prototype.isHighSecurity = function() {
  return this.encryption_enabled && 
         this.digital_signatures_enabled && 
         this.audit_trail_enabled && 
         this.tamper_detection_enabled;
};

ElectionSecurity.prototype.requiresBiometric = function() {
  return this.biometric_required;
};

ElectionSecurity.prototype.supportsAuthentication = function(method) {
  return this.authentication_methods.includes(method);
};

ElectionSecurity.prototype.logSecurityIncident = function(incident) {
  this.security_incident_log.push({
    timestamp: new Date(),
    ...incident
  });
  
  // Keep only last 100 incidents
  if (this.security_incident_log.length > 100) {
    this.security_incident_log = this.security_incident_log.slice(-100);
  }
};

ElectionSecurity.prototype.getSecurityLevel = function() {
  let score = 0;
  
  if (this.encryption_enabled) score += 2;
  if (this.digital_signatures_enabled) score += 2;
  if (this.biometric_required) score += 2;
  if (this.audit_trail_enabled) score += 1;
  if (this.tamper_detection_enabled) score += 1;
  if (this.multi_factor_enabled) score += 1;
  if (this.blockchain_integration) score += 1;
  
  if (score >= 8) return 'maximum';
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'basic';
};

export default ElectionSecurity;