import { Router } from 'express';
import { handleLogin } from '../controllers/auth.controller';
import keycloak from '../../config/keycloak-config';

const router = Router();

// This route is called after the user has authenticated with Keycloak on the frontend.
// The frontend then sends the received JWT to this endpoint to finalize the login
// in our system and perform the device check.
router.post('/login', keycloak.protect(), handleLogin);

export default router;
