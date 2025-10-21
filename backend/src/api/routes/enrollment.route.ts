import { Router } from 'express';
import {
  enrollInCourse,
  getUserEnrollments,
  updateProgress,
  unenrollFromCourse,
  getCourseEnrollments
} from '../controllers/enrollment.controller';
import { checkJwt } from "../../config/auth0-config";

const router = Router();

// Student routes
router.post('/courses/:courseId', checkJwt, enrollInCourse);
router.get('/my-enrollments', checkJwt, getUserEnrollments);
router.put('/courses/:courseId/progress', checkJwt, updateProgress);
router.delete('/courses/:courseId', checkJwt, unenrollFromCourse);

// Instructor routes
router.get('/courses/:courseId/students', checkJwt, getCourseEnrollments);

export default router;