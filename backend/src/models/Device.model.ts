import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';

export interface IDeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export interface IDevice extends Document {
  user: IUser['_id'];
  deviceIdentifier: string; // e.g., fingerprintjs hash, or some unique device id
  deviceInfo?: IDeviceInfo;
  lastLogin: Date;
  createdAt: Date;
  isActive: boolean;
}

const DeviceSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceIdentifier: {
    type: String,
    required: true,
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
    userAgent: String,
    screenResolution: String,
    timezone: String,
    language: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Create a compound index to ensure a user has unique devices
DeviceSchema.index({ user: 1, deviceIdentifier: 1 }, { unique: true });

// Index for cleanup queries
DeviceSchema.index({ lastLogin: 1 });
DeviceSchema.index({ user: 1, isActive: 1 });

const Device = mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
