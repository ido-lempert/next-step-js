import { Request, Response } from 'express';
import { scriptStepService } from '../services/script-step.service';
import { CreateScriptStepDto, UpdateScriptStepDto } from '../models/script-step';

/**
 * Create a new step for a script
 */
export const createScriptStep = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { scriptId } = req.params;
    const dto: CreateScriptStepDto = req.body;

    const step = await scriptStepService.create(scriptId, tenantId, dto);

    if (!step) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(201).json(step);
  } catch (error) {
    console.error('Error creating script step:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create script step' 
    });
  }
};

/**
 * Get all steps for a script
 */
export const getScriptSteps = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { scriptId } = req.params;

    const steps = await scriptStepService.findAllByScript(scriptId, tenantId);

    if (steps === null) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(200).json(steps);
  } catch (error) {
    console.error('Error fetching script steps:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch script steps' 
    });
  }
};

/**
 * Get a single step by ID
 */
export const getScriptStep = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { stepId } = req.params;

    const step = await scriptStepService.findOne(stepId, tenantId);

    if (!step) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script step not found' 
      });
      return;
    }

    res.status(200).json(step);
  } catch (error) {
    console.error('Error fetching script step:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch script step' 
    });
  }
};

/**
 * Update a step
 */
export const updateScriptStep = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { stepId } = req.params;
    const dto: UpdateScriptStepDto = req.body;

    const step = await scriptStepService.update(stepId, tenantId, dto);

    if (!step) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script step not found' 
      });
      return;
    }

    res.status(200).json(step);
  } catch (error) {
    console.error('Error updating script step:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update script step' 
    });
  }
};

/**
 * Reorder steps
 */
export const reorderScriptSteps = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { scriptId } = req.params;
    const { stepIds } = req.body as { stepIds: string[] };

    const steps = await scriptStepService.reorder(scriptId, tenantId, stepIds);

    if (steps === null) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found or invalid step IDs' 
      });
      return;
    }

    res.status(200).json(steps);
  } catch (error) {
    console.error('Error reordering script steps:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to reorder script steps' 
    });
  }
};

/**
 * Delete a step
 */
export const deleteScriptStep = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { stepId } = req.params;

    const deleted = await scriptStepService.delete(stepId, tenantId);

    if (!deleted) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script step not found' 
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting script step:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete script step' 
    });
  }
};
