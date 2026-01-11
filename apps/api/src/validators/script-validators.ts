import { Request, Response, NextFunction } from 'express';
import { CreateScriptDto, UpdateScriptDto } from '../models/script';

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate create script request
 */
export const validateCreateScript = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<CreateScriptDto>;

  // Validate name
  if (!body.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (typeof body.name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string' });
  } else if (body.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  } else if (body.name.length > 255) {
    errors.push({ field: 'name', message: 'Name must not exceed 255 characters' });
  }

  // Validate type
  if (!body.type) {
    errors.push({ field: 'type', message: 'Type is required' });
  } else if (!['walkthrough', 'modal'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Type must be either "walkthrough" or "modal"' });
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Invalid request data',
      errors 
    });
    return;
  }

  next();
};

/**
 * Validate update script request
 */
export const validateUpdateScript = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<UpdateScriptDto>;

  // Validate name (if provided)
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' });
    } else if (body.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (body.name.length > 255) {
      errors.push({ field: 'name', message: 'Name must not exceed 255 characters' });
    }
  }

  // Validate type (if provided)
  if (body.type !== undefined) {
    if (!['walkthrough', 'modal'].includes(body.type)) {
      errors.push({ field: 'type', message: 'Type must be either "walkthrough" or "modal"' });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Invalid request data',
      errors 
    });
    return;
  }

  next();
};
