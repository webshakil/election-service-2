import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { PRIZE_TYPES } from '../config/constants.js';

const ElectionLottery = sequelize.define('vottery_election_lottery_2', {
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
  
  // Lottery Configuration
  lottery_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  lottery_trigger_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  auto_trigger_at_election_end: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Prize Configuration
  prize_type: {
    type: DataTypes.ENUM(...Object.values(PRIZE_TYPES)),
    allowNull: true
  },
  
  // Monetary Prize
  monetary_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  monetary_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  
  // Non-Monetary Prize
  non_monetary_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  non_monetary_value_estimate: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  non_monetary_provider: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  
  voucher_codes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Projected Content Revenue
  projected_revenue_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  projected_revenue_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true // Percentage of revenue to be given as prize
  },
  
  actual_revenue_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  revenue_source: {
    type: DataTypes.STRING(100),
    allowNull: true // YouTube, TikTok, etc.
  },
  
  // Winner Configuration
  winner_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100
    }
  },
  
  prize_distribution: {
    type: DataTypes.JSONB,
    defaultValue: [
      { rank: 1, percentage: 100 }
    ]
  },
  
  // Lottery Machine Settings
  machine_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  machine_animation_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  machine_style: {
    type: DataTypes.ENUM('transparent_oval', 'classic_sphere', 'modern_cylinder'),
    defaultValue: 'transparent_oval'
  },
  
  // Ball Configuration
  ball_color_scheme: {
    type: DataTypes.ENUM('rainbow', 'monochrome', 'custom'),
    defaultValue: 'rainbow'
  },
  
  custom_ball_colors: {
    type: DataTypes.JSONB,
    defaultValue: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
  },
  
  // Lottery Execution
  lottery_executed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  execution_timestamp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  execution_method: {
    type: DataTypes.ENUM('automatic', 'manual', 'scheduled'),
    allowNull: true
  },
  
  // RNG Configuration
  rng_algorithm: {
    type: DataTypes.ENUM('crypto_random', 'mersenne_twister', 'linear_congruential'),
    defaultValue: 'crypto_random'
  },
  
  rng_seed: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Winners Data
  winners: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  winner_selection_log: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Prize Pool Management
  total_prize_pool: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  
  sponsor_contributions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  creator_contribution: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  
  // Prize Distribution Status
  prizes_distributed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  distribution_method: {
    type: DataTypes.ENUM('automatic', 'manual', 'hybrid'),
    defaultValue: 'automatic'
  },
  
  distribution_threshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 100.00 // Auto-distribute prizes under this amount
  },
  
  distribution_log: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Participant Tracking
  eligible_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  total_lottery_balls: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  participant_ids: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Verification and Audit
  lottery_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  blockchain_transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  audit_trail: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  public_verification_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  verification_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Content Creator Integration
  content_creator_announcement: {
    type: DataTypes.JSONB,
    defaultValue: {
      enabled: false,
      announcement_scheduled: false,
      announcement_content: '',
      follow_up_content_url: ''
    }
  },
  
  // Notifications
  winner_notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  public_announcement_made: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  notification_settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      email_winners: true,
      email_participants: false,
      social_media_announcement: false,
      in_app_notification: true
    }
  },
  
  // Analytics
  lottery_engagement_stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      views_during_lottery: 0,
      clicks_on_machine: 0,
      shares_after_results: 0
    }
  },
  
  // Terms and Conditions
  terms_acceptance_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  lottery_terms_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  age_restriction: {
    type: DataTypes.INTEGER,
    defaultValue: 18
  },
  
  geographic_restrictions: {
    type: DataTypes.JSONB,
    defaultValue: []
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
  tableName: 'vottery_election_lottery_2',
  timestamps: true,
  indexes: [
    {
      fields: ['election_id'],
      unique: true
    },
    {
      fields: ['lottery_enabled']
    },
    {
      fields: ['lottery_executed']
    },
    {
      fields: ['lottery_trigger_time']
    }
  ],
  hooks: {
    beforeUpdate: (lottery) => {
      lottery.updated_at = new Date();
    }
  }
});

// Instance methods
ElectionLottery.prototype.isEnabled = function() {
  return this.lottery_enabled;
};

ElectionLottery.prototype.isExecuted = function() {
  return this.lottery_executed;
};

ElectionLottery.prototype.canExecute = function() {
  return this.lottery_enabled && 
         !this.lottery_executed && 
         this.eligible_participants > 0;
};

ElectionLottery.prototype.getTotalPrizeValue = function() {
  switch(this.prize_type) {
    case PRIZE_TYPES.MONETARY:
      return this.monetary_amount || 0;
    case PRIZE_TYPES.NON_MONETARY:
      return this.non_monetary_value_estimate || 0;
    case PRIZE_TYPES.PROJECTED_REVENUE:
      const revenue = this.actual_revenue_amount || this.projected_revenue_amount || 0;
      const percentage = this.projected_revenue_percentage || 100;
      return (revenue * percentage) / 100;
    default:
      return 0;
  }
};

ElectionLottery.prototype.getPrizeForRank = function(rank) {
  const totalPrize = this.getTotalPrizeValue();
  const distribution = this.prize_distribution.find(d => d.rank === rank);
  
  if (distribution) {
    return (totalPrize * distribution.percentage) / 100;
  }
  
  // If no specific distribution, divide equally
  return totalPrize / this.winner_count;
};

ElectionLottery.prototype.addParticipant = function(participantId) {
  if (!this.participant_ids.includes(participantId)) {
    this.participant_ids.push(participantId);
    this.eligible_participants += 1;
    this.total_lottery_balls += 1;
  }
};

ElectionLottery.prototype.removeParticipant = function(participantId) {
  const index = this.participant_ids.indexOf(participantId);
  if (index > -1) {
    this.participant_ids.splice(index, 1);
    this.eligible_participants -= 1;
    this.total_lottery_balls -= 1;
  }
};

ElectionLottery.prototype.generateLotteryHash = async function() {
  const crypto = await import('node:crypto');
  const data = {
    election_id: this.election_id,
    participants: this.participant_ids.sort(),
    timestamp: this.execution_timestamp,
    rng_seed: this.rng_seed
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
};

ElectionLottery.prototype.addToAuditTrail = function(action, details) {
  this.audit_trail.push({
    timestamp: new Date(),
    action,
    details,
    hash: this.generateLotteryHash()
  });
};

ElectionLottery.prototype.shouldAutoDistribute = function(prizeAmount) {
  return this.distribution_method === 'automatic' && 
         prizeAmount <= this.distribution_threshold;
};

export default ElectionLottery;