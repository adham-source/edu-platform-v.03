import { Router } from 'express';
import {
  addLessonToCourse,
  getLessonsForCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from '../controllers/lesson.controller';
import { checkJwt } from "../../config/auth0-config";
import { isTeacher } from '../middlewares/teacher.middleware';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// All routes in this file require authentication and teacher/admin role
router.use(checkJwt);
router.use(isTeacher);

// Define the routes
router.post('/', upload.single('video'), addLessonToCourse); // 'video' is the field name for the file
router.get('/course/:courseId', getLessonsForCourse);
router.get('/:id', getLessonById);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;
