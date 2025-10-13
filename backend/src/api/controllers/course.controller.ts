import { Request, Response } from 'express';
import Course from '../../models/Course.model';
import { IUser } from '../../models/User.model';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price, tags } = req.body;
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub; // Get user ID from Keycloak token

    const newCourse = new Course({
      title,
      description,
      instructor: instructorId,
      price,
      tags,
    });

    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error });
  }
};

// Get all courses (can be filtered by instructor)
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.query;
    let query: any = {};

    if (instructorId) {
      query.instructor = instructorId;
    }

    const courses = await Course.find(query).populate('instructor', 'username email').select('-__v');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
};

// Get a single course by ID
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'username email').select('-__v');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error });
  }
};

// Update a course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price, tags, isPublished } = req.body;
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub; // Get user ID from Keycloak token

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: instructorId }, // Ensure only the instructor can update their course
      { title, description, price, tags, isPublished },
      { new: true }
    ).select('-__v');

    if (!course) {
      return res.status(404).json({ message: 'Course not found or you are not the instructor' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error });
  }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub; // Get user ID from Keycloak token

    const course = await Course.findOneAndDelete({ _id: req.params.id, instructor: instructorId });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or you are not the instructor' });
    }

    // TODO: Also delete all associated lessons and their video files from MinIO

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error });
  }
};
