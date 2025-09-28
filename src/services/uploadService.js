import cloudinary from '../config/cloudinary.js';
import sharp from 'sharp';
import { FILE_UPLOAD_LIMITS } from '../config/constants.js';

class UploadService {
  // Upload image to Cloudinary
  async uploadImage(file, folder = 'general') {
    try {
      if (!file || !file.buffer) {
        throw new Error('No file provided');
      }

      // Optimize image with Sharp
      const optimizedBuffer = await sharp(file.buffer)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `vottery/${folder}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(optimizedBuffer);
      });

      return result.secure_url;

    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload video to Cloudinary
  async uploadVideo(file, folder = 'general') {
    try {
      if (!file || !file.buffer) {
        throw new Error('No file provided');
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `vottery/${folder}`,
            resource_type: 'video',
            transformation: [
              { quality: 'auto:good' },
              { format: 'mp4' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });

      return result.secure_url;

    } catch (error) {
      console.error('Upload video error:', error);
      throw new Error(`Video upload failed: ${error.message}`);
    }
  }

  // Generate Vottery icon for content creators
  async generateVotteryIcon(electionId) {
    try {
      // Create a simple Vottery icon with election ID
      const iconBuffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 4,
          background: { r: 0, g: 123, b: 255, alpha: 1 }
        }
      })
      .composite([
        {
          input: Buffer.from(`
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="20" fill="#007bff"/>
              <text x="100" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
                VOTTERY
              </text>
              <text x="100" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">
                Click to Vote
              </text>
              <circle cx="100" cy="150" r="15" fill="white" opacity="0.8"/>
              <text x="100" y="155" text-anchor="middle" fill="#007bff" font-family="Arial, sans-serif" font-size="12">
                ${electionId}
              </text>
            </svg>
          `),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();

      // Upload icon to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'vottery/icons',
            public_id: `vottery_icon_${electionId}`,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(iconBuffer);
      });

      return result.secure_url;

    } catch (error) {
      console.error('Generate Vottery icon error:', error);
      throw new Error(`Icon generation failed: ${error.message}`);
    }
  }

  // Upload multiple images (for answers, etc.)
  async uploadMultipleImages(files, folder = 'general') {
    try {
      if (!files || !Array.isArray(files)) {
        return [];
      }

      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return results;

    } catch (error) {
      console.error('Upload multiple images error:', error);
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Delete file error:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Clean up election files
  async cleanupElectionFiles(electionId) {
    try {
      // Delete all files in the election folder
      const result = await cloudinary.api.delete_resources_by_prefix(
        `vottery/elections/${electionId}`
      );

      // Delete the folder itself
      await cloudinary.api.delete_folder(`vottery/elections/${electionId}`);

      console.log(`Cleaned up files for election ${electionId}`);
      return result;

    } catch (error) {
      console.error('Cleanup election files error:', error);
      // Don't throw error as this is cleanup - log and continue
    }
  }

  // Process and validate file
  validateFile(file, type = 'image') {
    if (!file) {
      throw new Error('No file provided');
    }

    const maxSize = type === 'image' ? 
      FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE : 
      FILE_UPLOAD_LIMITS.VIDEO_MAX_SIZE;

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    const allowedTypes = type === 'image' ? 
      FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES : 
      FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES;

    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  // Generate thumbnail
  async generateThumbnail(file, width = 300, height = 300) {
    try {
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(width, height, { 
          fit: 'cover',
          position: 'center' 
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'vottery/thumbnails',
            transformation: [
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(thumbnailBuffer);
      });

      return result.secure_url;

    } catch (error) {
      console.error('Generate thumbnail error:', error);
      throw new Error(`Thumbnail generation failed: ${error.message}`);
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;