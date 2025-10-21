import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller';
import { checkJwt } from '../../config/auth0-config';
import { isTeacher } from '../middlewares/teacher.middleware';

const router = Router();

// Routes for course management
// Public routes (no authentication required)
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes (require authentication and teacher/admin role)
router.post('/', checkJwt, isTeacher, createCourse);
router.put('/:id', checkJwt, isTeacher, updateCourse);
router.delete('/:id', checkJwt, isTeacher, deleteCourse);

export default router;
