import { uploadImage, deleteImage, uploadOptions } from '../config/cloudinary.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, FILE_LIMITS } from '../config/constants.js';

class UploadController {
  // Upload election topic image
  async uploadElectionImage(req, res, next) {
    try {
      const { electionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Validate file size
      if (req.file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE_TOO_LARGE
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, {
        ...uploadOptions.elections,
        public_id: `elections/${electionId}/topic_${Date.now()}`
      });

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.IMAGE_UPLOADED,
        data: {
          image_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      });
    } catch (error) {
      console.error('Upload election image error:', error);
      next(error);
    }
  }

  // Upload election logo
  async uploadElectionLogo(req, res, next) {
    try {
      const { electionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No logo file provided'
        });
      }

      // Validate file size
      if (req.file.size > FILE_LIMITS.MAX_LOGO_SIZE) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE_TOO_LARGE
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, {
        ...uploadOptions.logos,
        public_id: `elections/${electionId}/logo_${Date.now()}`
      });

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.IMAGE_UPLOADED,
        data: {
          logo_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      });
    } catch (error) {
      console.error('Upload election logo error:', error);
      next(error);
    }
  }

  // Upload question image
  async uploadQuestionImage(req, res, next) {
    try {
      const { questionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Validate file size
      if (req.file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE_TOO_LARGE
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, {
        ...uploadOptions.questions,
        public_id: `questions/${questionId}/image_${Date.now()}`
      });

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.IMAGE_UPLOADED,
        data: {
          image_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      });
    } catch (error) {
      console.error('Upload question image error:', error);
      next(error);
    }
  }

  // Upload answer images (multiple)
  async uploadAnswerImages(req, res, next) {
    try {
      const { questionId } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
      }

      // Validate each file
      for (const file of req.files) {
        if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} exceeds maximum size limit`
          });
        }
      }

      // Upload all images
      const uploadPromises = req.files.map((file, index) => 
        uploadImage(file.buffer, {
          ...uploadOptions.answers,
          public_id: `answers/${questionId}/option_${index}_${Date.now()}`
        })
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map(result => ({
        image_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }));

      res.status(200).json({
        success: true,
        message: `${results.length} images uploaded successfully`,
        data: {
          images: uploadedImages,
          count: results.length
        }
      });
    } catch (error) {
      console.error('Upload answer images error:', error);
      next(error);
    }
  }

  // Upload election video
  async uploadElectionVideo(req, res, next) {
    try {
      const { electionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No video file provided'
        });
      }

      // Validate file size
      if (req.file.size > FILE_LIMITS.MAX_VIDEO_SIZE) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE_TOO_LARGE
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, {
        ...uploadOptions.videos,
        public_id: `elections/${electionId}/video_${Date.now()}`
      });

      res.status(200).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          video_url: result.secure_url,
          public_id: result.public_id,
          duration: result.duration,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height
        }
      });
    } catch (error) {
      console.error('Upload election video error:', error);
      next(error);
    }
  }

  // Delete uploaded file
  async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      // Delete from Cloudinary
      const result = await deleteImage(publicId);

      if (result.result === 'ok') {
        res.status(200).json({
          success: true,
          message: 'File deleted successfully',
          data: {
            public_id: publicId,
            result: result.result
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found or already deleted',
          data: {
            public_id: publicId,
            result: result.result
          }
        });
      }
    } catch (error) {
      console.error('Delete file error:', error);
      next(error);
    }
  }

  // Get upload progress (placeholder for future implementation)
  async getUploadProgress(req, res, next) {
    try {
      const { uploadId } = req.params;
      
      // This would typically track upload progress in Redis or database
      res.status(200).json({
        success: true,
        data: {
          upload_id: uploadId,
          progress: 100,
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Get upload progress error:', error);
      next(error);
    }
  }

  // Batch upload multiple files
  async batchUpload(req, res, next) {
    try {
      const { type, targetId } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided for batch upload'
        });
      }

      const uploadPromises = req.files.map((file, index) => {
        let options;
        let publicIdPrefix;

        switch (type) {
          case 'election_images':
            options = uploadOptions.elections;
            publicIdPrefix = `elections/${targetId}/batch_${index}_${Date.now()}`;
            break;
          case 'question_images':
            options = uploadOptions.questions;
            publicIdPrefix = `questions/${targetId}/batch_${index}_${Date.now()}`;
            break;
          case 'answer_images':
            options = uploadOptions.answers;
            publicIdPrefix = `answers/${targetId}/batch_${index}_${Date.now()}`;
            break;
          default:
            throw new Error('Invalid upload type');
        }

        return uploadImage(file.buffer, {
          ...options,
          public_id: publicIdPrefix
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadedFiles = results.map((result, index) => ({
        original_name: req.files[index].originalname,
        file_url: result.secure_url,
        public_id: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      }));

      res.status(200).json({
        success: true,
        message: `${results.length} files uploaded successfully`,
        data: {
          files: uploadedFiles,
          count: results.length,
          type: type,
          target_id: targetId
        }
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      next(error);
    }
  }

  // Get file information
  async getFileInfo(req, res, next) {
    try {
      const { publicId } = req.params;
      
      // This would typically get file info from Cloudinary
      res.status(200).json({
        success: true,
        data: {
          public_id: publicId,
          // Additional file info would be fetched here
        }
      });
    } catch (error) {
      console.error('Get file info error:', error);
      next(error);
    }
  }
}

export default new UploadController();