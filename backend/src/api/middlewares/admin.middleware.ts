import { Request, Response, NextFunction } from 'express';

/**
 * This middleware checks if the authenticated user has the 'admin' role.
 * It should be used after keycloak.protect().
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const kauth = (req as any).kauth;

  if (!kauth || !kauth.grant) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = kauth.grant.access_token;
  const hasAdminRole = token.hasRealmRole('admin');

  if (hasAdminRole) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Administrator access required.' });
  }
};
