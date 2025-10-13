import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: IUser['_id'];
  price: number;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
