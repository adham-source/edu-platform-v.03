import { Request, Response } from 'express';
import Lesson from '../../models/Lesson.model';
import Course from '../../models/Course.model';
import { MinioClient } from '../../utils/minio-client';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_BUCKET = 'uploads';

// Add a new lesson to a course (handles video upload)
export const addLessonToCourse = async (req: Request, res: Response) => {
  try {
    const { courseId, title, order, contentType, textContent, isFree } = req.body;
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub;

    // Ensure the course exists and belongs to the instructor
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you are not the instructor.' });
    }

    let videoUrl: string | undefined;
    if (contentType === 'video') {
      if (!req.file) {
        return res.status(400).json({ message: 'Video file is required for video content type.' });
      }

      const minioClient = MinioClient.getInstance();
      const fileExtension = req.file.originalname.split('.').pop();
      const objectName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${UPLOAD_BUCKET}/${objectName}`;

      // Ensure the upload bucket exists
      const bucketExists = await minioClient.bucketExists(UPLOAD_BUCKET);
      if (!bucketExists) {
        await minioClient.makeBucket(UPLOAD_BUCKET);
      }

      // Upload the file to MinIO
      await minioClient.putObject(UPLOAD_BUCKET, objectName, req.file.buffer, req.file.size, {
        'Content-Type': req.file.mimetype,
      });
      videoUrl = filePath; // Store the path in MinIO

      console.log(`Video uploaded successfully: ${filePath}`);
    }

    const newLesson = new Lesson({
      course: courseId,
      title,
      order: parseInt(order, 10),
      contentType,
      textContent: contentType === 'text' ? textContent : undefined,
      videoUrl: contentType === 'video' ? videoUrl : undefined,
      isFree,
    });

    const lesson = await newLesson.save();

    if (contentType === 'video') {
      console.log(`Lesson ${lesson._id} created with video: ${videoUrl}`);
    }

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ message: 'Error adding lesson', error });
  }
};

// Get all lessons for a specific course
export const getLessonsForCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).select('-__v');
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lessons', error });
  }
};

// Get a single lesson by ID
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id).select('-__v');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error });
  }
};

// Update a lesson
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { title, order, contentType, textContent, isFree } = req.body;
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub;

    // Ensure the lesson exists and belongs to a course taught by this instructor
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const course = await Course.findOne({ _id: lesson.course, instructor: instructorId });
    if (!course) {
      return res.status(403).json({ message: 'Forbidden: You are not the instructor of this course.' });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, order, contentType, textContent, isFree },
      { new: true }
    ).select('-__v');

    res.status(200).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson', error });
  }
};

// Delete a lesson
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const instructorId = kauth.grant.access_token.content.sub;

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const course = await Course.findOne({ _id: lesson.course, instructor: instructorId });
    if (!course) {
      return res.status(403).json({ message: 'Forbidden: You are not the instructor of this course.' });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // TODO: If it was a video lesson, delete the video files from MinIO (original and processed)

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lesson', error });
  }
};
