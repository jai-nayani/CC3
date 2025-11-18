import { Request, Response, NextFunction } from 'express';
import { errorResponse, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '@financial-analytics/shared';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(400).json(errorResponse('VALIDATION_ERROR', err.message, err.details));
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json(errorResponse('AUTHENTICATION_ERROR', err.message));
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json(errorResponse('AUTHORIZATION_ERROR', err.message));
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json(errorResponse('NOT_FOUND', err.message));
  }

  return res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
};
