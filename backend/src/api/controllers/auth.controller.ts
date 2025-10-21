import { Request, Response } from 'express';
import User from '../../models/User.model';
import Device from '../../models/Device.model';
import logger from '../../config/logger';
import { getUserRoles } from '../../config/auth0-config';

const MAX_DEVICES = 2;

export const handleLogin = async (req: Request, res: Response) => {
  // User data is available from the Auth0 JWT token after authentication
  const auth = (req as any).auth;
  if (!auth) {
    return res.status(401).json({ message: 'Not authenticated by Auth0.' });
  }

  const { deviceIdentifier, deviceInfo, auth0UserData } = req.body;

  if (!deviceIdentifier) {
    return res.status(400).json({ message: 'Device identifier is required.' });
  }

  if (!auth0UserData || !auth0UserData.auth0Id) {
    return res.status(400).json({ message: 'Auth0 user data is required.' });
  }

  try {
    // Find or create the user in our local database
    let user = await User.findOne({ auth0Id: auth0UserData.auth0Id });
    if (!user) {
      // Extract username from email if not provided
      const username = auth0UserData.name || 
                      auth0UserData.email?.split('@')[0] || 
                      `user_${Date.now()}`;
      
      user = new User({
        username,
        email: auth0UserData.email,
        auth0Id: auth0UserData.auth0Id,
        name: auth0UserData.name,
        picture: auth0UserData.picture,
        roles: getUserRoles(req) || ['student'],
      });
      await user.save();
      logger.info(`New user created: ${user.username} (${user.email})`);
    } else {
      // Update user info from Auth0
      user.name = auth0UserData.name || user.name;
      user.picture = auth0UserData.picture || user.picture;
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      await user.save();
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
          name: user.name,
          picture: user.picture,
          roles: user.roles,
          auth0Id: user.auth0Id
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
          name: user.name,
          picture: user.picture,
          roles: user.roles,
          auth0Id: user.auth0Id
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
    const auth = (req as any).auth;
    if (!auth) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    
    const user = await User.findOne({ auth0Id: auth.sub });
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
    const auth = (req as any).auth;
    if (!auth) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    
    const { deviceId } = req.params;
    
    const user = await User.findOne({ auth0Id: auth.sub });
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
    const auth = (req as any).auth;
    if (auth) {
      const user = await User.findOne({ auth0Id: auth.sub });
      if (user) {
        logger.info(`User ${user.username} logged out`);
      }
    }
    
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    logger.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
