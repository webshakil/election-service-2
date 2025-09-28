import { Question, Answer, Election } from '../models/index.js';
import { questionService } from '../services/questionService.js';
import { uploadService } from '../services/uploadService.js';
import { validationResult } from 'express-validator';
import { ADMIN_ROLES } from '../config/constants.js';

class QuestionController {
  // Create question for election
  async createQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { election_id } = req.params;
      const { user } = req;
      const questionData = req.body;

      // Check if user can modify this election
      const election = await Election.findByPk(election_id);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const canModify = await this.checkQuestionModifyPermission(user, election);
      if (!canModify.allowed) {
        return res.status(403).json({
          success: false,
          message: canModify.message
        });
      }

      const question = await questionService.createQuestion(election_id, questionData, req.files);

      return res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: question
      });

    } catch (error) {
      console.error('Create question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get questions for election
  async getElectionQuestions(req, res) {
    try {
      const { election_id } = req.params;
      const { user } = req;

      const election = await Election.findByPk(election_id);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const questions = await questionService.getElectionQuestions(election_id);

      return res.status(200).json({
        success: true,
        data: questions
      });

    } catch (error) {
      console.error('Get election questions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve questions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get single question
  async getQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await questionService.getQuestionById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: question
      });

    } catch (error) {
      console.error('Get question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update question
  async updateQuestion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { user } = req;
      const updateData = req.body;

      const question = await Question.findByPk(id, {
        include: [{ model: Election, as: 'election' }]
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const canModify = await this.checkQuestionModifyPermission(user, question.election);
      if (!canModify.allowed) {
        return res.status(403).json({
          success: false,
          message: canModify.message
        });
      }

      const updatedQuestion = await questionService.updateQuestion(id, updateData, req.files);

      return res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        data: updatedQuestion
      });

    } catch (error) {
      console.error('Update question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete question
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const question = await Question.findByPk(id, {
        include: [{ model: Election, as: 'election' }]
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const canModify = await this.checkQuestionModifyPermission(user, question.election);
      if (!canModify.allowed) {
        return res.status(403).json({
          success: false,
          message: canModify.message
        });
      }

      await questionService.deleteQuestion(id);

      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });

    } catch (error) {
      console.error('Delete question error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reorder questions
  async reorderQuestions(req, res) {
    try {
      const { election_id } = req.params;
      const { user } = req;
      const { questions_order } = req.body; // Array of question IDs in new order

      const election = await Election.findByPk(election_id);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const canModify = await this.checkQuestionModifyPermission(user, election);
      if (!canModify.allowed) {
        return res.status(403).json({
          success: false,
          message: canModify.message
        });
      }

      await questionService.reorderQuestions(election_id, questions_order);

      return res.status(200).json({
        success: true,
        message: 'Questions reordered successfully'
      });

    } catch (error) {
      console.error('Reorder questions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reorder questions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to check question modification permissions
  async checkQuestionModifyPermission(user, election) {
    if (!user) {
      return { allowed: false, message: 'Authentication required' };
    }

    // Admin roles can modify any question
    if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR, ADMIN_ROLES.EDITOR].includes(user.admin_role)) {
      return { allowed: true };
    }

    // Election creator can modify their questions
    if (election.creator_id === user.id) {
      // Check if election can be edited
      if (election.status !== 'draft') {
        return { allowed: false, message: 'Questions cannot be modified after election is activated' };
      }
      return { allowed: true };
    }

    return { allowed: false, message: 'Only election creator can modify questions' };
  }
}

export default new QuestionController();