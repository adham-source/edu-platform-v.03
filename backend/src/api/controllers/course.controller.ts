import { Request, Response } from 'express';
import Course from '../../models/Course.model';
import { IUser } from '../../models/User.model';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      price, 
      tags, 
      level, 
      language, 
      category,
      thumbnail 
    } = req.body;
    const auth = (req as any).auth;
    const instructorId = auth.sub; // Get user ID from Auth0 token

    const newCourse = new Course({
      title,
      description,
      instructor: instructorId,
      price,
      tags: tags || [],
      level: level || 'beginner',
      language: language || 'Arabic',
      category: category || 'General',
      thumbnail,
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
    const { 
      instructorId, 
      category, 
      level, 
      language, 
      tags, 
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query: any = { isPublished: true }; // Only show published courses by default

    if (instructorId) {
      query.instructor = instructorId;
      delete query.isPublished; // Allow instructors to see their unpublished courses
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (language) {
      query.language = language;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const courses = await Course.find(query)
      .populate('instructor', 'username email')
      .select('-__v')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCourses: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
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
    const { 
      title, 
      description, 
      price, 
      tags, 
      isPublished, 
      level, 
      language, 
      category,
      thumbnail 
    } = req.body;
    const auth = (req as any).auth;
    const instructorId = auth.sub; // Get user ID from Auth0 token

    const updateData: any = {
      title,
      description,
      price,
      tags,
      isPublished,
      level,
      language,
      category,
      thumbnail,
      updatedAt: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: instructorId }, // Ensure only the instructor can update their course
      updateData,
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
    const auth = (req as any).auth;
    const instructorId = auth.sub; // Get user ID from Auth0 token

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
