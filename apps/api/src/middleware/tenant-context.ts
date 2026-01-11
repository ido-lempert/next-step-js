import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/**
 * Tenant context middleware
 * Extracts tenant ID from request headers for MVP
 * In production, this would extract from JWT token
 */
export const tenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // For MVP: Accept tenant ID from header
  // In production: Extract from verified JWT token
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Missing tenant context' 
    });
    return;
  }

  // Inject tenant ID into request context
  req.tenantId = tenantId;
  next();
};
