import { Request, Response } from 'express';
import User from '../../models/User.model';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-__v'); // Exclude the __v field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Fields that an admin is allowed to update
    const { isDisabled, roles } = req.body;
    const updateData: { isDisabled?: boolean; roles?: string[] } = {};

    if (typeof isDisabled === 'boolean') {
      updateData.isDisabled = isDisabled;
    }

    if (Array.isArray(roles)) {
      updateData.roles = roles;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// Delete a user (from local DB)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Also need to delete associated devices
    // await Device.deleteMany({ user: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
