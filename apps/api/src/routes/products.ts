import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { productStore } from '../models/product-store';
import { projectStore } from '../models/project-store';
import { CreateProductDto, UpdateProductDto } from '../types/product';
import { RequestWithTenant } from '../middleware/tenant';
import { RequestWithProject, projectOwnershipMiddleware } from '../middleware/project-ownership';

export const productRouter = Router();

// Validation helper
function validateProductName(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  if (name.trim().length === 0) {
    return 'Name cannot be empty';
  }
  if (name.length > 255) {
    return 'Name must not exceed 255 characters';
  }
  return null;
}

// GET /api/projects/:projectId/products - List all products for a project
productRouter.get(
  '/projects/:projectId/products',
  projectOwnershipMiddleware,
  (req: RequestWithProject, res: Response) => {
    try {
      const projectId = req.params.projectId;
      const products = productStore.findByProjectId(projectId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/projects/:projectId/products - Create a new product
productRouter.post(
  '/projects/:projectId/products',
  projectOwnershipMiddleware,
  (req: RequestWithProject, res: Response) => {
    try {
      const projectId = req.params.projectId;
      const dto: CreateProductDto = req.body;

      // Validate name
      const nameError = validateProductName(dto.name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }

      // Create product
      const product = productStore.create({
        id: uuidv4(),
        project_id: projectId,
        name: dto.name.trim(),
        description: dto.description?.trim() || undefined,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/products/:id - Update a product
productRouter.put('/products/:id', (req: RequestWithTenant, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;
    const dto: UpdateProductDto = req.body;

    // Get product and verify it exists
    const product = productStore.findById(id);
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

    // Validate name if provided
    if (dto.name !== undefined) {
      const nameError = validateProductName(dto.name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }
    }

    // Prepare updates
    const updates: Partial<UpdateProductDto> = {};
    if (dto.name !== undefined) {
      updates.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      updates.description = dto.description.trim() || undefined;
    }

    const updatedProduct = productStore.update(id, updates);

    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id - Delete a product
productRouter.delete('/products/:id', (req: RequestWithTenant, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    // Get product and verify it exists
    const product = productStore.findById(id);
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

    const deleted = productStore.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
