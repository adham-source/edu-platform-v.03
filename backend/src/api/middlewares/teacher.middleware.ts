import { Request, Response, NextFunction } from 'express';
import { hasRole } from '../../config/auth0-config';

/**
 * This middleware checks if the authenticated user has the 'teacher' role.
 * It should be used after Auth0 JWT authentication.
 */
export const isTeacher = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;

  if (!auth) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // A user can be both a teacher and an admin, so we check for either.
  const hasTeacherRole = hasRole(req, 'teacher') || hasRole(req, 'admin');

  if (hasTeacherRole) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Teacher access required.' });
  }
};
