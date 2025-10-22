import { Request, Response } from 'express';
import Enrollment from '../../models/Enrollment.model';
import Course from '../../models/Course.model';
import User from '../../models/User.model';
import logger from '../../config/logger';

// Enroll in a course
export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userInfo = auth;
    const { courseId } = req.params;

    // Find user in our database
    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not available for enrollment.' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ 
      user: user._id, 
      course: courseId 
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course.' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: user._id,
      course: courseId,
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { 
      $inc: { enrollmentCount: 1 } 
    });

    logger.info(`User ${user.username} enrolled in course ${course.title}`);
    res.status(201).json({ 
      message: 'Successfully enrolled in course.',
      enrollment: {
        id: enrollment._id,
        courseId: course._id,
        courseTitle: course.title,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress
      }
    });
  } catch (error) {
    logger.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get user's enrollments
export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userInfo = auth;

    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const enrollments = await Enrollment.find({ user: user._id })
      .populate('course', 'title description instructor price tags isPublished')
      .sort({ enrollmentDate: -1 });

    res.status(200).json({
      enrollments: enrollments.map(enrollment => ({
        id: enrollment._id,
        course: enrollment.course,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress
      }))
    });
  } catch (error) {
    logger.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update enrollment progress
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userInfo = auth;
    const { courseId } = req.params;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100.' });
    }

    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: user._id, course: courseId },
      { progress },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    res.status(200).json({ 
      message: 'Progress updated successfully.',
      progress: enrollment.progress
    });
  } catch (error) {
    logger.error('Error updating progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userInfo = auth;
    const { courseId } = req.params;

    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const enrollment = await Enrollment.findOneAndDelete({ 
      user: user._id, 
      course: courseId 
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { 
      $inc: { enrollmentCount: -1 } 
    });

    logger.info(`User ${user.username} unenrolled from course ${courseId}`);
    res.status(200).json({ message: 'Successfully unenrolled from course.' });
  } catch (error) {
    logger.error('Error unenrolling from course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get course enrollments (for instructors)
export const getCourseEnrollments = async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userInfo = auth;
    const { courseId } = req.params;

    // Verify that the user is the instructor of this course
    const course = await Course.findOne({ 
      _id: courseId, 
      instructor: userInfo.sub 
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('user', 'username email')
      .sort({ enrollmentDate: -1 });

    res.status(200).json({
      course: {
        id: course._id,
        title: course.title
      },
      enrollments: enrollments.map(enrollment => ({
        id: enrollment._id,
        user: enrollment.user,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress
      })),
      totalEnrollments: enrollments.length
    });
  } catch (error) {
    logger.error('Error fetching course enrollments:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};