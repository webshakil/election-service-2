import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { 
  PERMISSION_TYPES, 
  PRICING_TYPES, 
  REGIONAL_ZONES 
} from '../config/constants.js';

const ElectionAccess = sequelize.define('vottery_election_access_2', {
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
  
  // Permission Configuration
  permission_type: {
    type: DataTypes.ENUM(...Object.values(PERMISSION_TYPES)),
    allowNull: false,
    defaultValue: PERMISSION_TYPES.WORLD_CITIZENS
  },
  
  // Registered Members Configuration
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  member_list: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Country/Region Restrictions
  allowed_countries: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  blocked_countries: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Pricing Configuration
  pricing_type: {
    type: DataTypes.ENUM(...Object.values(PRICING_TYPES)),
    allowNull: false,
    defaultValue: PRICING_TYPES.FREE
  },
  
  // General Fee (for PAID_GENERAL)
  general_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  
  general_fee_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  
  // Regional Fees (for PAID_REGIONAL)
  regional_fees: {
    type: DataTypes.JSONB,
    defaultValue: {
      [REGIONAL_ZONES.REGION_1]: { amount: 0.00, currency: 'USD' },
      [REGIONAL_ZONES.REGION_2]: { amount: 0.00, currency: 'EUR' },
      [REGIONAL_ZONES.REGION_3]: { amount: 0.00, currency: 'EUR' },
      [REGIONAL_ZONES.REGION_4]: { amount: 0.00, currency: 'USD' },
      [REGIONAL_ZONES.REGION_5]: { amount: 0.00, currency: 'USD' },
      [REGIONAL_ZONES.REGION_6]: { amount: 0.00, currency: 'USD' },
      [REGIONAL_ZONES.REGION_7]: { amount: 0.00, currency: 'AUD' },
      [REGIONAL_ZONES.REGION_8]: { amount: 0.00, currency: 'CNY' }
    }
  },
  
  // Processing Fees
  processing_fee_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00 // 0% to any%
  },
  
  // Payment Configuration
  payment_methods_enabled: {
    type: DataTypes.JSONB,
    defaultValue: ['stripe', 'paypal', 'google_pay', 'apple_pay']
  },
  
  // Audience Limits
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  min_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  // Geographic Configuration
  ip_geolocation_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  vpn_detection_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Age Restrictions
  min_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  max_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  age_verification_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Access Control Lists
  whitelist_emails: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  blacklist_emails: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  whitelist_domains: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  blacklist_domains: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Time-based Access
  early_access_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  early_access_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  early_access_users: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Access Statistics
  total_access_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  successful_authentications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  failed_authentications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  blocked_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Metadata
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
  tableName: 'vottery_election_access_2',
  timestamps: true,
  indexes: [
    {
      fields: ['election_id'],
      unique: true
    },
    {
      fields: ['permission_type']
    },
    {
      fields: ['pricing_type']
    }
  ],
  hooks: {
    beforeUpdate: (access) => {
      access.updated_at = new Date();
    }
  }
});

// Instance methods
ElectionAccess.prototype.isFree = function() {
  return this.pricing_type === PRICING_TYPES.FREE;
};

ElectionAccess.prototype.isPaid = function() {
  return this.pricing_type === PRICING_TYPES.PAID_GENERAL || 
         this.pricing_type === PRICING_TYPES.PAID_REGIONAL;
};

ElectionAccess.prototype.getFeeForRegion = function(region) {
  if (this.pricing_type === PRICING_TYPES.FREE) {
    return { amount: 0, currency: 'USD' };
  }
  
  if (this.pricing_type === PRICING_TYPES.PAID_GENERAL) {
    return { amount: this.general_fee, currency: this.general_fee_currency };
  }
  
  if (this.pricing_type === PRICING_TYPES.PAID_REGIONAL && this.regional_fees[region]) {
    return this.regional_fees[region];
  }
  
  return { amount: this.general_fee, currency: this.general_fee_currency };
};

ElectionAccess.prototype.isCountryAllowed = function(country) {
  if (this.permission_type === PERMISSION_TYPES.WORLD_CITIZENS) {
    return !this.blocked_countries.includes(country);
  }
  
  if (this.permission_type === PERMISSION_TYPES.COUNTRY_RESIDENTS) {
    return this.allowed_countries.includes(country);
  }
  
  return true;
};

export default ElectionAccess;
// import { query } from '../config/database.js';

// class ElectionAccess {
//   constructor() {
//     this.tableName = 'vottery_election_access_2';
//   }

//   // Create election access settings
//   async create(accessData) {
//     const {
//       election_id,
//       permission_type,
//       allowed_countries = [],
//       organization_id = null,
//       biometric_required = false,
//       authentication_methods = ['passkey'],
//       pricing_type = 'free',
//       general_fee = 0,
//       regional_fees = {},
//       processing_fee_percentage = 2.5,
//       meta_data = {}
//     } = accessData;

//     const sql = `
//       INSERT INTO ${this.tableName} (
//         election_id, permission_type, allowed_countries, organization_id,
//         biometric_required, authentication_methods, pricing_type,
//         general_fee, regional_fees, processing_fee_percentage,
//         meta_data, created_at, updated_at
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
//         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//       ) RETURNING *
//     `;

//     const values = [
//       election_id, permission_type, JSON.stringify(allowed_countries), organization_id,
//       biometric_required, JSON.stringify(authentication_methods), pricing_type,
//       general_fee, JSON.stringify(regional_fees), processing_fee_percentage,
//       JSON.stringify(meta_data)
//     ];

//     const result = await query(sql, values);
//     return result.rows[0];
//   }

//   // Get access settings by election ID
//   async findByElectionId(electionId) {
//     const sql = `
//       SELECT * FROM ${this.tableName}
//       WHERE election_id = $1
//     `;
    
//     const result = await query(sql, [electionId]);
//     const access = result.rows[0];
    
//     if (access) {
//       // Parse JSON fields
//       access.allowed_countries = JSON.parse(access.allowed_countries || '[]');
//       access.authentication_methods = JSON.parse(access.authentication_methods || '["passkey"]');
//       access.regional_fees = JSON.parse(access.regional_fees || '{}');
//       access.meta_data = JSON.parse(access.meta_data || '{}');
//     }
    
//     return access;
//   }

//   // Update access settings
//   async update(electionId, updateData) {
//     const allowedFields = [
//       'permission_type', 'allowed_countries', 'organization_id',
//       'biometric_required', 'authentication_methods', 'pricing_type',
//       'general_fee', 'regional_fees', 'processing_fee_percentage', 'meta_data'
//     ];

//     const updateFields = [];
//     const values = [];
//     let paramCount = 0;

//     Object.keys(updateData).forEach(field => {
//       if (allowedFields.includes(field) && updateData[field] !== undefined) {
//         paramCount++;
//         updateFields.push(`${field} = $${paramCount}`);
        
//         // Handle JSON fields
//         if (['allowed_countries', 'authentication_methods', 'regional_fees', 'meta_data'].includes(field)) {
//           values.push(JSON.stringify(updateData[field]));
//         } else {
//           values.push(updateData[field]);
//         }
//       }
//     });

//     if (updateFields.length === 0) {
//       throw new Error('No valid fields to update');
//     }

//     paramCount++;
//     values.push(new Date().toISOString());
//     updateFields.push(`updated_at = $${paramCount}`);

//     paramCount++;
//     values.push(electionId);

//     const sql = `
//       UPDATE ${this.tableName} 
//       SET ${updateFields.join(', ')}
//       WHERE election_id = $${paramCount}
//       RETURNING *
//     `;

//     const result = await query(sql, values);
//     const updated = result.rows[0];
    
//     if (updated) {
//       // Parse JSON fields
//       updated.allowed_countries = JSON.parse(updated.allowed_countries || '[]');
//       updated.authentication_methods = JSON.parse(updated.authentication_methods || '["passkey"]');
//       updated.regional_fees = JSON.parse(updated.regional_fees || '{}');
//       updated.meta_data = JSON.parse(updated.meta_data || '{}');
//     }
    
//     return updated;
//   }

//   // Check if user can access election
//   async canUserAccess(electionId, userId, userCountry = null) {
//     const accessSql = `
//       SELECT ea.*, e.status, e.start_date, e.end_date
//       FROM ${this.tableName} ea
//       JOIN vottery_elections_2 e ON ea.election_id = e.id
//       WHERE ea.election_id = $1
//     `;
    
//     const accessResult = await query(accessSql, [electionId]);
//     const access = accessResult.rows[0];
    
//     if (!access) {
//       return { canAccess: false, reason: 'Election access settings not found' };
//     }

//     // Parse JSON fields
//     access.allowed_countries = JSON.parse(access.allowed_countries || '[]');
    
//     // Check election status
//     if (access.status !== 'active') {
//       return { canAccess: false, reason: 'Election is not active' };
//     }

//     // Check if election has started
//     const now = new Date();
//     const startDate = new Date(`${access.start_date}T${access.start_time || '00:00:00'}`);
//     if (startDate > now) {
//       return { canAccess: false, reason: 'Election has not started yet' };
//     }

//     // Check if election has ended
//     const endDate = new Date(`${access.end_date}T${access.end_time || '23:59:59'}`);
//     if (endDate < now) {
//       return { canAccess: false, reason: 'Election has ended' };
//     }

//     // Check permission type
//     switch (access.permission_type) {
//       case 'world_citizens':
//         return { canAccess: true };
        
//       case 'registered_members':
//         if (access.organization_id) {
//           // Check if user is member of the organization
//           const memberSql = `
//             SELECT id FROM vottery_organization_members_2 
//             WHERE organization_id = $1 AND user_id = $2 AND status = 'active'
//           `;
//           const memberResult = await query(memberSql, [access.organization_id, userId]);
//           if (memberResult.rows.length === 0) {
//             return { canAccess: false, reason: 'Not a member of the required organization' };
//           }
//         }
//         return { canAccess: true };
        
//       case 'country_residents':
//       case 'selected_countries':
//         if (!userCountry) {
//           return { canAccess: false, reason: 'Country information required' };
//         }
        
//         if (access.allowed_countries.length > 0 && !access.allowed_countries.includes(userCountry)) {
//           return { canAccess: false, reason: 'Your country is not allowed to participate' };
//         }
//         return { canAccess: true };
        
//       default:
//         return { canAccess: false, reason: 'Invalid permission type' };
//     }
//   }

//   // Get participation fee for user
//   async getParticipationFee(electionId, userCountry = null, userRegion = null) {
//     const access = await this.findByElectionId(electionId);
    
//     if (!access) {
//       return { fee: 0, currency: 'USD' };
//     }

//     switch (access.pricing_type) {
//       case 'free':
//         return { fee: 0, currency: 'USD' };
        
//       case 'general_fee':
//         return { 
//           fee: parseFloat(access.general_fee || 0), 
//           currency: 'USD',
//           processing_fee: parseFloat(access.processing_fee_percentage || 0)
//         };
        
//       case 'regional_fee':
//         if (!userRegion) {
//           // Fallback to general fee or 0
//           return { 
//             fee: parseFloat(access.general_fee || 0), 
//             currency: 'USD',
//             processing_fee: parseFloat(access.processing_fee_percentage || 0)
//           };
//         }
        
//         const regionalFee = access.regional_fees[userRegion] || access.general_fee || 0;
//         return { 
//           fee: parseFloat(regionalFee), 
//           currency: 'USD',
//           processing_fee: parseFloat(access.processing_fee_percentage || 0)
//         };
        
//       default:
//         return { fee: 0, currency: 'USD' };
//     }
//   }

//   // Get access statistics
//   async getAccessStatistics(electionId) {
//     const sql = `
//       SELECT 
//         ea.permission_type,
//         ea.pricing_type,
//         ea.general_fee,
//         ea.biometric_required,
//         COUNT(DISTINCT v.voter_id) as total_participants,
//         COALESCE(SUM(v.participation_fee_paid), 0) as total_fees_collected
//       FROM ${this.tableName} ea
//       LEFT JOIN vottery_votes_2 v ON ea.election_id = v.election_id
//       WHERE ea.election_id = $1
//       GROUP BY ea.permission_type, ea.pricing_type, ea.general_fee, ea.biometric_required
//     `;
    
//     const result = await query(sql, [electionId]);
//     return result.rows[0];
//   }

//   // Delete access settings
//   async delete(electionId) {
//     const sql = `
//       DELETE FROM ${this.tableName}
//       WHERE election_id = $1
//       RETURNING election_id
//     `;
    
//     const result = await query(sql, [electionId]);
//     return result.rows[0];
//   }

//   // Get elections accessible to user
//   async getAccessibleElections(userId, userCountry = null, userRegion = null, filters = {}) {
//     const { status = 'active', limit = 20, offset = 0 } = filters;
    
//     let sql = `
//       SELECT DISTINCT e.*, 
//         COUNT(*) OVER() as total_count,
//         (SELECT COUNT(*) FROM vottery_votes_2 v WHERE v.election_id = e.id) as vote_count
//       FROM vottery_elections_2 e
//       JOIN ${this.tableName} ea ON e.id = ea.election_id
//       WHERE e.deleted_at IS NULL 
//         AND e.status = $1
//         AND (
//           ea.permission_type = 'world_citizens'
//           OR (ea.permission_type = 'country_residents' AND $2 = ANY(SELECT jsonb_array_elements_text(ea.allowed_countries::jsonb)))
//           OR (ea.permission_type = 'selected_countries' AND $2 = ANY(SELECT jsonb_array_elements_text(ea.allowed_countries::jsonb)))
//           OR (ea.permission_type = 'registered_members' AND EXISTS (
//             SELECT 1 FROM vottery_organization_members_2 om 
//             WHERE om.organization_id = ea.organization_id 
//               AND om.user_id = $3 
//               AND om.status = 'active'
//           ))
//         )
//     `;
    
//     const values = [status, userCountry || '', userId];
//     sql += ` ORDER BY e.created_at DESC LIMIT $4 OFFSET $5`;
//     values.push(limit, offset);

//     const result = await query(sql, values);
//     return {
//       elections: result.rows,
//       total: result.rows[0]?.total_count || 0
//     };
//   }
// }

// export default ElectionAccess;