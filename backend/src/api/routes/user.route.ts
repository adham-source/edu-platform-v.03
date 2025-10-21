import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { checkJwt } from "../../config/auth0-config";
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All routes in this file are protected and require admin privileges
router.use(checkJwt);
router.use(isAdmin);

// Define the routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
