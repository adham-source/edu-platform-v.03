import { Router } from 'express';
import { handleLogin, getUserDevices, removeDevice, logout } from '../controllers/auth.controller';
import keycloak from '../../config/keycloak-config';

const router = Router();

// This route is called after the user has authenticated with Keycloak on the frontend.
// The frontend then sends the received JWT to this endpoint to finalize the login
// in our system and perform the device check.
router.post('/login', keycloak.protect(), handleLogin);

// Get user's registered devices
router.get('/devices', keycloak.protect(), getUserDevices);

// Remove a specific device
router.delete('/devices/:deviceId', keycloak.protect(), removeDevice);

// Logout endpoint
router.post('/logout', keycloak.protect(), logout);

export default router;
