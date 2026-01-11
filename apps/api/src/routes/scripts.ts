import { Router } from 'express';
import {
  createScript,
  getScripts,
  getScript,
  updateScript,
  publishScript,
  unpublishScript,
  deleteScript,
} from '../controllers/script.controller';
import {
  validateCreateScript,
  validateUpdateScript,
} from '../validators/script-validators';

const router = Router();

// Create a new script within a product
router.post('/products/:productId/scripts', validateCreateScript, createScript);

// Get all scripts for a product
router.get('/products/:productId/scripts', getScripts);

// Get a single script by ID with steps
router.get('/scripts/:id', getScript);

// Update a script
router.put('/scripts/:id', validateUpdateScript, updateScript);

// Publish a script
router.patch('/scripts/:id/publish', publishScript);

// Unpublish a script
router.patch('/scripts/:id/unpublish', unpublishScript);

// Delete a script
router.delete('/scripts/:id', deleteScript);

export default router;
