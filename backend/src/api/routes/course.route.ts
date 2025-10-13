import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller';
import keycloak from '../../config/keycloak-config';
import { isTeacher } from '../middlewares/teacher.middleware';

const router = Router();

// Routes for course management
// All these routes require authentication and teacher/admin role
router.use(keycloak.protect());
router.use(isTeacher);

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
