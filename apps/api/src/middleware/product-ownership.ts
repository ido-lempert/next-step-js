import { Response, NextFunction } from 'express';
import { RequestWithTenant } from './tenant';
import { productStore } from '../models/product-store';
import { projectStore } from '../models/project-store';

export interface RequestWithProduct extends RequestWithTenant {
  product?: {
    id: string;
    project_id: string;
  };
}

export function productOwnershipMiddleware(
  req: RequestWithProduct,
  res: Response,
  next: NextFunction
): void {
  const productId = req.params.productId;
  const tenantId = req.tenantId!;

  const product = productStore.findById(productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  // Verify project ownership (tenant isolation)
  const project = projectStore.findById(product.project_id, tenantId);
  if (!project) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  req.product = {
    id: product.id,
    project_id: product.project_id,
  };

  next();
}
