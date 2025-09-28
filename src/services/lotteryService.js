import { ElectionLottery, Election, sequelize } from '../models/index.js';
import { securityService } from './securityService.js';
import { notificationService } from './notificationService.js';
import { randomBytes, randomInt } from 'node:crypto';
import { PRIZE_TYPES } from '../config/constants.js';

class LotteryService {
  // Initialize lottery for election
  async initializeLottery(electionId, transaction = null) {
    try {
      const shouldCommit = !transaction;
      if (!transaction) {
        transaction = await sequelize.transaction();
      }

      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery || !lottery.lottery_enabled) {
        if (shouldCommit) await transaction.rollback();
        return;
      }

      // Generate RNG seed for lottery
      const rngSeed = randomBytes(32).toString('hex');
      
      await lottery.update({
        rng_seed: rngSeed,
        lottery_hash: await this.generateLotteryHash(electionId, rngSeed)
      }, { transaction });

      lottery.addToAuditTrail('LOTTERY_INITIALIZED', {
        rng_seed_generated: true,
        timestamp: new Date()
      });

      await lottery.save({ transaction });

      if (shouldCommit) {
        await transaction.commit();
      }

      console.log(`Lottery initialized for election ${electionId}`);

    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error('Initialize lottery service error:', error);
      throw error;
    }
  }

  // Execute lottery
  async executeLottery(electionId, executedBy = null) {
    const transaction = await sequelize.transaction();

    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery) {
        throw new Error('Lottery not found');
      }

      if (!lottery.canExecute()) {
        throw new Error('Lottery cannot be executed');
      }

      // Get participants
      const participants = lottery.participant_ids || [];
      if (participants.length === 0) {
        throw new Error('No participants in lottery');
      }

      // Execute RNG and select winners
      const winners = await this.selectWinners(lottery, participants);

      // Update lottery with results
      await lottery.update({
        lottery_executed: true,
        execution_timestamp: new Date(),
        execution_method: executedBy ? 'manual' : 'automatic',
        winners,
        lottery_hash: await this.generateExecutionHash(electionId, winners, lottery.rng_seed)
      }, { transaction });

      // Log execution in audit trail
      lottery.addToAuditTrail('LOTTERY_EXECUTED', {
        execution_method: executedBy ? 'manual' : 'automatic',
        executed_by: executedBy,
        winner_count: winners.length,
        total_participants: participants.length,
        winners: winners.map(w => ({ participant_id: w.participant_id, rank: w.rank }))
      });

      await lottery.save({ transaction });

      // Send notifications
      await notificationService.sendLotteryExecutedNotification(electionId, winners);

      await transaction.commit();

      return {
        lottery_id: lottery.id,
        election_id: electionId,
        winners,
        total_participants: participants.length,
        execution_timestamp: lottery.execution_timestamp,
        verification_hash: lottery.lottery_hash
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Execute lottery service error:', error);
      throw error;
    }
  }

  // Select winners using cryptographically secure RNG
  async selectWinners(lottery, participants) {
    try {
      const { winner_count, prize_distribution } = lottery;
      const winners = [];

      // Create a copy of participants to avoid modifying original
      const availableParticipants = [...participants];

      for (let rank = 1; rank <= winner_count; rank++) {
        if (availableParticipants.length === 0) break;

        // Generate cryptographically secure random index
        const randomIndex = randomInt(0, availableParticipants.length);
        const selectedParticipant = availableParticipants[randomIndex];

        // Calculate prize for this rank
        const prizeInfo = prize_distribution.find(p => p.rank === rank) || 
                          { rank, percentage: 100 / winner_count };
        
        const totalPrize = lottery.getTotalPrizeValue();
        const prizeAmount = (totalPrize * prizeInfo.percentage) / 100;

        winners.push({
          rank,
          participant_id: selectedParticipant,
          prize_amount: prizeAmount,
          prize_currency: lottery.monetary_currency || 'USD',
          prize_type: lottery.prize_type,
          selected_at: new Date()
        });

        // Remove selected participant
        availableParticipants.splice(randomIndex, 1);
      }

      return winners;

    } catch (error) {
      console.error('Select winners service error:', error);
      throw error;
    }
  }

  // Add participant to lottery
  async addParticipant(electionId, participantId, votingId) {
    const transaction = await sequelize.transaction();

    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery || !lottery.lottery_enabled) {
        throw new Error('Lottery not enabled for this election');
      }

      if (lottery.lottery_executed) {
        throw new Error('Lottery has already been executed');
      }

      // Add participant if not already included
      lottery.addParticipant(participantId);
      
      lottery.addToAuditTrail('PARTICIPANT_ADDED', {
        participant_id: participantId,
        voting_id: votingId,
        timestamp: new Date()
      });

      await lottery.save({ transaction });
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('Add participant service error:', error);
      throw error;
    }
  }

  // Update lottery configuration
  async updateLotteryConfig(electionId, configData) {
    const transaction = await sequelize.transaction();

    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery) {
        throw new Error('Lottery not found');
      }

      if (lottery.lottery_executed) {
        throw new Error('Cannot update executed lottery');
      }

      // Validate configuration
      const validation = this.validateLotteryConfig(configData);
      if (!validation.valid) {
        throw new Error(`Invalid lottery configuration: ${validation.errors.join(', ')}`);
      }

      await lottery.update(configData, { transaction });

      lottery.addToAuditTrail('CONFIG_UPDATED', {
        updated_fields: Object.keys(configData),
        timestamp: new Date()
      });

      await lottery.save({ transaction });
      await transaction.commit();

      return lottery;

    } catch (error) {
      await transaction.rollback();
      console.error('Update lottery config service error:', error);
      throw error;
    }
  }

  // Get lottery status
  async getLotteryStatus(electionId) {
    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId },
        include: [{
          model: Election,
          as: 'election'
        }]
      });

      if (!lottery) {
        return null;
      }

      return {
        lottery_id: lottery.id,
        election_id: electionId,
        lottery_enabled: lottery.lottery_enabled,
        lottery_executed: lottery.lottery_executed,
        execution_timestamp: lottery.execution_timestamp,
        prize_type: lottery.prize_type,
        total_prize_value: lottery.getTotalPrizeValue(),
        winner_count: lottery.winner_count,
        eligible_participants: lottery.eligible_participants,
        winners: lottery.winners || [],
        machine_visible: lottery.machine_visible,
        prizes_distributed: lottery.prizes_distributed,
        can_execute: lottery.canExecute(),
        verification_url: lottery.verification_url
      };

    } catch (error) {
      console.error('Get lottery status service error:', error);
      throw error;
    }
  }

  // Get lottery machine visualization data
  async getLotteryMachineData(electionId) {
    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery || !lottery.machine_visible) {
        return null;
      }

      return {
        machine_style: lottery.machine_style,
        animation_enabled: lottery.machine_animation_enabled,
        ball_color_scheme: lottery.ball_color_scheme,
        custom_ball_colors: lottery.custom_ball_colors,
        total_balls: lottery.total_lottery_balls,
        prize_display: {
          total_value: lottery.getTotalPrizeValue(),
          currency: lottery.monetary_currency || 'USD',
          winner_count: lottery.winner_count,
          prize_type: lottery.prize_type
        },
        status: lottery.lottery_executed ? 'completed' : 'active',
        winners: lottery.lottery_executed ? lottery.winners : null
      };

    } catch (error) {
      console.error('Get lottery machine data service error:', error);
      throw error;
    }
  }

  // Distribute prizes to winners
  async distributePrizes(electionId, distributedBy) {
    const transaction = await sequelize.transaction();

    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery || !lottery.lottery_executed) {
        throw new Error('Lottery has not been executed');
      }

      if (lottery.prizes_distributed) {
        throw new Error('Prizes have already been distributed');
      }

      const winners = lottery.winners || [];
      const distributionResults = [];

      for (const winner of winners) {
        const distribution = {
          winner_id: winner.participant_id,
          rank: winner.rank,
          prize_amount: winner.prize_amount,
          prize_currency: winner.prize_currency,
          distribution_method: lottery.shouldAutoDistribute(winner.prize_amount) ? 'automatic' : 'manual',
          distributed_at: new Date(),
          distributed_by: distributedBy,
          status: 'completed'
        };

        distributionResults.push(distribution);
      }

      // Update lottery
      await lottery.update({
        prizes_distributed: true,
        distribution_log: distributionResults
      }, { transaction });

      lottery.addToAuditTrail('PRIZES_DISTRIBUTED', {
        distributed_by: distributedBy,
        distribution_count: distributionResults.length,
        total_amount: distributionResults.reduce((sum, d) => sum + d.prize_amount, 0),
        timestamp: new Date()
      });

      await lottery.save({ transaction });

      // Send notifications to winners
      await notificationService.sendPrizeDistributionNotification(electionId, distributionResults);

      await transaction.commit();

      return distributionResults;

    } catch (error) {
      await transaction.rollback();
      console.error('Distribute prizes service error:', error);
      throw error;
    }
  }

  // Get lottery verification data
  async getLotteryVerification(electionId) {
    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery) {
        return null;
      }

      return {
        election_id: electionId,
        lottery_executed: lottery.lottery_executed,
        execution_timestamp: lottery.execution_timestamp,
        rng_algorithm: lottery.rng_algorithm,
        lottery_hash: lottery.lottery_hash,
        audit_trail: lottery.audit_trail,
        public_verification_enabled: lottery.public_verification_enabled,
        blockchain_transaction_id: lottery.blockchain_transaction_id,
        verification_steps: [
          {
            step: 1,
            description: 'Verify participant list integrity',
            verifiable: true
          },
          {
            step: 2,
            description: 'Verify RNG seed and algorithm',
            verifiable: true
          },
          {
            step: 3,
            description: 'Verify winner selection process',
            verifiable: lottery.lottery_executed
          },
          {
            step: 4,
            description: 'Verify blockchain record (if enabled)',
            verifiable: !!lottery.blockchain_transaction_id
          }
        ]
      };

    } catch (error) {
      console.error('Get lottery verification service error:', error);
      throw error;
    }
  }

  // Generate lottery hash for integrity
  async generateLotteryHash(electionId, rngSeed) {
    const data = {
      election_id: electionId,
      rng_seed: rngSeed,
      timestamp: new Date().toISOString()
    };
    
    return securityService.hashData(data);
  }

  // Generate execution hash
  async generateExecutionHash(electionId, winners, rngSeed) {
    const data = {
      election_id: electionId,
      winners: winners.map(w => ({ 
        participant_id: w.participant_id, 
        rank: w.rank 
      })),
      rng_seed: rngSeed,
      execution_timestamp: new Date().toISOString()
    };
    
    return securityService.hashData(data);
  }

  // Validate lottery configuration
  validateLotteryConfig(config) {
    const errors = [];

    if (config.winner_count && (config.winner_count < 1 || config.winner_count > 100)) {
      errors.push('Winner count must be between 1 and 100');
    }

    if (config.prize_type === PRIZE_TYPES.MONETARY && config.monetary_amount <= 0) {
      errors.push('Monetary amount must be greater than 0');
    }

    if (config.projected_revenue_percentage && 
        (config.projected_revenue_percentage < 1 || config.projected_revenue_percentage > 100)) {
      errors.push('Revenue percentage must be between 1 and 100');
    }

    if (config.prize_distribution && Array.isArray(config.prize_distribution)) {
      const totalPercentage = config.prize_distribution.reduce((sum, p) => sum + p.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push('Prize distribution percentages must sum to 100%');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Schedule lottery execution
  async scheduleLotteryExecution(electionId, triggerTime) {
    try {
      const lottery = await ElectionLottery.findOne({
        where: { election_id: electionId }
      });

      if (!lottery) {
        throw new Error('Lottery not found');
      }

      await lottery.update({
        lottery_trigger_time: new Date(triggerTime),
        auto_trigger_at_election_end: false
      });

      lottery.addToAuditTrail('EXECUTION_SCHEDULED', {
        scheduled_time: triggerTime,
        timestamp: new Date()
      });

      await lottery.save();

      console.log(`Lottery execution scheduled for election ${electionId} at ${triggerTime}`);

    } catch (error) {
      console.error('Schedule lottery execution service error:', error);
      throw error;
    }
  }
}

export const lotteryService = new LotteryService();
export default lotteryService;