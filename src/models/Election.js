import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { 
  VOTING_TYPES, 
  ELECTION_STATUSES, 
  AUTHENTICATION_METHODS,
  CONTENT_CREATOR_STAGES 
} from '../config/constants.js';

const Election = sequelize.define('vottery_election_2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Creator Information
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_user_management',
      key: 'id'
    }
  },
  
  // Basic Election Info
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  topic_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  topic_video_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  voting_body_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Timing
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'UTC'
  },
  
  // Voting Configuration
  voting_type: {
    type: DataTypes.ENUM(...Object.values(VOTING_TYPES)),
    allowNull: false,
    defaultValue: VOTING_TYPES.PLURALITY
  },
  
  // Election Status
  status: {
    type: DataTypes.ENUM(...Object.values(ELECTION_STATUSES)),
    allowNull: false,
    defaultValue: ELECTION_STATUSES.DRAFT
  },
  
  // Results Configuration
  show_live_results: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  allow_vote_editing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  results_visible_during_voting: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Authentication Method
  authentication_method: {
    type: DataTypes.ENUM(...Object.values(AUTHENTICATION_METHODS)),
    allowNull: false,
    defaultValue: AUTHENTICATION_METHODS.PASSKEY
  },
  
  // Biometric Requirements
  biometric_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // URLs and Links
  custom_voting_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    unique: true
  },
  
  unique_election_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  
  // Content Creator Integration
  is_content_creator_election: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  content_creator_stage: {
    type: DataTypes.ENUM(...Object.values(CONTENT_CREATOR_STAGES)),
    allowNull: true
  },
  
  vottery_icon_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  icon_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  one_time_links_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  projected_revenue_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  // Multi-language Support
  supported_languages: {
    type: DataTypes.JSONB,
    defaultValue: ['en']
  },
  
  translated_content: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Statistics
  total_votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  total_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Audit and Security
  encryption_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  digital_signatures_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  audit_trail_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Clone Information
  cloned_from: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vottery_election_2',
      key: 'id'
    }
  },
  
  clone_count: {
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
  tableName: 'vottery_election_2',
  timestamps: true,
  indexes: [
    {
      fields: ['creator_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['custom_voting_url'],
      unique: true,
      where: {
        custom_voting_url: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['unique_election_id'],
      unique: true
    },
    {
      fields: ['voting_type']
    }
  ],
  hooks: {
    beforeUpdate: (election) => {
      election.updated_at = new Date();
    }
  }
});

// Instance methods
Election.prototype.isActive = function() {
  const now = new Date();
  return this.status === ELECTION_STATUSES.ACTIVE && 
         now >= this.start_date && 
         now <= this.end_date;
};

Election.prototype.isExpired = function() {
  const now = new Date();
  return now > this.end_date;
};

Election.prototype.canEdit = function() {
  return this.status === ELECTION_STATUSES.DRAFT;
};

Election.prototype.canDelete = function() {
  return this.status === ELECTION_STATUSES.DRAFT || 
         (this.status === ELECTION_STATUSES.ACTIVE && this.total_votes === 0);
};

export default Election;
// import { query } from '../config/database.js';

// class Election {
//   constructor() {
//     this.tableName = 'vottery_elections_2';
//   }

//   // Create new election
//   async create(electionData) {
//     const {
//       title,
//       description,
//       topic_image_url,
//       topic_video_url,
//       start_date,
//       start_time,
//       end_date,
//       end_time,
//       voting_type,
//       creator_id,
//       status = 'draft',
//       timezone = 'UTC',
//       language = 'en-US',
//       custom_url,
//       corporate_style,
//       logo_branding_url,
//       results_visible = false,
//       vote_editing_allowed = false,
//       meta_data = {}
//     } = electionData;

//     const sql = `
//       INSERT INTO ${this.tableName} (
//         title, description, topic_image_url, topic_video_url,
//         start_date, start_time, end_date, end_time,
//         voting_type, creator_id, status, timezone, language,
//         custom_url, corporate_style, logo_branding_url,
//         results_visible, vote_editing_allowed, meta_data,
//         created_at, updated_at
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
//         $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//       ) RETURNING *
//     `;

//     const values = [
//       title, description, topic_image_url, topic_video_url,
//       start_date, start_time, end_date, end_time,
//       voting_type, creator_id, status, timezone, language,
//       custom_url, corporate_style, logo_branding_url,
//       results_visible, vote_editing_allowed, JSON.stringify(meta_data)
//     ];

//     const result = await query(sql, values);
//     return result.rows[0];
//   }

//   // Get election by ID
//   async findById(id) {
//     const sql = `
//       SELECT e.*, 
//         u.first_name, u.last_name, u.sngine_email,
//         u.user_type, u.subscription_status, u.admin_role
//       FROM ${this.tableName} e
//       LEFT JOIN vottery_user_management u ON e.creator_id = u.id
//       WHERE e.id = $1 AND e.deleted_at IS NULL
//     `;
    
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }

//   // Get elections by creator ID
//   async findByCreatorId(creatorId, filters = {}) {
//     const { status, limit = 50, offset = 0, search } = filters;
    
//     let sql = `
//       SELECT e.*, 
//         COUNT(*) OVER() as total_count,
//         (SELECT COUNT(*) FROM vottery_votes_2 v WHERE v.election_id = e.id) as vote_count
//       FROM ${this.tableName} e
//       WHERE e.creator_id = $1 AND e.deleted_at IS NULL
//     `;
    
//     const values = [creatorId];
//     let paramCount = 1;

//     if (status) {
//       paramCount++;
//       sql += ` AND e.status = $${paramCount}`;
//       values.push(status);
//     }

//     if (search) {
//       paramCount++;
//       sql += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
//       values.push(`%${search}%`);
//     }

//     sql += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//     values.push(limit, offset);

//     const result = await query(sql, values);
//     return {
//       elections: result.rows,
//       total: result.rows[0]?.total_count || 0
//     };
//   }

//   // Update election
//   async update(id, updateData) {
//     const allowedFields = [
//       'title', 'description', 'topic_image_url', 'topic_video_url',
//       'start_date', 'start_time', 'end_date', 'end_time',
//       'voting_type', 'status', 'timezone', 'language',
//       'custom_url', 'corporate_style', 'logo_branding_url',
//       'results_visible', 'vote_editing_allowed', 'meta_data'
//     ];

//     const updateFields = [];
//     const values = [];
//     let paramCount = 0;

//     Object.keys(updateData).forEach(field => {
//       if (allowedFields.includes(field) && updateData[field] !== undefined) {
//         paramCount++;
//         updateFields.push(`${field} = ${paramCount}`);
//         values.push(field === 'meta_data' ? JSON.stringify(updateData[field]) : updateData[field]);
//       }
//     });

//     if (updateFields.length === 0) {
//       throw new Error('No valid fields to update');
//     }

//     paramCount++;
//     values.push(new Date().toISOString());
//     updateFields.push(`updated_at = ${paramCount}`);

//     paramCount++;
//     values.push(id);

//     const sql = `
//       UPDATE ${this.tableName} 
//       SET ${updateFields.join(', ')}
//       WHERE id = ${paramCount} AND deleted_at IS NULL
//       RETURNING *
//     `;

//     const result = await query(sql, values);
//     return result.rows[0];
//   }

//   // Soft delete election
//   async softDelete(id) {
//     const sql = `
//       UPDATE ${this.tableName} 
//       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $1 AND deleted_at IS NULL
//       RETURNING id, title
//     `;
    
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }

//   // Clone election
//   async clone(id, creatorId, newTitle) {
//     const original = await this.findById(id);
//     if (!original) {
//       throw new Error('Election not found');
//     }

//     const cloneData = {
//       ...original,
//       title: newTitle || `${original.title} (Copy)`,
//       creator_id: creatorId,
//       status: 'draft',
//       custom_url: null,
//       start_date: null,
//       start_time: null,
//       end_date: null,
//       end_time: null
//     };

//     delete cloneData.id;
//     delete cloneData.created_at;
//     delete cloneData.updated_at;
//     delete cloneData.deleted_at;

//     return await this.create(cloneData);
//   }

//   // Get public elections
//   async getPublicElections(filters = {}) {
//     const { status = 'active', limit = 20, offset = 0, search } = filters;
    
//     let sql = `
//       SELECT e.*, 
//         u.first_name, u.last_name,
//         COUNT(*) OVER() as total_count,
//         (SELECT COUNT(*) FROM vottery_votes_2 v WHERE v.election_id = e.id) as vote_count
//       FROM ${this.tableName} e
//       LEFT JOIN vottery_user_management u ON e.creator_id = u.id
//       LEFT JOIN vottery_election_access_2 ea ON e.id = ea.election_id
//       WHERE e.deleted_at IS NULL 
//         AND e.status = $1
//         AND (ea.permission_type = 'world_citizens' OR ea.permission_type IS NULL)
//     `;
    
//     const values = [status];
//     let paramCount = 1;

//     if (search) {
//       paramCount++;
//       sql += ` AND (e.title ILIKE ${paramCount} OR e.description ILIKE ${paramCount})`;
//       values.push(`%${search}%`);
//     }

//     sql += ` ORDER BY e.created_at DESC LIMIT ${paramCount + 1} OFFSET ${paramCount + 2}`;
//     values.push(limit, offset);

//     const result = await query(sql, values);
//     return {
//       elections: result.rows,
//       total: result.rows[0]?.total_count || 0
//     };
//   }

//   // Update election status
//   async updateStatus(id, status) {
//     const sql = `
//       UPDATE ${this.tableName} 
//       SET status = $1, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $2 AND deleted_at IS NULL
//       RETURNING *
//     `;
    
//     const result = await query(sql, [status, id]);
//     return result.rows[0];
//   }

//   // Get election statistics
//   async getStatistics(id) {
//     const sql = `
//       SELECT 
//         e.id,
//         e.title,
//         e.status,
//         e.start_date,
//         e.end_date,
//         COUNT(DISTINCT v.id) as total_votes,
//         COUNT(DISTINCT v.voter_id) as unique_voters,
//         COALESCE(el.total_prize_pool, 0) as prize_pool,
//         COALESCE(el.winner_count, 0) as winner_count
//       FROM ${this.tableName} e
//       LEFT JOIN vottery_votes_2 v ON e.id = v.election_id
//       LEFT JOIN vottery_election_lottery_2 el ON e.id = el.election_id
//       WHERE e.id = $1 AND e.deleted_at IS NULL
//       GROUP BY e.id, e.title, e.status, e.start_date, e.end_date, 
//                el.total_prize_pool, el.winner_count
//     `;
    
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }

//   // Check if user can create election
//   async canCreateElection(userId) {
//     const userQuery = `
//       SELECT user_type, subscription_status, admin_role
//       FROM vottery_user_management
//       WHERE id = $1
//     `;
    
//     const userResult = await query(userQuery, [userId]);
//     const user = userResult.rows[0];
    
//     if (!user) {
//       return { canCreate: false, reason: 'User not found' };
//     }

//     // Check if user is admin
//     if (user.admin_role) {
//       return { canCreate: true };
//     }

//     // Check subscription status for regular users
//     if (user.subscription_status === 'active') {
//       return { canCreate: true };
//     }

//     // Check free tier limits
//     const countQuery = `
//       SELECT COUNT(*) as election_count
//       FROM ${this.tableName}
//       WHERE creator_id = $1 AND deleted_at IS NULL
//     `;
    
//     const countResult = await query(countQuery, [userId]);
//     const electionCount = parseInt(countResult.rows[0].election_count);
//     const maxFreeElections = 3; // From constants

//     if (electionCount >= maxFreeElections) {
//       return { 
//         canCreate: false, 
//         reason: 'Free tier election limit reached. Upgrade subscription to create more elections.' 
//       };
//     }

//     return { canCreate: true };
//   }

//   // Get trending elections
//   async getTrendingElections(limit = 10) {
//     const sql = `
//       SELECT e.*, 
//         u.first_name, u.last_name,
//         COUNT(v.id) as vote_count,
//         COUNT(DISTINCT v.voter_id) as unique_voters
//       FROM ${this.tableName} e
//       LEFT JOIN vottery_user_management u ON e.creator_id = u.id
//       LEFT JOIN vottery_votes_2 v ON e.id = v.election_id
//       LEFT JOIN vottery_election_access_2 ea ON e.id = ea.election_id
//       WHERE e.deleted_at IS NULL 
//         AND e.status = 'active'
//         AND (ea.permission_type = 'world_citizens' OR ea.permission_type IS NULL)
//         AND e.end_date > CURRENT_TIMESTAMP
//       GROUP BY e.id, u.first_name, u.last_name
//       ORDER BY COUNT(v.id) DESC, e.created_at DESC
//       LIMIT $1
//     `;
    
//     const result = await query(sql, [limit]);
//     return result.rows;
//   }
// }

// export default Election;