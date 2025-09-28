import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VoteAnswer = sequelize.define('vottery_election_2_vote_answers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vote_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_election_2_votes',
      key: 'id'
    }
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_election_2_questions',
      key: 'id'
    }
  },
  answer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vottery_election_2_answers',
      key: 'id'
    },
    comment: 'For MCQ, Image, Comparison questions'
  },
  text_answer: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'For open-ended text questions'
  },
  answer_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional answer data based on voting type'
  },
  voting_type_response: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Response format based on voting type (plurality, ranked, approval)'
  },
  // Plurality Voting - Single Selection
  plurality_selection: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Selected answer ID for plurality voting'
  },
  // Ranked Choice Voting - All Options Ranked
  ranked_choices: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of answer IDs in rank order [1st_choice_id, 2nd_choice_id, ...]'
  },
  ranking_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Detailed ranking information with preferences'
  },
  // Approval Voting - Multiple Selections
  approval_selections: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of approved answer IDs'
  },
  approval_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional approval voting data'
  },
  // Question Type Specific Fields
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'open_text', 'image_based', 'comparison'),
    allowNull: false
  },
  // Image-based question responses
  selected_images: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Selected image answer IDs'
  },
  image_selection_order: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Order of image selection for ranked voting'
  },
  // Comparison question responses
  comparison_results: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Pairwise comparison results'
  },
  comparison_rankings: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Final ranking from comparison voting'
  },
  // Text response metadata
  text_word_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  text_character_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  text_language_detected: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Answer validation and verification
  is_valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  validation_errors: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  answer_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hash of the answer for integrity verification'
  },
  encrypted_answer: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted answer data for privacy'
  },
  // Timing information
  answer_start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  answer_completion_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  time_spent_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Answer order and position
  answer_order: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Order in which this question was answered'
  },
  is_skipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  skip_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Editing history
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  edit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  previous_answer_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Previous answer before edit'
  },
  // Additional metadata
  device_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  browser_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vottery_election_2_vote_answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['vote_id', 'question_id'],
      unique: true,
      name: 'unique_answer_per_question_per_vote'
    },
    {
      fields: ['vote_id']
    },
    {
      fields: ['question_id']
    },
    {
      fields: ['answer_id']
    },
    {
      fields: ['question_type']
    },
    {
      fields: ['is_valid']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
VoteAnswer.prototype.getAnswerValue = function() {
  switch (this.question_type) {
    case 'multiple_choice':
      if (this.plurality_selection) return { type: 'plurality', value: this.plurality_selection };
      if (this.ranked_choices && this.ranked_choices.length > 0) return { type: 'ranked', value: this.ranked_choices };
      if (this.approval_selections && this.approval_selections.length > 0) return { type: 'approval', value: this.approval_selections };
      break;
    case 'open_text':
      return { type: 'text', value: this.text_answer };
    case 'image_based':
      if (this.plurality_selection) return { type: 'plurality', value: this.plurality_selection };
      if (this.image_selection_order && this.image_selection_order.length > 0) return { type: 'ranked', value: this.image_selection_order };
      if (this.selected_images && this.selected_images.length > 0) return { type: 'approval', value: this.selected_images };
      break;
    case 'comparison':
      if (this.comparison_rankings && this.comparison_rankings.length > 0) return { type: 'comparison', value: this.comparison_rankings };
      break;
  }
  return { type: 'unknown', value: null };
};

VoteAnswer.prototype.validateAnswer = function() {
  const errors = [];
  
  switch (this.question_type) {
    case 'multiple_choice':
      if (!this.plurality_selection && !this.ranked_choices?.length && !this.approval_selections?.length) {
        errors.push('No answer provided for multiple choice question');
      }
      break;
    case 'open_text':
      if (!this.text_answer || this.text_answer.trim().length === 0) {
        errors.push('Text answer is required');
      }
      break;
    case 'image_based':
      if (!this.plurality_selection && !this.image_selection_order?.length && !this.selected_images?.length) {
        errors.push('No image selection provided');
      }
      break;
    case 'comparison':
      if (!this.comparison_rankings?.length && !this.comparison_results) {
        errors.push('No comparison data provided');
      }
      break;
  }
  
  this.validation_errors = errors;
  this.is_valid = errors.length === 0;
  
  return this.is_valid;
};

VoteAnswer.prototype.calculateTimeSpent = function() {
  if (this.answer_start_time && this.answer_completion_time) {
    this.time_spent_seconds = Math.floor(
      (new Date(this.answer_completion_time) - new Date(this.answer_start_time)) / 1000
    );
  }
};

// Static methods
VoteAnswer.getQuestionStatistics = async function(questionId) {
  const stats = await this.findAll({
    where: { question_id: questionId, is_valid: true },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_answers'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_skipped = true THEN 1 END")), 'skipped_answers'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_edited = true THEN 1 END")), 'edited_answers'],
      [sequelize.fn('AVG', sequelize.col('time_spent_seconds')), 'avg_time_spent']
    ],
    raw: true
  });
  
  return stats[0] || {};
};

VoteAnswer.getAnswerDistribution = async function(questionId) {
  const distribution = await this.findAll({
    where: { question_id: questionId, is_valid: true },
    attributes: [
      'answer_id',
      'plurality_selection',
      'approval_selections',
      'ranked_choices',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['answer_id', 'plurality_selection', 'approval_selections', 'ranked_choices'],
    raw: true
  });
  
  return distribution;
};

export default VoteAnswer;