import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from '../validators/product-validators';

const router = Router();

// Create a new product within a project
router.post('/projects/:projectId/products', validateCreateProduct, createProduct);

// Get all products for a project
router.get('/projects/:projectId/products', getProducts);

// Get a single product by ID
router.get('/products/:id', getProduct);

// Update a product
router.put('/products/:id', validateUpdateProduct, updateProduct);

// Delete a product
router.delete('/products/:id', deleteProduct);

export default router;
