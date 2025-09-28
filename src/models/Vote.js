import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vote = sequelize.define('vottery_election_2_votes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_election_2_elections',
      key: 'id'
    }
  },
  voter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'References user from user management table'
  },
  unique_vote_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataTypes.UUIDV4
  },
  voter_ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  voter_user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  voting_method: {
    type: DataTypes.ENUM('web', 'mobile_app', 'api'),
    defaultValue: 'web'
  },
  authentication_method: {
    type: DataTypes.ENUM('passkey', 'oauth', 'magic_link', 'email_password'),
    allowNull: false
  },
  biometric_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  biometric_type: {
    type: DataTypes.ENUM('fingerprint', 'face_id', 'none'),
    defaultValue: 'none'
  },
  one_time_token: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'For content creator one-time links'
  },
  is_content_creator_vote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vote_status: {
    type: DataTypes.ENUM('cast', 'verified', 'counted', 'invalidated'),
    defaultValue: 'cast'
  },
  vote_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Cryptographic hash for vote integrity'
  },
  encrypted_vote_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted vote data for security'
  },
  digital_signature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Digital signature for vote verification'
  },
  audit_trail_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to audit trail entry'
  },
  participation_fee_paid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  participation_fee_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  lottery_ticket_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Lottery ticket number if election has lottery'
  },
  lottery_eligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  vote_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  original_vote_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vottery_election_2_votes',
      key: 'id'
    },
    comment: 'Reference to original vote if this is an edited version'
  },
  edit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC'
  },
  device_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  geolocation: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'If permitted, voter location data'
  },
  voting_duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time taken to complete voting'
  },
  verification_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Code for vote verification'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  voted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vottery_election_2_votes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['election_id', 'voter_id'],
      unique: true,
      name: 'unique_voter_per_election'
    },
    {
      fields: ['election_id']
    },
    {
      fields: ['voter_id']
    },
    {
      fields: ['unique_vote_id']
    },
    {
      fields: ['one_time_token']
    },
    {
      fields: ['vote_status']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
Vote.prototype.isEditable = function() {
  return this.vote_status === 'cast' && !this.vote_edited;
};

Vote.prototype.canBeVerified = function() {
  return this.vote_status === 'cast' && this.verification_code;
};

Vote.prototype.isLotteryEligible = function() {
  return this.lottery_eligible && this.vote_status === 'counted';
};

// Static methods
Vote.getVoteStatistics = async function(electionId) {
  const stats = await this.findAll({
    where: { election_id: electionId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_votes'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('voter_id'))), 'unique_voters'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN vote_edited = true THEN 1 END")), 'edited_votes'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_content_creator_vote = true THEN 1 END")), 'content_creator_votes'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN biometric_verified = true THEN 1 END")), 'biometric_verified_votes']
    ],
    raw: true
  });
  
  return stats[0] || {};
};

export default Vote;