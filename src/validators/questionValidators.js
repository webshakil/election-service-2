import { body, param } from 'express-validator';
import { QUESTION_TYPES } from '../config/constants.js';

// Validation for question creation
export const validateQuestionCreation = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('question_text')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Question text must be between 3 and 1000 characters')
    .trim(),

  body('question_type')
    .isIn(Object.values(QUESTION_TYPES))
    .withMessage(`Question type must be one of: ${Object.values(QUESTION_TYPES).join(', ')}`),

  body('question_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Question order must be a positive integer'),

  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('Is required must be a boolean'),

  body('min_selections')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Min selections must be a positive integer'),

  body('max_selections')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max selections must be a positive integer')
    .custom((value, { req }) => {
      const minSelections = req.body.min_selections || 1;
      if (value < minSelections) {
        throw new Error('Max selections must be greater than or equal to min selections');
      }
      return true;
    }),

  body('text_min_length')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('Text min length must be between 1 and 5000'),

  body('text_max_length')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('Text max length must be between 1 and 5000')
    .custom((value, { req }) => {
      const minLength = req.body.text_min_length || 1;
      if (value < minLength) {
        throw new Error('Text max length must be greater than or equal to min length');
      }
      return true;
    }),

  // Validate answers for questions that require them
  body('answers')
    .optional()
    .isArray()
    .withMessage('Answers must be an array')
    .custom((value, { req }) => {
      const questionType = req.body.question_type;
      const requiresAnswers = [
        QUESTION_TYPES.MULTIPLE_CHOICE,
        QUESTION_TYPES.IMAGE_BASED,
        QUESTION_TYPES.COMPARISON
      ].includes(questionType);

      if (requiresAnswers && (!value || value.length < 2)) {
        throw new Error(`${questionType} questions must have at least 2 answer options`);
      }

      if (requiresAnswers && value && value.length > 100) {
        throw new Error('Questions cannot have more than 100 answer options');
      }

      return true;
    }),

  body('answers.*.answer_text')
    .if(body('answers').exists())
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Answer text must be between 1 and 500 characters')
    .trim(),

  body('answers.*.weight')
    .if(body('answers').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Answer weight must be a positive number'),

  body('answers.*.is_correct')
    .if(body('answers').exists())
    .optional()
    .isBoolean()
    .withMessage('Is correct must be a boolean'),

  // Comparison specific validation
  body('comparison_items')
    .optional()
    .isArray({ min: 2, max: 20 })
    .withMessage('Comparison items must be an array with 2-20 items'),

  body('comparison_type')
    .optional()
    .isIn(['head_to_head', 'ranking', 'approval'])
    .withMessage('Comparison type must be one of: head_to_head, ranking, approval'),

  // Voting type specific configurations
  body('plurality_config')
    .optional()
    .isObject()
    .withMessage('Plurality config must be an object'),

  body('ranked_choice_config')
    .optional()
    .isObject()
    .withMessage('Ranked choice config must be an object'),

  body('approval_config')
    .optional()
    .isObject()
    .withMessage('Approval config must be an object'),

  body('translated_questions')
    .optional()
    .isObject()
    .withMessage('Translated questions must be an object')
];

// Validation for question update
export const validateQuestionUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),

  body('question_text')
    .optional()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Question text must be between 3 and 1000 characters')
    .trim(),

  body('question_type')
    .optional()
    .isIn(Object.values(QUESTION_TYPES))
    .withMessage(`Question type must be one of: ${Object.values(QUESTION_TYPES).join(', ')}`),

  body('question_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Question order must be a positive integer'),

  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('Is required must be a boolean'),

  body('min_selections')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Min selections must be a positive integer'),

  body('max_selections')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max selections must be a positive integer'),

  body('text_min_length')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('Text min length must be between 1 and 5000'),

  body('text_max_length')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('Text max length must be between 1 and 5000'),

  body('answers')
    .optional()
    .isArray()
    .withMessage('Answers must be an array'),

  body('comparison_items')
    .optional()
    .isArray({ min: 2, max: 20 })
    .withMessage('Comparison items must be an array with 2-20 items'),

  body('translated_questions')
    .optional()
    .isObject()
    .withMessage('Translated questions must be an object')
];

// Validation for question reordering
export const validateQuestionReorder = [
  param('election_id')
    .isInt({ min: 1 })
    .withMessage('Election ID must be a positive integer'),

  body('questions_order')
    .isArray({ min: 1 })
    .withMessage('Questions order must be an array with at least one question ID'),

  body('questions_order.*')
    .isInt({ min: 1 })
    .withMessage('Each question ID must be a positive integer')
];

export default {
  validateQuestionCreation,
  validateQuestionUpdate,
  validateQuestionReorder
};
// import { body, param } from 'express-validator';
// import { QUESTION_TYPES } from '../config/constants.js';

// // Validation for question creation
// export const validateQuestionCreation = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer'),

//   body('question_text')
//     .isLength({ min: 3, max: 1000 })
//     .withMessage('Question text must be between 3 and 1000 characters')
//     .trim(),

//   body('question_type')
//     .isIn(Object.values(QUESTION_TYPES))
//     .withMessage(`Question type must be one of: ${Object.values(QUESTION_TYPES).join(', ')}`),

//   body('question_order')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Question order must be a positive integer'),

//   body('is_required')
//     .optional()
//     .isBoolean()
//     .withMessage('Is required must be a boolean'),

//   body('min_selections')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Min selections must be a positive integer'),

//   body('max_selections')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Max selections must be a positive integer'),

//   body('text_min_length')
//     .optional()
//     .isInt({ min: 1, max: 5000 })
//     .withMessage('Text min length must be between 1 and 5000'),

//   body('text_max_length')
//     .optional()
//     .isInt({ min: 1, max: 5000 })
//     .withMessage('Text max length must be between 1 and 5000'),

//   body('answers')
//     .optional()
//     .isArray()
//     .withMessage('Answers must be an array'),

//   body('comparison_items')
//     .optional()
//     .isArray({ min: 2, max: 20 })
//     .withMessage('Comparison items must be an array with 2-20 items'),

//   body('translated_questions')
//     .optional()
//     .isObject()
//     .withMessage('Translated questions must be an object')
// ];

// // Validation for question reordering
// export const validateQuestionReorder = [
//   param('election_id')
//     .isInt({ min: 1 })
//     .withMessage('Election ID must be a positive integer'),

//   body('questions_order')
//     .isArray({ min: 1 })
//     .withMessage('Questions order must be an array with at least one question ID'),

//   body('questions_order.*')
//     .isInt({ min: 1 })
//     .withMessage('Each question ID must be a positive integer')
// ];

// export default {
//   validateQuestionCreation,
//   validateQuestionUpdate,
//   validateQuestionReorder
// }; a boolean'),

//   body('min_selections')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Min selections must be a positive integer'),

//   body('max_selections')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Max selections must be a positive integer')
//     .custom((value, { req }) => {
//       const minSelections = req.body.min_selections || 1;
//       if (value < minSelections) {
//         throw new Error('Max selections must be greater than or equal to min selections');
//       }
//       return true;
//     }),

//   body('text_min_length')
//     .optional()
//     .isInt({ min: 1, max: 5000 })
//     .withMessage('Text min length must be between 1 and 5000'),

//   body('text_max_length')
//     .optional()
//     .isInt({ min: 1, max: 5000 })
//     .withMessage('Text max length must be between 1 and 5000')
//     .custom((value, { req }) => {
//       const minLength = req.body.text_min_length || 1;
//       if (value < minLength) {
//         throw new Error('Text max length must be greater than or equal to min length');
//       }
//       return true;
//     }),

//   // Validate answers for questions that require them
//   body('answers')
//     .optional()
//     .isArray()
//     .withMessage('Answers must be an array')
//     .custom((value, { req }) => {
//       const questionType = req.body.question_type;
//       const requiresAnswers = [
//         QUESTION_TYPES.MULTIPLE_CHOICE,
//         QUESTION_TYPES.IMAGE_BASED,
//         QUESTION_TYPES.COMPARISON
//       ].includes(questionType);

//       if (requiresAnswers && (!value || value.length < 2)) {
//         throw new Error(`${questionType} questions must have at least 2 answer options`);
//       }

//       if (requiresAnswers && value && value.length > 100) {
//         throw new Error('Questions cannot have more than 100 answer options');
//       }

//       return true;
//     }),

//   body('answers.*.answer_text')
//     .if(body('answers').exists())
//     .optional()
//     .isLength({ min: 1, max: 500 })
//     .withMessage('Answer text must be between 1 and 500 characters')
//     .trim(),

//   body('answers.*.weight')
//     .if(body('answers').exists())
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Answer weight must be a positive number'),

//   body('answers.*.is_correct')
//     .if(body('answers').exists())
//     .optional()
//     .isBoolean()
//     .withMessage('Is correct must be a boolean'),

//   // Comparison specific validation
//   body('comparison_items')
//     .optional()
//     .isArray({ min: 2, max: 20 })
//     .withMessage('Comparison items must be an array with 2-20 items'),

//   body('comparison_type')
//     .optional()
//     .isIn(['head_to_head', 'ranking', 'approval'])
//     .withMessage('Comparison type must be one of: head_to_head, ranking, approval'),

//   // Voting type specific configurations
//   body('plurality_config')
//     .optional()
//     .isObject()
//     .withMessage('Plurality config must be an object'),

//   body('ranked_choice_config')
//     .optional()
//     .isObject()
//     .withMessage('Ranked choice config must be an object'),

//   body('approval_config')
//     .optional()
//     .isObject()
//     .withMessage('Approval config must be an object'),

//   body('translated_questions')
//     .optional()
//     .isObject()
//     .withMessage('Translated questions must be an object')
// ];

// // Validation for question update
// export const validateQuestionUpdate = [
//   param('id')
//     .isInt({ min: 1 })
//     .withMessage('Question ID must be a positive integer'),

//   body('question_text')
//     .optional()
//     .isLength({ min: 3, max: 1000 })
//     .withMessage('Question text must be between 3 and 1000 characters')
//     .trim(),

//   body('question_type')
//     .optional()
//     .isIn(Object.values(QUESTION_TYPES))
//     .withMessage(`Question type must be one of: ${Object.values(QUESTION_TYPES).join(', ')}`),

//   body('question_order')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Question order must be a positive integer'),

//   body('is_required')
//     .optional()
//     .isBoolean()
//     .withMessage('Is required must be