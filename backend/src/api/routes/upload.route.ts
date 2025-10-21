import { Router } from 'express';
import {
  uploadThumbnail,
  uploadVideo,
  getFileUrl,
  deleteFile,
  uploadThumbnailMiddleware,
  uploadVideoMiddleware
} from '../controllers/upload.controller';
import { checkJwt } from "../../config/auth0-config";

const router = Router();

// Upload course thumbnail
router.post('/thumbnail', checkJwt, uploadThumbnailMiddleware, uploadThumbnail);

// Upload lesson video
router.post('/video', checkJwt, uploadVideoMiddleware, uploadVideo);

// Get file URL (public access for viewing)
router.get('/file/:filePath(*)', getFileUrl);

// Delete file (protected)
router.delete('/file/:filePath(*)', checkJwt, deleteFile);

export default router;