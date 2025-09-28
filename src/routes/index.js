import express from 'express';
import electionRoutes from './electionRoutes.js';
import questionRoutes from './questionRoutes.js';
import lotteryRoutes from './lotteryRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// API version and service info
router.get('/', (req, res) => {
  res.json({
    service: 'Vottery Election Creation Service',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      elections: '/elections',
      questions: '/questions',
      lottery: '/lottery',
      uploads: '/uploads'
    }
  });
});

// Mount route modules
router.use('/elections', electionRoutes);
router.use('/questions', questionRoutes);
router.use('/lottery', lotteryRoutes);
router.use('/uploads', uploadRoutes);

export default router;