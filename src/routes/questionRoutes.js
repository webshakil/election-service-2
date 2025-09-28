import express from 'express';
import questionController from '../controllers/questionController.js';
import { roleAuth } from '../middleware/roleAuth.js';
import { validateQuestionCreation, validateQuestionUpdate } from '../validators/questionValidators.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Question CRUD routes
router.post('/elections/:election_id/questions', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'editor']),
  upload.fields([
    { name: 'question_image', maxCount: 1 },
    { name: 'answer_images', maxCount: 50 }
  ]),
  validateQuestionCreation,
  questionController.createQuestion
);

router.get('/elections/:election_id/questions', 
  questionController.getElectionQuestions
);

router.get('/:id', 
  questionController.getQuestion
);

router.put('/:id', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'editor']),
  upload.fields([
    { name: 'question_image', maxCount: 1 },
    { name: 'answer_images', maxCount: 50 }
  ]),
  validateQuestionUpdate,
  questionController.updateQuestion
);

router.delete('/:id', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
  questionController.deleteQuestion
);

// Question management routes
router.put('/elections/:election_id/questions/reorder', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'editor']),
  questionController.reorderQuestions
);

export default router;