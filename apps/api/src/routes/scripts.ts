import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { scriptStore } from '../models/script-store';
import { scriptStepStore } from '../models/script-step-store';
import { productStore } from '../models/product-store';
import { projectStore } from '../models/project-store';
import { 
  CreateScriptDto, 
  UpdateScriptDto, 
  ScriptType,
  CreateScriptStepDto,
  UpdateScriptStepDto,
  ReorderStepsDto
} from '../types/script';
import { RequestWithTenant } from '../middleware/tenant';
import { RequestWithProduct, productOwnershipMiddleware } from '../middleware/product-ownership';

export const scriptRouter = Router();

// Validation helpers
function validateScriptName(name: string): string | null {
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

function validateScriptType(type: string): type is ScriptType {
  return type === 'walkthrough' || type === 'modal';
}

function validateStepTitle(title: string): string | null {
  if (!title || typeof title !== 'string') {
    return 'Title is required';
  }
  if (title.trim().length === 0) {
    return 'Title cannot be empty';
  }
  if (title.length > 255) {
    return 'Title must not exceed 255 characters';
  }
  return null;
}

// Middleware to verify script ownership through product -> project -> tenant chain
function scriptOwnershipMiddleware(
  req: RequestWithTenant,
  res: Response,
  next: Function
): void {
  const scriptId = req.params.scriptId || req.params.id;
  const tenantId = req.tenantId!;

  const script = scriptStore.findById(scriptId);

  if (!script) {
    res.status(404).json({ error: 'Script not found' });
    return;
  }

  // Verify product exists
  const product = productStore.findById(script.product_id);
  if (!product) {
    res.status(404).json({ error: 'Script not found' });
    return;
  }

  // Verify project ownership (tenant isolation)
  const project = projectStore.findById(product.project_id, tenantId);
  if (!project) {
    res.status(404).json({ error: 'Script not found' });
    return;
  }

  next();
}

// POST /api/products/:productId/scripts - Create script
scriptRouter.post(
  '/products/:productId/scripts',
  productOwnershipMiddleware,
  (req: RequestWithProduct, res: Response) => {
    try {
      const productId = req.params.productId;
      const dto: CreateScriptDto = req.body;

      // Validate name
      const nameError = validateScriptName(dto.name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }

      // Validate type
      if (!dto.type || !validateScriptType(dto.type)) {
        res.status(400).json({ error: 'Type must be either "walkthrough" or "modal"' });
        return;
      }

      // Create script
      const script = scriptStore.create({
        id: uuidv4(),
        product_id: productId,
        name: dto.name.trim(),
        type: dto.type,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json(script);
    } catch (error) {
      console.error('Error creating script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/products/:productId/scripts - List scripts
scriptRouter.get(
  '/products/:productId/scripts',
  productOwnershipMiddleware,
  (req: RequestWithProduct, res: Response) => {
    try {
      const productId = req.params.productId;
      const scripts = scriptStore.findByProductId(productId);
      
      // Enhance scripts with step count
      const scriptsWithStepCount = scripts.map(script => ({
        ...script,
        step_count: scriptStepStore.countByScriptId(script.id)
      }));
      
      res.json(scriptsWithStepCount);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/scripts/:id - Get single script with steps
scriptRouter.get(
  '/scripts/:id',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { id } = req.params;
      const script = scriptStore.findById(id);

      if (!script) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      const steps = scriptStepStore.findByScriptId(id);

      res.json({
        ...script,
        steps,
      });
    } catch (error) {
      console.error('Error fetching script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/scripts/:id - Update script metadata
scriptRouter.put(
  '/scripts/:id',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { id } = req.params;
      const dto: UpdateScriptDto = req.body;

      // Validate name if provided
      if (dto.name !== undefined) {
        const nameError = validateScriptName(dto.name);
        if (nameError) {
          res.status(400).json({ error: nameError });
          return;
        }
      }

      // Validate type if provided
      if (dto.type !== undefined && !validateScriptType(dto.type)) {
        res.status(400).json({ error: 'Type must be either "walkthrough" or "modal"' });
        return;
      }

      // Prepare updates
      const updates: Partial<UpdateScriptDto> = {};
      if (dto.name !== undefined) {
        updates.name = dto.name.trim();
      }
      if (dto.type !== undefined) {
        updates.type = dto.type;
      }

      const updatedScript = scriptStore.update(id, updates);

      if (!updatedScript) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      res.json(updatedScript);
    } catch (error) {
      console.error('Error updating script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/scripts/:id/publish - Publish script
scriptRouter.patch(
  '/scripts/:id/publish',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { id } = req.params;

      // Check if script has at least one step
      const stepCount = scriptStepStore.countByScriptId(id);
      if (stepCount === 0) {
        res.status(400).json({ error: 'Cannot publish script without steps' });
        return;
      }

      const updatedScript = scriptStore.update(id, { status: 'published' });

      if (!updatedScript) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      res.json(updatedScript);
    } catch (error) {
      console.error('Error publishing script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/scripts/:id/unpublish - Unpublish script
scriptRouter.patch(
  '/scripts/:id/unpublish',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { id } = req.params;

      const updatedScript = scriptStore.update(id, { status: 'draft' });

      if (!updatedScript) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      res.json(updatedScript);
    } catch (error) {
      console.error('Error unpublishing script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/scripts/:id - Delete script
scriptRouter.delete(
  '/scripts/:id',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { id } = req.params;

      const deleted = scriptStore.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Script not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting script:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/scripts/:scriptId/steps - Add step
scriptRouter.post(
  '/scripts/:scriptId/steps',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const scriptId = req.params.scriptId;
      const dto: CreateScriptStepDto = req.body;

      // Validate title
      const titleError = validateStepTitle(dto.title);
      if (titleError) {
        res.status(400).json({ error: titleError });
        return;
      }

      // Auto-assign order_index
      const orderIndex = scriptStepStore.getNextOrderIndex(scriptId);

      // Create step
      const step = scriptStepStore.create({
        id: uuidv4(),
        script_id: scriptId,
        order_index: orderIndex,
        title: dto.title.trim(),
        description: dto.description?.trim() || undefined,
        element_selector: dto.element_selector?.trim() || undefined,
        action_type: dto.action_type || undefined,
        config: dto.config || undefined,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json(step);
    } catch (error) {
      console.error('Error creating step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/scripts/:scriptId/steps/:stepId - Update step
scriptRouter.put(
  '/scripts/:scriptId/steps/:stepId',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { scriptId, stepId } = req.params;
      const dto: UpdateScriptStepDto = req.body;

      // Verify step belongs to script
      const step = scriptStepStore.findById(stepId);
      if (!step || step.script_id !== scriptId) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }

      // Validate title if provided
      if (dto.title !== undefined) {
        const titleError = validateStepTitle(dto.title);
        if (titleError) {
          res.status(400).json({ error: titleError });
          return;
        }
      }

      // Prepare updates
      const updates: Partial<UpdateScriptStepDto> = {};
      if (dto.title !== undefined) {
        updates.title = dto.title.trim();
      }
      if (dto.description !== undefined) {
        updates.description = dto.description.trim() || undefined;
      }
      if (dto.element_selector !== undefined) {
        updates.element_selector = dto.element_selector.trim() || undefined;
      }
      if (dto.action_type !== undefined) {
        updates.action_type = dto.action_type;
      }
      if (dto.config !== undefined) {
        updates.config = dto.config;
      }

      const updatedStep = scriptStepStore.update(stepId, updates);

      if (!updatedStep) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }

      res.json(updatedStep);
    } catch (error) {
      console.error('Error updating step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/scripts/:scriptId/steps/reorder - Reorder steps
scriptRouter.patch(
  '/scripts/:scriptId/steps/reorder',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const scriptId = req.params.scriptId;
      const dto: ReorderStepsDto = req.body;

      if (!dto.stepIds || !Array.isArray(dto.stepIds)) {
        res.status(400).json({ error: 'stepIds must be an array' });
        return;
      }

      // Verify all steps belong to the script
      const existingSteps = scriptStepStore.findByScriptId(scriptId);
      const existingStepIds = new Set(existingSteps.map(s => s.id));

      for (const stepId of dto.stepIds) {
        if (!existingStepIds.has(stepId)) {
          res.status(400).json({ error: `Step ${stepId} does not belong to script` });
          return;
        }
      }

      if (dto.stepIds.length !== existingSteps.length) {
        res.status(400).json({ error: 'All steps must be included in reorder' });
        return;
      }

      // Update order_index for each step
      dto.stepIds.forEach((stepId, index) => {
        scriptStepStore.update(stepId, { order_index: index });
      });

      // Return updated steps
      const updatedSteps = scriptStepStore.findByScriptId(scriptId);
      res.json(updatedSteps);
    } catch (error) {
      console.error('Error reordering steps:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/scripts/:scriptId/steps/:stepId - Delete step
scriptRouter.delete(
  '/scripts/:scriptId/steps/:stepId',
  scriptOwnershipMiddleware,
  (req: RequestWithTenant, res: Response) => {
    try {
      const { scriptId, stepId } = req.params;

      // Verify step belongs to script
      const step = scriptStepStore.findById(stepId);
      if (!step || step.script_id !== scriptId) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }

      const deleted = scriptStepStore.delete(stepId);

      if (!deleted) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }

      // Renumber remaining steps
      const remainingSteps = scriptStepStore.findByScriptId(scriptId);
      remainingSteps.forEach((s, index) => {
        scriptStepStore.update(s.id, { order_index: index });
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
