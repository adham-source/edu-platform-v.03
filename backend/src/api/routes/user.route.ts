import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import keycloak from '../../config/keycloak-config';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All routes in this file are protected and require admin privileges
router.use(keycloak.protect());
router.use(isAdmin);

// Define the routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
