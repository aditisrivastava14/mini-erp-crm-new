import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { httpStatus } from '../constants/httpStatus';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { User } from '@gigflow/shared';

// Zod Validation Middleware
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message, true, error.errors));
      } else {
        next(error);
      }
    }
  };
};

// Verify JWT Middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, env.jwt.secret) as { id: string };
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User no longer exists');
      }

      req.user = user.toJSON() as User;
      next();
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token is invalid or expired');
    }
  } catch (error) {
    next(error);
  }
};

// Role Authorization Middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action'));
    }
    next();
  };
};
