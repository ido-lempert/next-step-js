import { Request, Response, NextFunction } from 'express';
import { CreateScriptStepDto, UpdateScriptStepDto } from '../models/script-step';

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate create script step request
 */
export const validateCreateScriptStep = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<CreateScriptStepDto>;

  // Validate title
  if (!body.title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (typeof body.title !== 'string') {
    errors.push({ field: 'title', message: 'Title must be a string' });
  } else if (body.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (body.title.length > 255) {
    errors.push({ field: 'title', message: 'Title must not exceed 255 characters' });
  }

  // Validate description
  if (!body.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (typeof body.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  } else if (body.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description cannot be empty' });
  }

  // Validate elementSelector (optional)
  if (body.elementSelector !== undefined && body.elementSelector !== null) {
    if (typeof body.elementSelector !== 'string') {
      errors.push({ field: 'elementSelector', message: 'Element selector must be a string' });
    } else if (body.elementSelector.length > 500) {
      errors.push({ field: 'elementSelector', message: 'Element selector must not exceed 500 characters' });
    }
  }

  // Validate actionType (optional)
  if (body.actionType !== undefined && body.actionType !== null) {
    if (typeof body.actionType !== 'string') {
      errors.push({ field: 'actionType', message: 'Action type must be a string' });
    } else if (body.actionType.length > 50) {
      errors.push({ field: 'actionType', message: 'Action type must not exceed 50 characters' });
    }
  }

  // Validate config (optional)
  if (body.config !== undefined && body.config !== null) {
    if (typeof body.config !== 'object' || Array.isArray(body.config)) {
      errors.push({ field: 'config', message: 'Config must be an object' });
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

/**
 * Validate update script step request
 */
export const validateUpdateScriptStep = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as Partial<UpdateScriptStepDto>;

  // Validate title (if provided)
  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else if (body.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (body.title.length > 255) {
      errors.push({ field: 'title', message: 'Title must not exceed 255 characters' });
    }
  }

  // Validate description (if provided)
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (body.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    }
  }

  // Validate elementSelector (if provided)
  if (body.elementSelector !== undefined && body.elementSelector !== null) {
    if (typeof body.elementSelector !== 'string') {
      errors.push({ field: 'elementSelector', message: 'Element selector must be a string' });
    } else if (body.elementSelector.length > 500) {
      errors.push({ field: 'elementSelector', message: 'Element selector must not exceed 500 characters' });
    }
  }

  // Validate actionType (if provided)
  if (body.actionType !== undefined && body.actionType !== null) {
    if (typeof body.actionType !== 'string') {
      errors.push({ field: 'actionType', message: 'Action type must be a string' });
    } else if (body.actionType.length > 50) {
      errors.push({ field: 'actionType', message: 'Action type must not exceed 50 characters' });
    }
  }

  // Validate config (if provided)
  if (body.config !== undefined && body.config !== null) {
    if (typeof body.config !== 'object' || Array.isArray(body.config)) {
      errors.push({ field: 'config', message: 'Config must be an object' });
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

/**
 * Validate reorder steps request
 */
export const validateReorderSteps = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const body = req.body as { stepIds?: unknown };

  // Validate stepIds
  if (!body.stepIds) {
    errors.push({ field: 'stepIds', message: 'Step IDs are required' });
  } else if (!Array.isArray(body.stepIds)) {
    errors.push({ field: 'stepIds', message: 'Step IDs must be an array' });
  } else if (body.stepIds.length === 0) {
    errors.push({ field: 'stepIds', message: 'Step IDs array cannot be empty' });
  } else if (!body.stepIds.every(id => typeof id === 'string')) {
    errors.push({ field: 'stepIds', message: 'All step IDs must be strings' });
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
