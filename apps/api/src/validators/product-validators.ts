import { Request, Response, NextFunction } from 'express';
import { CreateProductDto, UpdateProductDto } from '../models/product';

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate create product request
 */
export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<CreateProductDto>;

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

  // Validate description (optional)
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      validationErrors: errors,
    });
    return;
  }

  next();
};

/**
 * Validate update product request
 */
export const validateUpdateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<UpdateProductDto>;

  // At least one field must be provided
  if (!body.name && body.description === undefined) {
    errors.push({ 
      field: 'body', 
      message: 'At least one field (name or description) must be provided' 
    });
  }

  // Validate name if provided
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' });
    } else if (body.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (body.name.length > 255) {
      errors.push({ field: 'name', message: 'Name must not exceed 255 characters' });
    }
  }

  // Validate description if provided
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      validationErrors: errors,
    });
    return;
  }

  next();
};
