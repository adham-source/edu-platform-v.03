import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';
import { ICourse } from './Course.model';

export interface IEnrollment extends Document {
  user: IUser['_id'];
  course: ICourse['_id'];
  enrollmentDate: Date;
  progress: number; // Percentage, e.g., 75.5
}

const EnrollmentSchema: Schema = new Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
});

// Ensure a user can only enroll in a course once
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
