import express from 'express';
import lotteryController from '../controllers/lotteryController.js';
import { roleAuth } from '../middleware/roleAuth.js';
import { validateLotteryConfig } from '../validators/lotteryValidators.js';

const router = express.Router();

// Lottery execution routes
router.post('/elections/:election_id/execute', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
  lotteryController.executeLottery
);

router.get('/elections/:election_id/status', 
  lotteryController.getLotteryStatus
);

router.get('/elections/:election_id/machine', 
  lotteryController.getLotteryMachine
);

router.get('/elections/:election_id/verification', 
  lotteryController.getLotteryVerification
);

// Lottery configuration routes
router.put('/elections/:election_id/config', 
  roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'sponsor']),
  validateLotteryConfig,
  lotteryController.updateLotteryConfig
);

// Participant management
router.post('/elections/:election_id/participants', 
  lotteryController.addParticipant
);

// Prize distribution
router.post('/elections/:election_id/distribute', 
  roleAuth(['manager', 'admin', 'sponsor']),
  lotteryController.distributePrizes
);

export default router;
