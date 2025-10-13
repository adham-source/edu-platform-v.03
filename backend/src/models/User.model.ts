import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  authProviderId: string; // ID from Keycloak
  roles: string[];
  isDisabled: boolean;
  createdAt: Date;
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
  authProviderId: {
    type: String,
    required: true,
    unique: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
