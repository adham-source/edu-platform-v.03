import { Request, Response } from 'express';
import User from '../../models/User.model';
import Device from '../../models/Device.model';
import logger from '../../config/logger';

const MAX_DEVICES = 2;

export const handleLogin = async (req: Request, res: Response) => {
  // User data is available from the Keycloak token after authentication
  const kauth = (req as any).kauth;
  if (!kauth || !kauth.grant) {
    return res.status(401).json({ message: 'Not authenticated by Keycloak.' });
  }

  const userInfo = kauth.grant.access_token.content;
  const { deviceIdentifier, deviceInfo } = req.body;

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
        roles: userInfo.realm_access?.roles || ['student'],
      });
      await user.save();
      logger.info(`New user created: ${user.username} (${user.email})`);
    }

    // Check if user account is disabled
    if (user.isDisabled) {
      logger.warn(`Disabled user attempted login: ${user.username}`);
      return res.status(403).json({ 
        message: 'Account is disabled due to security violation. Contact support.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Check device limit
    const devices = await Device.find({ user: user._id });
    const existingDevice = devices.find(d => d.deviceIdentifier === deviceIdentifier);

    if (existingDevice) {
      // Device is already registered, update last login
      existingDevice.lastLogin = new Date();
      if (deviceInfo) {
        existingDevice.deviceInfo = deviceInfo;
      }
      await existingDevice.save();
      
      logger.info(`User ${user.username} logged in from registered device`);
      return res.status(200).json({ 
        message: 'Login successful.',
        userId: user._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } else if (devices.length < MAX_DEVICES) {
      // User has less than max devices and this is a new device, so add it
      const newDevice = new Device({
        user: user._id,
        deviceIdentifier,
        deviceInfo: deviceInfo || {},
        lastLogin: new Date()
      });
      await newDevice.save();
      
      logger.info(`New device registered for user ${user.username}. Total devices: ${devices.length + 1}`);
      return res.status(200).json({ 
        message: 'Login successful, device registered.',
        userId: user._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } else {
      // User has reached the device limit and is trying to use a new device
      // Lock the account
      user.isDisabled = true;
      await user.save();
      
      logger.error(`Account locked for user ${user.username} - device limit exceeded`);
      return res.status(403).json({ 
        message: `Device limit (${MAX_DEVICES}) reached. Account has been locked for security reasons.`,
        code: 'DEVICE_LIMIT_EXCEEDED'
      });
    }

  } catch (error) {
    logger.error('Error during login handling:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getUserDevices = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    
    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const devices = await Device.find({ user: user._id }).select('-__v');
    
    res.status(200).json({
      devices: devices.map(device => ({
        id: device._id,
        deviceIdentifier: device.deviceIdentifier,
        deviceInfo: device.deviceInfo,
        lastLogin: device.lastLogin,
        isCurrentDevice: device.deviceIdentifier === req.body.currentDeviceId
      })),
      maxDevices: MAX_DEVICES
    });
  } catch (error) {
    logger.error('Error fetching user devices:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const removeDevice = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    const { deviceId } = req.params;
    
    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const device = await Device.findOneAndDelete({ 
      _id: deviceId, 
      user: user._id 
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found.' });
    }

    logger.info(`Device removed for user ${user.username}: ${device.deviceIdentifier}`);
    res.status(200).json({ message: 'Device removed successfully.' });
  } catch (error) {
    logger.error('Error removing device:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const kauth = (req as any).kauth;
    const userInfo = kauth.grant.access_token.content;
    
    const user = await User.findOne({ authProviderId: userInfo.sub });
    if (user) {
      logger.info(`User ${user.username} logged out`);
    }
    
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    logger.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
