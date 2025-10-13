import { Request, Response } from 'express';
import User from '../../models/User.model';
import Device from '../../models/Device.model';

const MAX_DEVICES = 2;

export const handleLogin = async (req: Request, res: Response) => {
  // User data is available from the Keycloak token after authentication
  const kauth = (req as any).kauth;
  if (!kauth || !kauth.grant) {
    return res.status(401).json({ message: 'Not authenticated by Keycloak.' });
  }

  const userInfo = kauth.grant.access_token.content;
  const { deviceIdentifier } = req.body;

  if (!deviceIdentifier) {
    return res.status(400).json({ message: 'Device identifier is required.' });
  }

  try {
    // Find or create the user in our local database
    let user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      user = new User({
        username: userInfo.preferred_username,
        email: userInfo.email,
        authProviderId: userInfo.sub,
        roles: userInfo.realm_access.roles,
      });
      await user.save();
    }

    // Check if user account is disabled
    if (user.isDisabled) {
      return res.status(403).json({ message: 'Account is disabled.' });
    }

    // Check device limit
    const devices = await Device.find({ user: user._id });
    const isDeviceRegistered = devices.some(d => d.deviceIdentifier === deviceIdentifier);

    if (devices.length < MAX_DEVICES && !isDeviceRegistered) {
      // User has less than max devices and this is a new device, so add it
      const newDevice = new Device({
        user: user._id,
        deviceIdentifier,
      });
      await newDevice.save();
      return res.status(200).json({ message: 'Login successful, device registered.', userId: user._id });
    } else if (isDeviceRegistered) {
      // Device is already registered, so login is successful
      // Optionally update lastLogin timestamp
      await Device.updateOne({ user: user._id, deviceIdentifier }, { lastLogin: new Date() });
      return res.status(200).json({ message: 'Login successful.', userId: user._id });
    } else {
      // User has reached the device limit and is trying to use a new device
      // Lock the account
      user.isDisabled = true;
      await user.save();
      return res.status(403).json({ message: `Device limit (${MAX_DEVICES}) reached. Account has been locked.` });
    }

  } catch (error) {
    console.error('Error during login handling:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
