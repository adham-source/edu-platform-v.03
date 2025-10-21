import { Router } from 'express';
import {
  rateCourse,
  getCourseRatings,
  getUserRating,
  deleteRating
} from '../controllers/rating.controller';
import { checkJwt } from "../../config/auth0-config";

const router = Router();

// Rate a course (create or update)
router.post('/courses/:courseId', checkJwt, rateCourse);

// Get all ratings for a course
router.get('/courses/:courseId', getCourseRatings);

// Get user's rating for a specific course
router.get('/courses/:courseId/my-rating', checkJwt, getUserRating);

// Delete user's rating for a course
router.delete('/courses/:courseId', checkJwt, deleteRating);

export default router;