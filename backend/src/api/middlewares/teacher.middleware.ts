import { Request, Response, NextFunction } from 'express';

/**
 * This middleware checks if the authenticated user has the 'teacher' role.
 * It should be used after keycloak.protect().
 */
export const isTeacher = (req: Request, res: Response, next: NextFunction) => {
  const kauth = (req as any).kauth;

  if (!kauth || !kauth.grant) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = kauth.grant.access_token;
  // A user can be both a teacher and an admin, so we check for either.
  const hasTeacherRole = token.hasRealmRole('teacher') || token.hasRealmRole('admin');

  if (hasTeacherRole) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Teacher access required.' });
  }
};
