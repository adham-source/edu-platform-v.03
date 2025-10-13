import { Request, Response } from 'express';
import { MinioClient } from '../../utils/minio-client';
import logger from '../../config/logger';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Upload course thumbnail
export const uploadThumbnail = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed for thumbnails.' });
    }

    const filePath = await MinioClient.uploadFile(
      'thumbnails',
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'courses'
    );

    // Generate a presigned URL for immediate access
    const fileUrl = await MinioClient.getFileUrl(filePath, 7 * 24 * 60 * 60); // 7 days

    logger.info(`Thumbnail uploaded: ${filePath}`);
    res.status(200).json({
      message: 'Thumbnail uploaded successfully.',
      filePath,
      fileUrl,
    });
  } catch (error) {
    logger.error('Error uploading thumbnail:', error);
    res.status(500).json({ message: 'Error uploading thumbnail.' });
  }
};

// Upload lesson video
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ message: 'Only video files are allowed.' });
    }

    const { courseId, lessonId } = req.body;
    const folder = courseId ? `course-${courseId}` : 'general';

    const filePath = await MinioClient.uploadFile(
      'videos',
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    logger.info(`Video uploaded: ${filePath}`);
    res.status(200).json({
      message: 'Video uploaded successfully.',
      filePath,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    logger.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video.' });
  }
};

// Get file URL
export const getFileUrl = async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    const { expiry = 3600 } = req.query; // Default 1 hour

    if (!filePath) {
      return res.status(400).json({ message: 'File path is required.' });
    }

    const decodedPath = decodeURIComponent(filePath);
    const fileExists = await MinioClient.fileExists(decodedPath);
    
    if (!fileExists) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const fileUrl = await MinioClient.getFileUrl(decodedPath, parseInt(expiry as string));

    res.status(200).json({
      fileUrl,
      expiresIn: expiry,
    });
  } catch (error) {
    logger.error('Error generating file URL:', error);
    res.status(500).json({ message: 'Error generating file URL.' });
  }
};

// Delete file
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;

    if (!filePath) {
      return res.status(400).json({ message: 'File path is required.' });
    }

    const decodedPath = decodeURIComponent(filePath);
    const fileExists = await MinioClient.fileExists(decodedPath);
    
    if (!fileExists) {
      return res.status(404).json({ message: 'File not found.' });
    }

    await MinioClient.deleteFile(decodedPath);

    logger.info(`File deleted: ${decodedPath}`);
    res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file.' });
  }
};

// Multer middleware exports
export const uploadSingle = upload.single('file');
export const uploadThumbnailMiddleware = upload.single('thumbnail');
export const uploadVideoMiddleware = upload.single('video');