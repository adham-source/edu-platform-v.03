import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './Course.model';

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
}

export interface ILesson extends Document {
  title: string;
  course: ICourse['_id'];
  order: number;
  contentType: ContentType;
  videoUrl?: string; // From MinIO
  textContent?: string;
  isFree: boolean;
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
    required: function (this: ILesson) {
      return this.contentType === ContentType.VIDEO;
    },
  },
  textContent: {
    type: String,
    required: function (this: ILesson) {
      return this.contentType === ContentType.TEXT;
    },
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
