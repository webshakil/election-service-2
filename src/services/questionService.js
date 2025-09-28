import { Question, Answer, sequelize } from '../models/index.js';
import { uploadService } from './uploadService.js';
import { QUESTION_TYPES } from '../config/constants.js';

class QuestionService {
  // Create question with answers
  async createQuestion(electionId, questionData, files = {}) {
    const transaction = await sequelize.transaction();

    try {
      const {
        question_text,
        question_type,
        question_order,
        is_required = true,
        min_selections = 1,
        max_selections = 1,
        text_min_length = 1,
        text_max_length = 5000,
        comparison_items = [],
        plurality_config = {},
        ranked_choice_config = {},
        approval_config = {},
        translated_questions = {},
        answers = []
      } = questionData;

      // Upload question image if provided
      let questionImageUrl = null;
      if (files.question_image && files.question_image[0]) {
        questionImageUrl = await uploadService.uploadImage(files.question_image[0], 'questions');
      }

      // Determine question order if not provided
      let finalQuestionOrder = question_order;
      if (!finalQuestionOrder) {
        const maxOrder = await Question.max('question_order', {
          where: { election_id: electionId },
          transaction
        });
        finalQuestionOrder = (maxOrder || 0) + 1;
      }

      // Create question
      const question = await Question.create({
        election_id: electionId,
        question_text,
        question_type,
        question_order: finalQuestionOrder,
        is_required,
        min_selections,
        max_selections,
        text_min_length,
        text_max_length,
        question_image_url: questionImageUrl,
        comparison_items,
        plurality_config,
        ranked_choice_config,
        approval_config,
        translated_questions
      }, { transaction });

      // Create answers if provided and question type requires them
      if (this.questionRequiresAnswers(question_type) && answers.length > 0) {
        await this.createAnswersForQuestion(question.id, answers, files.answer_images || [], transaction);
      }

      await transaction.commit();

      return await this.getQuestionById(question.id);

    } catch (error) {
      await transaction.rollback();
      console.error('Create question service error:', error);
      throw error;
    }
  }

  // Get question by ID
  async getQuestionById(questionId) {
    try {
      const question = await Question.findByPk(questionId, {
        include: [
          {
            model: Answer,
            as: 'answers',
            order: [['answer_order', 'ASC']]
          }
        ]
      });

      return question;

    } catch (error) {
      console.error('Get question by ID service error:', error);
      throw error;
    }
  }

  // Get all questions for election
  async getElectionQuestions(electionId) {
    try {
      const questions = await Question.findAll({
        where: { election_id: electionId },
        include: [
          {
            model: Answer,
            as: 'answers',
            order: [['answer_order', 'ASC']]
          }
        ],
        order: [['question_order', 'ASC']]
      });

      return questions;

    } catch (error) {
      console.error('Get election questions service error:', error);
      throw error;
    }
  }

  // Update question
  async updateQuestion(questionId, updateData, files = {}) {
    const transaction = await sequelize.transaction();

    try {
      const question = await Question.findByPk(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Handle image upload if provided
      if (files.question_image && files.question_image[0]) {
        updateData.question_image_url = await uploadService.uploadImage(files.question_image[0], 'questions');
      }

      // Update question
      await question.update(updateData, { transaction });

      // Update answers if provided
      if (updateData.answers && Array.isArray(updateData.answers)) {
        // Delete existing answers
        await Answer.destroy({
          where: { question_id: questionId },
          transaction
        });

        // Create new answers if question type requires them
        if (this.questionRequiresAnswers(question.question_type)) {
          await this.createAnswersForQuestion(questionId, updateData.answers, files.answer_images || [], transaction);
        }
      }

      await transaction.commit();

      return await this.getQuestionById(questionId);

    } catch (error) {
      await transaction.rollback();
      console.error('Update question service error:', error);
      throw error;
    }
  }

  // Delete question
  async deleteQuestion(questionId) {
    const transaction = await sequelize.transaction();

    try {
      const question = await Question.findByPk(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Delete answers first
      await Answer.destroy({
        where: { question_id: questionId },
        transaction
      });

      // Delete question
      await question.destroy({ transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('Delete question service error:', error);
      throw error;
    }
  }

  // Reorder questions
  async reorderQuestions(electionId, questionsOrder) {
    const transaction = await sequelize.transaction();

    try {
      // Update question orders
      for (let i = 0; i < questionsOrder.length; i++) {
        const questionId = questionsOrder[i];
        await Question.update(
          { question_order: i + 1 },
          { 
            where: { 
              id: questionId, 
              election_id: electionId 
            },
            transaction 
          }
        );
      }

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('Reorder questions service error:', error);
      throw error;
    }
  }

  // Create answers for question
  async createAnswersForQuestion(questionId, answersData, answerImages = [], transaction) {
    try {
      for (let i = 0; i < answersData.length; i++) {
        const answerData = answersData[i];
        
        // Handle answer image upload
        let answerImageUrl = null;
        if (answerImages[i]) {
          answerImageUrl = await uploadService.uploadImage(answerImages[i], 'answers');
        } else if (answerData.answer_image_url) {
          answerImageUrl = answerData.answer_image_url;
        }

        await Answer.create({
          question_id: questionId,
          answer_text: answerData.answer_text,
          answer_image_url: answerImageUrl,
          answer_order: i + 1,
          comparison_item_id: answerData.comparison_item_id,
          comparison_attributes: answerData.comparison_attributes || {},
          image_description: answerData.image_description,
          image_alt_text: answerData.image_alt_text,
          translated_answers: answerData.translated_answers || {},
          weight: answerData.weight || 1.0,
          is_correct: answerData.is_correct || false
        }, { transaction });
      }

    } catch (error) {
      console.error('Create answers for question service error:', error);
      throw error;
    }
  }

  // Validate question configuration for voting type
  validateQuestionForVotingType(question, votingType) {
    const errors = [];

    switch (votingType) {
      case 'plurality':
        if (question.max_selections > 1) {
          errors.push('Plurality voting allows only single selection per question');
        }
        break;

      case 'ranked_choice':
        if (question.question_type === QUESTION_TYPES.OPEN_TEXT) {
          errors.push('Ranked choice voting does not support open text questions');
        }
        if (question.answers && question.answers.length < 2) {
          errors.push('Ranked choice voting requires at least 2 answer options');
        }
        break;

      case 'approval':
        if (question.question_type === QUESTION_TYPES.OPEN_TEXT) {
          errors.push('Approval voting does not support open text questions');
        }
        if (question.max_selections < 2) {
          errors.push('Approval voting should allow multiple selections');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Check if question type requires predefined answers
  questionRequiresAnswers(questionType) {
    return [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.IMAGE_BASED,
      QUESTION_TYPES.COMPARISON
    ].includes(questionType);
  }

  // Get question statistics
  async getQuestionStatistics(questionId) {
    try {
      const question = await Question.findByPk(questionId, {
        include: [
          {
            model: Answer,
            as: 'answers'
          }
        ]
      });

      if (!question) {
        throw new Error('Question not found');
      }

      const stats = {
        question_id: questionId,
        question_type: question.question_type,
        total_responses: question.response_count,
        skip_count: question.skip_count,
        response_rate: question.response_count + question.skip_count > 0 
          ? (question.response_count / (question.response_count + question.skip_count)) * 100 
          : 0
      };

      if (question.answers && question.answers.length > 0) {
        stats.answers = question.answers.map(answer => ({
          answer_id: answer.id,
          answer_text: answer.answer_text,
          selection_count: answer.selection_count,
          ranking_sum: answer.ranking_sum,
          approval_count: answer.approval_count,
          percentage: question.response_count > 0 
            ? (answer.selection_count / question.response_count) * 100 
            : 0
        }));
      }

      return stats;

    } catch (error) {
      console.error('Get question statistics service error:', error);
      throw error;
    }
  }

  // Duplicate question
  async duplicateQuestion(questionId, targetElectionId = null) {
    const transaction = await sequelize.transaction();

    try {
      const originalQuestion = await this.getQuestionById(questionId);
      if (!originalQuestion) {
        throw new Error('Original question not found');
      }

      const electionId = targetElectionId || originalQuestion.election_id;

      // Prepare duplicated data
      const questionData = {
        question_text: `${originalQuestion.question_text} (Copy)`,
        question_type: originalQuestion.question_type,
        is_required: originalQuestion.is_required,
        min_selections: originalQuestion.min_selections,
        max_selections: originalQuestion.max_selections,
        text_min_length: originalQuestion.text_min_length,
        text_max_length: originalQuestion.text_max_length,
        comparison_items: originalQuestion.comparison_items,
        plurality_config: originalQuestion.plurality_config,
        ranked_choice_config: originalQuestion.ranked_choice_config,
        approval_config: originalQuestion.approval_config,
        translated_questions: originalQuestion.translated_questions,
        answers: originalQuestion.answers ? originalQuestion.answers.map(answer => ({
          answer_text: answer.answer_text,
          answer_image_url: answer.answer_image_url,
          comparison_item_id: answer.comparison_item_id,
          comparison_attributes: answer.comparison_attributes,
          image_description: answer.image_description,
          image_alt_text: answer.image_alt_text,
          translated_answers: answer.translated_answers,
          weight: answer.weight,
          is_correct: answer.is_correct
        })) : []
      };

      const duplicatedQuestion = await this.createQuestion(electionId, questionData);

      await transaction.commit();

      return duplicatedQuestion;

    } catch (error) {
      await transaction.rollback();
      console.error('Duplicate question service error:', error);
      throw error;
    }
  }
}

export const questionService = new QuestionService();
export default questionService;