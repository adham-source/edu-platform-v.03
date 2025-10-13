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
  updatedAt: Date;
  thumbnail?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in minutes
  language: string;
  category: string;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
}

const CourseSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
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
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  thumbnail: {
    type: String,
    default: null,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  duration: {
    type: Number,
    min: 0,
  },
  language: {
    type: String,
    default: 'Arabic',
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ enrollmentCount: -1 });
CourseSchema.index({ createdAt: -1 });

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
