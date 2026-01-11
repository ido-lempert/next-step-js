import { Router } from 'express';
import {
  createScriptStep,
  getScriptSteps,
  getScriptStep,
  updateScriptStep,
  reorderScriptSteps,
  deleteScriptStep,
} from '../controllers/script-step.controller';
import {
  validateCreateScriptStep,
  validateUpdateScriptStep,
  validateReorderSteps,
} from '../validators/script-step-validators';

const router = Router();

// Create a new step for a script
router.post('/scripts/:scriptId/steps', validateCreateScriptStep, createScriptStep);

// Get all steps for a script
router.get('/scripts/:scriptId/steps', getScriptSteps);

// Reorder steps
router.patch('/scripts/:scriptId/steps/reorder', validateReorderSteps, reorderScriptSteps);

// Get a single step by ID
router.get('/scripts/:scriptId/steps/:stepId', getScriptStep);

// Update a step
router.put('/scripts/:scriptId/steps/:stepId', validateUpdateScriptStep, updateScriptStep);

// Delete a step
router.delete('/scripts/:scriptId/steps/:stepId', deleteScriptStep);

export default router;
