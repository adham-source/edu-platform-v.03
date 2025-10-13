import { Request, Response } from 'express';
import Rating from '../../models/Rating.model';
import Course from '../../models/Course.model';
import User from '../../models/User.model';
import Enrollment from '../../models/Enrollment.model';
import logger from '../../config/logger';

// Add or update a rating for a course
export const rateCourse = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    const { courseId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Find user in our database
    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ 
      user: user._id, 
      course: courseId 
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in the course to rate it.' });
    }

    // Check if user already rated this course
    let existingRating = await Rating.findOne({ 
      user: user._id, 
      course: courseId 
    });

    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();

      // Update course rating statistics
      await updateCourseRating(courseId, rating, oldRating, false);

      logger.info(`User ${user.username} updated rating for course ${course.title}`);
      res.status(200).json({ 
        message: 'Rating updated successfully.',
        rating: existingRating
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        user: user._id,
        course: courseId,
        rating,
        review,
      });

      await newRating.save();

      // Update course rating statistics
      await updateCourseRating(courseId, rating, 0, true);

      logger.info(`User ${user.username} rated course ${course.title}: ${rating} stars`);
      res.status(201).json({ 
        message: 'Rating added successfully.',
        rating: newRating
      });
    }
  } catch (error) {
    logger.error('Error rating course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get ratings for a course
export const getCourseRatings = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const ratings = await Rating.find({ course: courseId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Rating.countDocuments({ course: courseId });

    res.status(200).json({
      ratings: ratings.map(rating => ({
        id: rating._id,
        user: rating.user,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRatings: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching course ratings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get user's rating for a specific course
export const getUserRating = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    const { courseId } = req.params;

    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const rating = await Rating.findOne({ 
      user: user._id, 
      course: courseId 
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    res.status(200).json({
      rating: {
        id: rating._id,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a rating
export const deleteRating = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    const { courseId } = req.params;

    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const rating = await Rating.findOneAndDelete({ 
      user: user._id, 
      course: courseId 
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    // Update course rating statistics
    await updateCourseRating(courseId, 0, rating.rating, false, true);

    logger.info(`User ${user.username} deleted rating for course ${courseId}`);
    res.status(200).json({ message: 'Rating deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Helper function to update course rating statistics
async function updateCourseRating(
  courseId: string, 
  newRating: number, 
  oldRating: number, 
  isNewRating: boolean, 
  isDeleting: boolean = false
) {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    if (isDeleting) {
      // Removing a rating
      if (course.ratingCount > 0) {
        const totalRating = course.rating * course.ratingCount - oldRating;
        course.ratingCount -= 1;
        course.rating = course.ratingCount > 0 ? totalRating / course.ratingCount : 0;
      }
    } else if (isNewRating) {
      // Adding a new rating
      const totalRating = course.rating * course.ratingCount + newRating;
      course.ratingCount += 1;
      course.rating = totalRating / course.ratingCount;
    } else {
      // Updating existing rating
      const totalRating = course.rating * course.ratingCount - oldRating + newRating;
      course.rating = totalRating / course.ratingCount;
    }

    // Round to 1 decimal place
    course.rating = Math.round(course.rating * 10) / 10;

    await course.save();
  } catch (error) {
    logger.error('Error updating course rating:', error);
  }
}