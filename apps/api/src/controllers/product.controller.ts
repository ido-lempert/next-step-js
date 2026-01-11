import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto } from '../models/product';

/**
 * Create a new product within a project
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { projectId } = req.params;
    const dto: CreateProductDto = req.body;

    const product = await productService.create(projectId, tenantId, dto);

    if (!product) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Project not found' 
      });
      return;
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create product' 
    });
  }
};

/**
 * Get all products for a project
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { projectId } = req.params;

    const products = await productService.findAllByProject(projectId, tenantId);

    if (products === null) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Project not found' 
      });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch products' 
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const product = await productService.findOne(id, tenantId);

    if (!product) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch product' 
    });
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const dto: UpdateProductDto = req.body;

    const product = await productService.update(id, tenantId, dto);

    if (!product) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update product' 
    });
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const deleted = await productService.delete(id, tenantId);

    if (!deleted) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Product not found' 
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete product' 
    });
  }
};
