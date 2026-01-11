import { Request, Response } from 'express';
import { scriptService } from '../services/script.service';
import { scriptStepService } from '../services/script-step.service';
import { CreateScriptDto, UpdateScriptDto } from '../models/script';

/**
 * Create a new script within a product
 */
export const createScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { productId } = req.params;
    const dto: CreateScriptDto = req.body;

    const script = await scriptService.create(productId, tenantId, dto);

    if (!script) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Product not found' 
      });
      return;
    }

    res.status(201).json(script);
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create script' 
    });
  }
};

/**
 * Get all scripts for a product
 */
export const getScripts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { productId } = req.params;

    const scripts = await scriptService.findAllByProduct(productId, tenantId);

    if (scripts === null) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch scripts' 
    });
  }
};

/**
 * Get a single script by ID with its steps
 */
export const getScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const script = await scriptService.findOne(id, tenantId);

    if (!script) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    // Include steps with the script
    const steps = await scriptStepService.findAllByScript(id, tenantId);

    res.status(200).json({
      ...script,
      steps: steps || [],
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch script' 
    });
  }
};

/**
 * Update a script
 */
export const updateScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const dto: UpdateScriptDto = req.body;

    const script = await scriptService.update(id, tenantId, dto);

    if (!script) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(200).json(script);
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update script' 
    });
  }
};

/**
 * Publish a script
 */
export const publishScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    // Check if script has at least one step
    const stepCount = await scriptStepService.countByScript(id);
    if (stepCount === 0) {
      res.status(400).json({ 
        error: 'Validation Error',
        message: 'Cannot publish script without steps' 
      });
      return;
    }

    const script = await scriptService.publish(id, tenantId);

    if (!script) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(200).json(script);
  } catch (error) {
    console.error('Error publishing script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to publish script' 
    });
  }
};

/**
 * Unpublish a script
 */
export const unpublishScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const script = await scriptService.unpublish(id, tenantId);

    if (!script) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(200).json(script);
  } catch (error) {
    console.error('Error unpublishing script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to unpublish script' 
    });
  }
};

/**
 * Delete a script
 */
export const deleteScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const deleted = await scriptService.delete(id, tenantId);

    if (!deleted) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Script not found' 
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete script' 
    });
  }
};
