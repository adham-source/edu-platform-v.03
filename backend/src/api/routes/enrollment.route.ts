import { Router } from 'express';
import {
  enrollInCourse,
  getUserEnrollments,
  updateProgress,
  unenrollFromCourse,
  getCourseEnrollments
} from '../controllers/enrollment.controller';
import keycloak from '../../config/keycloak-config';

const router = Router();

// Student routes
router.post('/courses/:courseId', keycloak.protect(), enrollInCourse);
router.get('/my-enrollments', keycloak.protect(), getUserEnrollments);
router.put('/courses/:courseId/progress', keycloak.protect(), updateProgress);
router.delete('/courses/:courseId', keycloak.protect(), unenrollFromCourse);

// Instructor routes
router.get('/courses/:courseId/students', keycloak.protect(), getCourseEnrollments);

export default router;