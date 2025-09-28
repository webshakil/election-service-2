import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload options for different image types
export const uploadOptions = {
  elections: {
    folder: 'vottery/elections',
    transformation: [
      { width: 1200, height: 630, crop: 'fill', quality: 'auto', format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    max_file_size: 5000000, // 5MB
  },
  
  logos: {
    folder: 'vottery/election-logos',
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    max_file_size: 2000000, // 2MB
  },
  
  questions: {
    folder: 'vottery/questions',
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto', format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    max_file_size: 3000000, // 3MB
  },
  
  answers: {
    folder: 'vottery/answers',
    transformation: [
      { width: 600, height: 400, crop: 'fill', quality: 'auto', format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    max_file_size: 2000000, // 2MB
  },
  
  videos: {
    folder: 'vottery/election-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
    max_file_size: 100000000, // 100MB
    transformation: [
      { quality: 'auto', format: 'auto' },
    ],
  }
};

// Upload single image
export const uploadImage = async (buffer, options = {}) => {
  try {
    const uploadOptions = {
      ...options,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Image uploaded successfully:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('❌ Upload image error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadImage(file.buffer, {
        ...options,
        public_id: `${options.folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    );

    const results = await Promise.all(uploadPromises);
    console.log(`✅ Uploaded ${results.length} images successfully`);
    return results;
  } catch (error) {
    console.error('❌ Upload multiple images error:', error);
    throw error;
  }
};

// Delete image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image deleted:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Delete image error:', error);
    throw error;
  }
};

// Delete multiple images
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => cloudinary.uploader.destroy(id));
    const results = await Promise.all(deletePromises);
    console.log(`🗑️ Deleted ${results.length} images`);
    return results;
  } catch (error) {
    console.error('❌ Delete multiple images error:', error);
    throw error;
  }
};

// Get image info
export const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('❌ Get image info error:', error);
    throw error;
  }
};

// Generate optimized URL
export const generateOptimizedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...options
    });
  } catch (error) {
    console.error('❌ Generate optimized URL error:', error);
    throw error;
  }
};

// Health check for Cloudinary
export const healthCheck = async () => {
  try {
    const result = await cloudinary.api.ping();
    return {
      status: 'healthy',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  }
};

export default cloudinary;