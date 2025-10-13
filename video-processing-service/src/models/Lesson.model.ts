import mongoose, { Document, Schema } from 'mongoose';

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
}

export interface ILesson extends Document {
  title: string;
  course: mongoose.Types.ObjectId; // Simplified
  order: number;
  contentType: ContentType;
  videoUrl?: string; // Path to the processed video manifest
  textContent?: string;
  isFree: boolean;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'; // New status field
  createdAt: Date;
}

const LessonSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    enum: Object.values(ContentType),
    required: true,
  },
  videoUrl: {
    type: String,
  },
  textContent: {
    type: String,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
