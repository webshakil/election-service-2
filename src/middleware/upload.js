import multer from 'multer';
import { FILE_UPLOAD_LIMITS } from '../config/constants.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type based on field name
  if (file.fieldname.includes('image')) {
    // Check image types
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type. Allowed types: ${FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.join(', ')}`));
    }
  } else if (file.fieldname.includes('video')) {
    // Check video types
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid video type. Allowed types: ${FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.join(', ')}`));
    }
  } else {
    cb(new Error('Unknown file field'));
  }
};

const limits = {
  fileSize: (req, file) => {
    if (file.fieldname.includes('image')) {
      return FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE;
    } else if (file.fieldname.includes('video')) {
      return FILE_UPLOAD_LIMITS.VIDEO_MAX_SIZE;
    }
    return FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE;
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD_LIMITS.VIDEO_MAX_SIZE // Use largest limit, will be checked per file
  }
});

// Create upload functions for single and multiple files
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        error: 'File size exceeds maximum allowed size'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        error: 'Number of files exceeds maximum allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'File field not allowed'
      });
    }
  }
  
  if (err.message.includes('Invalid')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: err.message
    });
  }
  
  next(err);
};

// Default export
export default {
  upload,
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
// import multer from 'multer';
// import { FILE_UPLOAD_LIMITS } from '../config/constants.js';

// // Configure multer for file uploads
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   // Check file type based on field name
//   if (file.fieldname.includes('image')) {
//     // Check image types
//     const ext = file.originalname.split('.').pop().toLowerCase();
//     if (FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Invalid image type. Allowed types: ${FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.join(', ')}`));
//     }
//   } else if (file.fieldname.includes('video')) {
//     // Check video types
//     const ext = file.originalname.split('.').pop().toLowerCase();
//     if (FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Invalid video type. Allowed types: ${FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.join(', ')}`));
//     }
//   } else {
//     cb(new Error('Unknown file field'));
//   }
// };

// const limits = {
//   fileSize: (req, file) => {
//     if (file.fieldname.includes('image')) {
//       return FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE;
//     } else if (file.fieldname.includes('video')) {
//       return FILE_UPLOAD_LIMITS.VIDEO_MAX_SIZE;
//     }
//     return FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE;
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: FILE_UPLOAD_LIMITS.VIDEO_MAX_SIZE // Use largest limit, will be checked per file
//   }
// });

// // Error handling middleware for multer
// export const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({
//         success: false,
//         message: 'File too large',
//         error: 'File size exceeds maximum allowed size'
//       });
//     }
//     if (err.code === 'LIMIT_FILE_COUNT') {
//       return res.status(400).json({
//         success: false,
//         message: 'Too many files',
//         error: 'Number of files exceeds maximum allowed'
//       });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({
//         success: false,
//         message: 'Unexpected file field',
//         error: 'File field not allowed'
//       });
//     }
//   }
  
//   if (err.message.includes('Invalid')) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid file type',
//       error: err.message
//     });
//   }

//   next(err);
// };

// export default {
//   upload,
//   handleUploadError
// };
