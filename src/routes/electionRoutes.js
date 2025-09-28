//for debugging
//ONe route call for all operation
import express from 'express';
import multer from 'multer';

console.log('🔍 LOADING ELECTION ROUTES FILE...');

try {
  console.log('🔍 Importing controllers from:', '../controllers/electionController.js');
  const controllers = await import('../controllers/electionController.js');
  console.log('🔍 Available exports:', Object.keys(controllers));
  
  const { createElection, getElection, updateElection, deleteElection, getAllElections } = controllers;
  
  console.log('✅ createElection imported:', typeof createElection);
  console.log('✅ Controllers imported successfully');
} catch (error) {
  console.error('❌ CONTROLLER IMPORT ERROR:', error);
}

// For now, let's import normally but add error handling
import { createElection, getElection, updateElection, deleteElection, getAllElections } from '../controllers/electionController.js';

const router = express.Router();

// Test route to verify router works
router.get('/test', (req, res) => {
  console.log('📍 TEST ROUTE HIT - Routes are working!');
  res.json({ 
    success: true, 
    message: 'Election routes are working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

console.log('🔍 Registering POST /create route...');

// Wrap createElection with debug middleware
const debugCreateElection = (req, res, next) => {
  console.log('📍 POST /create ROUTE HIT!');
  console.log('📍 Request body keys:', Object.keys(req.body));
  console.log('📍 Files uploaded:', req.files ? Object.keys(req.files) : 'none');
  console.log('📍 Content-Type:', req.headers['content-type']);
  
  // Call the actual controller
  createElection(req, res, next);
};

// Election routes
router.post('/create', upload.fields([
  { name: 'topicImage', maxCount: 1 },
  { name: 'logoBranding', maxCount: 1 },
  { name: 'questionImages', maxCount: 50 },
  { name: 'answerImages', maxCount: 200 }
]), debugCreateElection);

router.get('/:id', getElection);
router.get('/', getAllElections);
router.put('/:id', upload.fields([
  { name: 'topicImage', maxCount: 1 },
  { name: 'logoBranding', maxCount: 1 },
  { name: 'questionImages', maxCount: 50 },
  { name: 'answerImages', maxCount: 200 }
]), updateElection);
router.delete('/:id', deleteElection);

console.log('✅ ALL ROUTES REGISTERED');

export default router;
// //ONe route call for all operation
// import express from 'express';
// import multer from 'multer';
// import { createElection, getElection, updateElection, deleteElection, getAllElections } from '../controllers/electionController.js';

// const router = express.Router();

// // Configure multer for handling file uploads
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Allow images and videos
//     if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image and video files are allowed'), false);
//     }
//   }
// });

// // Election routes
// router.post('/create', upload.fields([
//   { name: 'topicImage', maxCount: 1 },
//   { name: 'logoBranding', maxCount: 1 },
//   { name: 'questionImages', maxCount: 50 },
//   { name: 'answerImages', maxCount: 200 }
// ]), createElection);

// router.get('/:id', getElection);
// router.get('/', getAllElections);
// router.put('/:id', upload.fields([
//   { name: 'topicImage', maxCount: 1 },
//   { name: 'logoBranding', maxCount: 1 },
//   { name: 'questionImages', maxCount: 50 },
//   { name: 'answerImages', maxCount: 200 }
// ]), updateElection);
// router.delete('/:id', deleteElection);

// export default router;
// import express from 'express';
// import electionController from '../controllers/electionController.js';
// import { roleAuth } from '../middleware/roleAuth.js';
// import { validateElectionCreation, validateElectionUpdate } from '../validators/electionValidators.js';
// import { upload } from '../middleware/upload.js';

// const router = express.Router();

// // Election CRUD routes
// router.post('/', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   upload.fields([
//     { name: 'topic_image', maxCount: 1 },
//     { name: 'topic_video', maxCount: 1 },
//     { name: 'logo_image', maxCount: 1 }
//   ]),
//   validateElectionCreation,
//   electionController.createElection
// );

// router.get('/', 
//   roleAuth(['manager', 'admin', 'moderator', 'analyst']),
//   electionController.getElections
// );

// router.get('/user/elections', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed']),
//   electionController.getUserElections
// );

// router.get('/:id', 
//   electionController.getElection
// );

// router.put('/:id', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   upload.fields([
//     { name: 'topic_image', maxCount: 1 },
//     { name: 'topic_video', maxCount: 1 }
//   ]),
//   validateElectionUpdate,
//   electionController.updateElection
// );

// router.delete('/:id', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   electionController.deleteElection
// );

// // Election management routes
// router.post('/:id/clone', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   electionController.cloneElection
// );

// router.post('/:id/activate', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   electionController.activateElection
// );

// router.get('/:id/stats', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'analyst']),
//   electionController.getElectionStats
// );

// router.get('/:id/export', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin', 'analyst']),
//   electionController.exportElection
// );

// // Election components update routes
// router.put('/:id/branding', 
//   roleAuth(['individual_subscribed', 'organization_subscribed', 'manager', 'admin']),
//   upload.single('logo_image'),
//   electionController.updateBranding
// );

// router.put('/:id/access', 
//   roleAuth(['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed', 'manager', 'admin']),
//   electionController.updateAccessControl
// );

// router.put('/:id/security', 
//   roleAuth(['individual_subscribed', 'organization_subscribed', 'manager', 'admin']),
//   electionController.updateSecurity
// );

// router.post('/:id/custom-url', 
//   roleAuth(['individual_subscribed', 'organization_subscribed', 'manager', 'admin']),
//   electionController.generateCustomUrl
// );

// export default router;