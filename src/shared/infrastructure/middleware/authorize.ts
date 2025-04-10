import { Request, Response, NextFunction } from 'express';
import logger from '@shared/infrastructure/logging/logger';
import { RequestWithUser } from '@shared/types';

/**
 * Middleware to check if a user has the required permissions
 * @param allowedRolesOrPermissions - Array of roles or permissions that are allowed to access the route
 * @returns Express middleware function
 */
export const authorize = (allowedRolesOrPermissions: string | string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userReq = req as RequestWithUser;

    if (!userReq.user) {
      logger.warn('No user found in request');
      res.status(403).json({
        status: 'fail',
        message: 'Forbidden: User not found',
      });
      return;
    }

    logger.info('Authorization check:', {
      userRole: userReq.user.role,
      userPermissions: userReq.user.permissions,
      allowedRolesOrPermissions,
    });

    // Make role comparison case-insensitive
    const userRole = userReq.user.role.toLowerCase();

    // Check if user is admin (case-insensitive)
    if (userRole === 'admin') {
      logger.info('Access granted - Admin role');
      next();
      return;
    }

    const hasAllPermission =
      Array.isArray(userReq.user.permissions) && userReq.user.permissions.includes('all');

    if (hasAllPermission) {
      logger.info('Access granted - All permissions');
      next();
      return;
    }

    const allowed = Array.isArray(allowedRolesOrPermissions)
      ? allowedRolesOrPermissions.map((role) => role.toLowerCase())
      : [allowedRolesOrPermissions.toLowerCase()];

    // Check if user role is in allowed roles (case-insensitive)
    if (allowed.includes(userRole)) {
      logger.info('Access granted - Role match');
      next();
      return;
    }

    // Check permissions
    const hasSpecificPermission =
      Array.isArray(userReq.user.permissions) &&
      userReq.user.permissions.some((permission: string) =>
        allowed.includes(permission.toLowerCase())
      );

    if (!hasSpecificPermission) {
      logger.warn('Access denied:', {
        userRole: userReq.user.role,
        userPermissions: userReq.user.permissions,
        requiredPermissions: allowed,
      });

      res.status(403).json({
        status: 'fail',
        message: 'Forbidden: Insufficient permissions',
      });
      return;
    }

    logger.info('Access granted - Required permissions found');
    next();
  };
};
