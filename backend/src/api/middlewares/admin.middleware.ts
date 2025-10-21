import { Request, Response, NextFunction } from 'express';
import { hasRole } from '../../config/auth0-config';

/**
 * This middleware checks if the authenticated user has the 'admin' role.
 * It should be used after Auth0 JWT authentication.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;

  if (!auth) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (hasRole(req, 'admin')) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Administrator access required.' });
  }
};
