/**
 * Authentication Middleware
 */

import { Injectable, NestMiddleware, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/user.service';
import { ErrorCode } from '../../pkg/errors/errors';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: any, res: Response, next: NextFunction) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Check if it's a session token or JWT
    if (token.startsWith('sess_')) {
      // Session token validation
      req.sessionToken = token;
      req.user = null; // Will be populated by controller
    } else if (token.startsWith('jwt_')) {
      // JWT token validation (to be implemented)
      // For now, treat as invalid
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    } else {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    next();
  }
}

/**
 * Apply auth middleware to specific routes
 */
export const applyAuthMiddleware = (app: any) => {
  app.use((req: any, res: Response, next: NextFunction) => {
    // Only apply to /api/v1 routes
    if (req.path.startsWith('/api/v1')) {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        if (token.startsWith('sess_')) {
          req.sessionToken = token;
        }
      }
    }

    next();
  });
};
