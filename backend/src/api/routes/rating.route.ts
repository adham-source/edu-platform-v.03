import { Router } from 'express';
import {
  rateCourse,
  getCourseRatings,
  getUserRating,
  deleteRating
} from '../controllers/rating.controller';
import keycloak from '../../config/keycloak-config';

const router = Router();

// Rate a course (create or update)
router.post('/courses/:courseId', keycloak.protect(), rateCourse);

// Get all ratings for a course
router.get('/courses/:courseId', getCourseRatings);

// Get user's rating for a specific course
router.get('/courses/:courseId/my-rating', keycloak.protect(), getUserRating);

// Delete user's rating for a course
router.delete('/courses/:courseId', keycloak.protect(), deleteRating);

export default router;