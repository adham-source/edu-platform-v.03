import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';
import { ICourse } from './Course.model';

export interface IRating extends Document {
  user: IUser['_id'];
  course: ICourse['_id'];
  rating: number; // 1-5 stars
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    maxlength: 1000,
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

// Ensure a user can only rate a course once
RatingSchema.index({ user: 1, course: 1 }, { unique: true });

// Update the updatedAt field before saving
RatingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Rating = mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;