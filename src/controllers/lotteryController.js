import { ElectionLottery, Election } from '../models/index.js';
import { lotteryService } from '../services/lotteryService.js';
import { validationResult } from 'express-validator';
import { ADMIN_ROLES } from '../config/constants.js';

class LotteryController {
  // Execute lottery manually
  async executeLottery(req, res) {
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

      const canExecute = await this.checkLotteryExecutePermission(user, election);
      if (!canExecute.allowed) {
        return res.status(403).json({
          success: false,
          message: canExecute.message
        });
      }

      const lottery = await ElectionLottery.findOne({ where: { election_id } });
      if (!lottery || !lottery.lottery_enabled) {
        return res.status(400).json({
          success: false,
          message: 'Lottery is not enabled for this election'
        });
      }

      if (lottery.lottery_executed) {
        return res.status(400).json({
          success: false,
          message: 'Lottery has already been executed'
        });
      }

      const result = await lotteryService.executeLottery(election_id, user.id);

      return res.status(200).json({
        success: true,
        message: 'Lottery executed successfully',
        data: result
      });

    } catch (error) {
      console.error('Execute lottery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to execute lottery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get lottery status and results
  async getLotteryStatus(req, res) {
    try {
      const { election_id } = req.params;

      const lottery = await lotteryService.getLotteryStatus(election_id);
      if (!lottery) {
        return res.status(404).json({
          success: false,
          message: 'Lottery not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: lottery
      });

    } catch (error) {
      console.error('Get lottery status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve lottery status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update lottery configuration
  async updateLotteryConfig(req, res) {
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
      const lotteryData = req.body;

      const election = await Election.findByPk(election_id);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const canModify = await this.checkLotteryModifyPermission(user, election);
      if (!canModify.allowed) {
        return res.status(403).json({
          success: false,
          message: canModify.message
        });
      }

      const updatedLottery = await lotteryService.updateLotteryConfig(election_id, lotteryData);

      return res.status(200).json({
        success: true,
        message: 'Lottery configuration updated successfully',
        data: updatedLottery
      });

    } catch (error) {
      console.error('Update lottery config error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update lottery configuration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add participant to lottery
  async addParticipant(req, res) {
    try {
      const { election_id } = req.params;
      const { participant_id, voting_id } = req.body;

      const lottery = await ElectionLottery.findOne({ where: { election_id } });
      if (!lottery || !lottery.lottery_enabled) {
        return res.status(400).json({
          success: false,
          message: 'Lottery is not enabled for this election'
        });
      }

      await lotteryService.addParticipant(election_id, participant_id, voting_id);

      return res.status(200).json({
        success: true,
        message: 'Participant added to lottery successfully'
      });

    } catch (error) {
      console.error('Add lottery participant error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add participant to lottery',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get lottery machine visualization data
  async getLotteryMachine(req, res) {
    try {
      const { election_id } = req.params;

      const machineData = await lotteryService.getLotteryMachineData(election_id);
      if (!machineData) {
        return res.status(404).json({
          success: false,
          message: 'Lottery machine data not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: machineData
      });

    } catch (error) {
      console.error('Get lottery machine error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve lottery machine data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Distribute prizes to winners
  async distributePrizes(req, res) {
    try {
      const { election_id } = req.params;
      const { user } = req;

      const canDistribute = await this.checkPrizeDistributionPermission(user);
      if (!canDistribute.allowed) {
        return res.status(403).json({
          success: false,
          message: canDistribute.message
        });
      }

      const lottery = await ElectionLottery.findOne({ where: { election_id } });
      if (!lottery || !lottery.lottery_executed) {
        return res.status(400).json({
          success: false,
          message: 'Lottery has not been executed yet'
        });
      }

      if (lottery.prizes_distributed) {
        return res.status(400).json({
          success: false,
          message: 'Prizes have already been distributed'
        });
      }

      const result = await lotteryService.distributePrizes(election_id, user.id);

      return res.status(200).json({
        success: true,
        message: 'Prizes distributed successfully',
        data: result
      });

    } catch (error) {
      console.error('Distribute prizes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to distribute prizes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get lottery verification data
  async getLotteryVerification(req, res) {
    try {
      const { election_id } = req.params;

      const verification = await lotteryService.getLotteryVerification(election_id);
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'Lottery verification data not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: verification
      });

    } catch (error) {
      console.error('Get lottery verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve lottery verification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper methods for permission checking
  async checkLotteryExecutePermission(user, election) {
    if (!user) {
      return { allowed: false, message: 'Authentication required' };
    }

    // Admin roles can execute lottery
    if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN].includes(user.admin_role)) {
      return { allowed: true };
    }

    // Election creator can execute their lottery
    if (election.creator_id === user.id) {
      return { allowed: true };
    }

    return { allowed: false, message: 'Only election creator or admin can execute lottery' };
  }

  async checkLotteryModifyPermission(user, election) {
    if (!user) {
      return { allowed: false, message: 'Authentication required' };
    }

    // Admin roles can modify lottery
    if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.SPONSOR].includes(user.admin_role)) {
      return { allowed: true };
    }

    // Election creator can modify their lottery
    if (election.creator_id === user.id) {
      // Check if election can be edited
      if (election.status !== 'draft') {
        return { allowed: false, message: 'Lottery cannot be modified after election is activated' };
      }
      return { allowed: true };
    }

    return { allowed: false, message: 'Only election creator can modify lottery' };
  }

  async checkPrizeDistributionPermission(user) {
    if (!user) {
      return { allowed: false, message: 'Authentication required' };
    }

    // Admin roles and sponsors can distribute prizes
    if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.SPONSOR].includes(user.admin_role)) {
      return { allowed: true };
    }

    return { allowed: false, message: 'Prize distribution requires admin privileges' };
  }
}

export default new LotteryController();