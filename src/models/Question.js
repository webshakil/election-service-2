import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { QUESTION_TYPES } from '../config/constants.js';

const Question = sequelize.define('vottery_question_2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vottery_election_2',
      key: 'id'
    }
  },
  
  // Question Details
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  question_type: {
    type: DataTypes.ENUM(...Object.values(QUESTION_TYPES)),
    allowNull: false
  },
  
  question_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  
  // Question Configuration
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Multiple Choice Configuration
  min_selections: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  max_selections: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  // Text Question Configuration
  text_min_length: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  text_max_length: {
    type: DataTypes.INTEGER,
    defaultValue: 5000
  },
  
  allow_html: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Image Configuration
  question_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Comparison Configuration
  comparison_items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  comparison_type: {
    type: DataTypes.ENUM('head_to_head', 'ranking', 'approval'),
    allowNull: true
  },
  
  // Voting Type Specific Settings
  // Plurality: Single selection
  plurality_config: {
    type: DataTypes.JSONB,
    defaultValue: {
      allow_single_selection: true,
      show_results_immediately: false
    }
  },
  
  // Ranked Choice: Preference ordering
  ranked_choice_config: {
    type: DataTypes.JSONB,
    defaultValue: {
      require_full_ranking: true,
      elimination_rounds: true,
      show_elimination_process: false
    }
  },
  
  // Approval: Multiple selections
  approval_config: {
    type: DataTypes.JSONB,
    defaultValue: {
      min_approvals: 1,
      max_approvals: null, // null means no limit
      show_approval_count: false
    }
  },
  
  // Multi-language Support
  translated_questions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Analytics
  response_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  skip_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Conditional Logic
  display_condition: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  
  parent_question_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vottery_question_2',
      key: 'id'
    }
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
  tableName: 'vottery_question_2',
  timestamps: true,
  indexes: [
    {
      fields: ['election_id']
    },
    {
      fields: ['question_type']
    },
    {
      fields: ['question_order']
    },
    {
      fields: ['election_id', 'question_order']
    }
  ],
  hooks: {
    beforeUpdate: (question) => {
      question.updated_at = new Date();
    }
  }
});

// Instance methods
Question.prototype.requiresAnswers = function() {
  return [
    QUESTION_TYPES.MULTIPLE_CHOICE,
    QUESTION_TYPES.IMAGE_BASED,
    QUESTION_TYPES.COMPARISON
  ].includes(this.question_type);
};

Question.prototype.isTextBased = function() {
  return this.question_type === QUESTION_TYPES.OPEN_TEXT;
};

Question.prototype.isImageBased = function() {
  return this.question_type === QUESTION_TYPES.IMAGE_BASED;
};

Question.prototype.isComparison = function() {
  return this.question_type === QUESTION_TYPES.COMPARISON;
};

Question.prototype.getConfigForVotingType = function(votingType) {
  switch(votingType) {
    case 'plurality':
      return this.plurality_config;
    case 'ranked_choice':
      return this.ranked_choice_config;
    case 'approval':
      return this.approval_config;
    default:
      return {};
  }
};

export default Question;
// import { DataTypes } from 'sequelize';
// import sequelize from '../config/database.js';
// import { QUESTION_TYPES } from '../config/constants.js';

// const Question = sequelize.define('vottery_question_2', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
  
//   election_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'vottery_election_2',
//       key: 'id'
//     }
//   },
  
//   // Question Details
//   question_text: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
  
//   question_type: {
//     type: DataTypes.ENUM(...Object.values(QUESTION_TYPES)),
//     allowNull: false
//   },
  
//   question_order: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 1
//   },
  
//   // Question Configuration
//   is_required: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
  
//   // Multiple Choice Configuration
//   min_selections: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1
//   },
  
//   max_selections: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1
//   },
  
//   // Text Question Configuration
//   text_min_length: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1
//   },
  
//   text_max_length: {
//     type: DataTypes.INTEGER,
//     defaultValue: 5000
//   },
  
//   allow_html: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
  
//   // Image Configuration
//   question_image_url: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
  
//   // Comparison Configuration
//   comparison_items: {
//     type: DataTypes.JSONB,
//     defaultValue: []
//   },
  
//   comparison_type: {
//     type: DataTypes.ENUM('head_to_head', 'ranking', 'approval'),
//     allowNull: true
//   },
  
//   // Voting Type Specific Settings
//   // Plurality: Single selection
//   plurality_config: {
//     type: DataTypes.JSONB,
//     defaultValue: {
//       allow_single_selection: true,
//       show_results_immediately: false
//     }
//   },
  
//   // Ranked Choice: Preference ordering
//   ranked_choice_config: {
//     type: DataTypes.JSONB,
//     defaultValue: {
//       require_full_ranking: true,
//       elimination_rounds: true,
//       show_elimination_process: false
//     }
//   },
  
//   // Approval: Multiple selections
//   approval_config: {
//     type: DataTypes.JSONB,
//     defaultValue: {
//       min_approvals: 1,
//       max_approvals: null, // null means no limit
//       show_approval_count: false
//     }
//   },
  
//   // Multi-language Support
//   translated_questions: {
//     type: DataTypes.JSONB,
//     defaultValue: {}
//   },
  
//   // Analytics
//   response_count: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
  
//   skip_count: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
  
//   // Conditional Logic
//   display_condition: {
//     type: DataTypes.JSONB,
//     defaultValue: null
//   },
  
//   parent_question_id: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'vottery_question_2',
//       key: 'id'
//     }
//   },
  
//   // Metadata
//   metadata: {
//     type: DataTypes.JSONB,
//     defaultValue: {}
//   },
  
//   // Timestamps
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   },
  
//   updated_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   }
// }, {
//   tableName: 'vottery_question_2',
//   timestamps: true,
//   indexes: [
//     {
//       fields: ['election_id']
//     },
//     {
//       fields: ['question_type']
//     },
//     {
//       fields: ['question_order']
//     },
//     {
//       fields: ['election_id', 'question_order']
//     }
//   ],
//   hooks: {
//     beforeUpdate: (question) => {
//       question.updated_at = new Date();
//     }
//   }
// });

// // Instance methods
// Question.prototype.requiresAnswers = function() {
//   return [
//     QUESTION_TYPES.MULTIPLE_CHOICE,
//     QUESTION_TYPES.IMAGE_BASED,
//     QUESTION_TYPES.COMPARISON
//   ].includes(this.question_type);
// };

// Question.prototype.isTextBased = function() {
//   return this.question_type === QUESTION_TYPES.OPEN_TEXT;
// };

// Question.prototype.isImageBased = function() {
//   return this.question_type === QUESTION_TYPES.IMAGE_BASED;
// };

// Question.prototype.isComparison = function() {
//   return this.question_type === QUESTION_TYPES.COMPARISON;
// };

// Question.prototype.getConfigForVotingType = function(votingType) {
//   switch(votingType) {
//     case 'plurality':
//       return this.plurality_config;
//     case 'ranked_choice':
//       return this.ranked_choice_config;
//     case 'approval':
//       return this.approval_config;
//     default:
//       return {};
//   }
// };

// export default Question;