import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { roleAuth } from '../middleware/roleAuth.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Upload election topic image
router.post(
  '/election/:electionId/image',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadSingle('image'),
  uploadController.uploadElectionImage
);

// Upload election logo
router.post(
  '/election/:electionId/logo',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadSingle('logo'),
  uploadController.uploadElectionLogo
);

// Upload election video
router.post(
  '/election/:electionId/video',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadSingle('video'),
  uploadController.uploadElectionVideo
);

// Upload question image
router.post(
  '/question/:questionId/image',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadSingle('image'),
  uploadController.uploadQuestionImage
);

// Upload multiple answer images
router.post(
  '/question/:questionId/answer-images',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadMultiple('images', 50), // Max 50 images per question
  uploadController.uploadAnswerImages
);

// Batch upload multiple files
router.post(
  '/batch',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadMultiple('files', 20), // Max 20 files in batch
  uploadController.batchUpload
);

// Delete uploaded file
router.delete(
  '/file/:publicId',
  roleAuth(['individual_subscribed', 'organization_subscribed', 'content_creator', 'manager', 'admin']),
  uploadController.deleteFile
);

// Get file information
router.get(
  '/file/:publicId/info',
  roleAuth(['all']),
  uploadController.getFileInfo
);

// Get upload progress (for future implementation)
router.get(
  '/progress/:uploadId',
  roleAuth(['all']),
  uploadController.getUploadProgress
);

export default router;