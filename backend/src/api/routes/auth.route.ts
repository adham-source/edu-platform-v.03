import { Router } from 'express';
import { handleLogin, getUserDevices, removeDevice, logout } from '../controllers/auth.controller';
import { checkJwt } from '../../config/auth0-config';

const router = Router();

// This route is called after the user has authenticated with Auth0 on the frontend.
// The frontend then sends the received JWT to this endpoint to finalize the login
// in our system and perform the device check.
router.post('/login', checkJwt, handleLogin);

// Get user's registered devices
router.get('/devices', checkJwt, getUserDevices);

// Remove a specific device
router.delete('/devices/:deviceId', checkJwt, removeDevice);

// Logout endpoint
router.post('/logout', checkJwt, logout);

export default router;
