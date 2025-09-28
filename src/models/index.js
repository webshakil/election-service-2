import sequelize from '../config/database.js';
import Election from './Election.js';
import Question from './Question.js';
import Answer from './Answer.js';
import ElectionAccess from './ElectionAccess.js';
import ElectionBranding from './ElectionBranding.js';
import ElectionLottery from './ElectionLottery.js';
import ElectionSecurity from './ElectionSecurity.js';
import Vote from './Vote.js';
import VoteAnswer from './VoteAnswer.js';

// Define associations
const defineAssociations = () => {
  // Election associations
  Election.hasMany(Question, {
    foreignKey: 'election_id',
    as: 'questions',
    onDelete: 'CASCADE'
  });

  Election.hasOne(ElectionAccess, {
    foreignKey: 'election_id',
    as: 'access_control',
    onDelete: 'CASCADE'
  });

  Election.hasOne(ElectionBranding, {
    foreignKey: 'election_id',
    as: 'branding',
    onDelete: 'CASCADE'
  });

  Election.hasOne(ElectionLottery, {
    foreignKey: 'election_id',
    as: 'lottery',
    onDelete: 'CASCADE'
  });

  Election.hasOne(ElectionSecurity, {
    foreignKey: 'election_id',
    as: 'security_config',
    onDelete: 'CASCADE'
  });

  Election.hasMany(Vote, {
    foreignKey: 'election_id',
    as: 'votes',
    onDelete: 'CASCADE'
  });

  // Question associations
  Question.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });

  Question.hasMany(Answer, {
    foreignKey: 'question_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });

  Question.hasMany(VoteAnswer, {
    foreignKey: 'question_id',
    as: 'vote_answers',
    onDelete: 'CASCADE'
  });

  // Answer associations
  Answer.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'question'
  });

  Answer.hasMany(VoteAnswer, {
    foreignKey: 'answer_id',
    as: 'vote_answers',
    onDelete: 'CASCADE'
  });

  // Vote associations
  Vote.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });

  Vote.hasMany(VoteAnswer, {
    foreignKey: 'vote_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });

  // VoteAnswer associations
  VoteAnswer.belongsTo(Vote, {
    foreignKey: 'vote_id',
    as: 'vote'
  });

  VoteAnswer.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'question'
  });

  VoteAnswer.belongsTo(Answer, {
    foreignKey: 'answer_id',
    as: 'answer'
  });

  // Reverse associations
  ElectionAccess.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });

  ElectionBranding.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });

  ElectionLottery.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });

  ElectionSecurity.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election'
  });
};

// Initialize associations
defineAssociations();

// Sync models
const syncModels = async () => {
  try {
    // Create one-time tokens table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS vottery_election_2_one_time_tokens (
        id SERIAL PRIMARY KEY,
        election_id INTEGER NOT NULL REFERENCES vottery_election_2_elections(id) ON DELETE CASCADE,
        token UUID NOT NULL UNIQUE,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Model synchronization failed:', error);
    throw error;
  }
};

export {
  sequelize,
  Election,
  Question,
  Answer,
  ElectionAccess,
  ElectionBranding,
  ElectionLottery,
  ElectionSecurity,
  Vote,
  VoteAnswer,
  syncModels
};

export default {
  sequelize,
  Election,
  Question,
  Answer,
  ElectionAccess,
  ElectionBranding,
  ElectionLottery,
  ElectionSecurity,
  Vote,
  VoteAnswer,
  syncModels
};
// import sequelize from '../config/database.js';
// import Election from './Election.js';
// import Question from './Question.js';
// import Answer from './Answer.js';
// import ElectionAccess from './ElectionAccess.js';
// import ElectionBranding from './ElectionBranding.js';
// import ElectionLottery from './ElectionLottery.js';
// import ElectionSecurity from './ElectionSecurity.js';

// // Define associations
// const defineAssociations = () => {
//   // Election associations
//   Election.hasMany(Question, { 
//     foreignKey: 'election_id', 
//     as: 'questions',
//     onDelete: 'CASCADE' 
//   });
  
//   Election.hasOne(ElectionAccess, { 
//     foreignKey: 'election_id', 
//     as: 'access_control',
//     onDelete: 'CASCADE' 
//   });
  
//   Election.hasOne(ElectionBranding, { 
//     foreignKey: 'election_id', 
//     as: 'branding',
//     onDelete: 'CASCADE' 
//   });
  
//   Election.hasOne(ElectionLottery, { 
//     foreignKey: 'election_id', 
//     as: 'lottery',
//     onDelete: 'CASCADE' 
//   });
  
//   Election.hasOne(ElectionSecurity, { 
//     foreignKey: 'election_id', 
//     as: 'security_config',
//     onDelete: 'CASCADE' 
//   });

//   // Question associations
//   Question.belongsTo(Election, { 
//     foreignKey: 'election_id', 
//     as: 'election' 
//   });
  
//   Question.hasMany(Answer, { 
//     foreignKey: 'question_id', 
//     as: 'answers',
//     onDelete: 'CASCADE' 
//   });

//   // Answer associations
//   Answer.belongsTo(Question, { 
//     foreignKey: 'question_id', 
//     as: 'question' 
//   });

//   // Reverse associations
//   ElectionAccess.belongsTo(Election, { 
//     foreignKey: 'election_id', 
//     as: 'election' 
//   });
  
//   ElectionBranding.belongsTo(Election, { 
//     foreignKey: 'election_id', 
//     as: 'election' 
//   });
  
//   ElectionLottery.belongsTo(Election, { 
//     foreignKey: 'election_id', 
//     as: 'election' 
//   });
  
//   ElectionSecurity.belongsTo(Election, { 
//     foreignKey: 'election_id', 
//     as: 'election' 
//   });
// };

// // Initialize associations
// defineAssociations();

// // Sync models
// const syncModels = async () => {
//   try {
//     await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
//     console.log('✅ All models synchronized successfully');
//   } catch (error) {
//     console.error('❌ Model synchronization failed:', error);
//     throw error;
//   }
// };

// export {
//   sequelize,
//   Election,
//   Question,
//   Answer,
//   ElectionAccess,
//   ElectionBranding,
//   ElectionLottery,
//   ElectionSecurity,
//   syncModels
// };

// export default {
//   sequelize,
//   Election,
//   Question,
//   Answer,
//   ElectionAccess,
//   ElectionBranding,
//   ElectionLottery,
//   ElectionSecurity,
//   syncModels
// };