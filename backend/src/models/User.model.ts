import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  auth0Id: string; // ID from Auth0
  name?: string;
  picture?: string;
  roles: string[];
  isDisabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  auth0Id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
  },
  roles: {
    type: [String],
    required: true,
    default: ['student'],
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
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

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
