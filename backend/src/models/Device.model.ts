import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';

export interface IDevice extends Document {
  user: IUser['_id'];
  deviceIdentifier: string; // e.g., fingerprintjs hash, or some unique device id
  lastLogin: Date;
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
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to ensure a user has unique devices
DeviceSchema.index({ user: 1, deviceIdentifier: 1 }, { unique: true });

const Device = mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
