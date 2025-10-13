import { Router } from 'express';
import {
  uploadThumbnail,
  uploadVideo,
  getFileUrl,
  deleteFile,
  uploadThumbnailMiddleware,
  uploadVideoMiddleware
} from '../controllers/upload.controller';
import keycloak from '../../config/keycloak-config';

const router = Router();

// Upload course thumbnail
router.post('/thumbnail', keycloak.protect(), uploadThumbnailMiddleware, uploadThumbnail);

// Upload lesson video
router.post('/video', keycloak.protect(), uploadVideoMiddleware, uploadVideo);

// Get file URL (public access for viewing)
router.get('/file/:filePath(*)', getFileUrl);

// Delete file (protected)
router.delete('/file/:filePath(*)', keycloak.protect(), deleteFile);

export default router;