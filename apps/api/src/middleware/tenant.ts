import { Request, Response, NextFunction } from 'express';

export interface RequestWithTenant extends Request {
  tenantId?: string;
}

export function tenantMiddleware(
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): void {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    res.status(400).json({ error: 'Tenant ID is required' });
    return;
  }

  req.tenantId = tenantId;
  next();
}
