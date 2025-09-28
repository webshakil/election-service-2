import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Answer = sequelize.define('vottery_answer_2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_question_2',
      key: 'id'
    }
  },
  
  // Answer Content
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  answer_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  answer_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  
  // Answer Configuration
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // For quiz-style questions
  },
  
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.0 // For weighted voting
  },
  
  // Comparison Specific
  comparison_item_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  comparison_attributes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Image Answer Specific
  image_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  image_alt_text: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  image_metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Multi-language Support
  translated_answers: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Analytics
  selection_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  ranking_sum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  approval_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Conditional Logic
  display_condition: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  
  // Answer Validation
  validation_rules: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  tableName: 'vottery_answer_2',
  timestamps: true,
  indexes: [
    {
      fields: ['question_id']
    },
    {
      fields: ['answer_order']
    },
    {
      fields: ['question_id', 'answer_order']
    },
    {
      fields: ['comparison_item_id']
    }
  ],
  hooks: {
    beforeUpdate: (answer) => {
      answer.updated_at = new Date();
    }
  }
});

// Instance methods
Answer.prototype.hasImage = function() {
  return !!this.answer_image_url;
};

Answer.prototype.isComparison = function() {
  return !!this.comparison_item_id;
};

Answer.prototype.getTranslatedText = function(language = 'en') {
  if (this.translated_answers && this.translated_answers[language]) {
    return this.translated_answers[language].text || this.answer_text;
  }
  return this.answer_text;
};

Answer.prototype.updateStats = function(votingType, value = 1) {
  switch(votingType) {
    case 'plurality':
      this.selection_count += value;
      break;
    case 'ranked_choice':
      this.ranking_sum += value;
      this.selection_count += 1;
      break;
    case 'approval':
      this.approval_count += value;
      break;
  }
};

export default Answer;