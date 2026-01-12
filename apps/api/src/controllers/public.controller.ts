import { Request, Response } from 'express';
import { scriptService } from '../services/script.service';
import { scriptStepService } from '../services/script-step.service';

/**
 * Get public scripts for a project
 * No authentication required - returns only published scripts
 */
export async function getPublicScripts(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    // Get all scripts for the product (projectId is actually productId in the API)
    // Since this is a public endpoint, we need to handle this differently
    // We'll get all scripts and filter for published ones
    const allScripts = Array.from((scriptService as any).scripts.values() || []);
    
    // Filter for scripts that belong to this product and are published
    const scripts = allScripts
      .filter((script: any) => script.productId === projectId && script.status === 'published')
      .map((script: any) => ({
        id: script.id,
        productId: script.productId,
        name: script.name,
        type: script.type,
        status: script.status,
        steps: [], // Steps will be fetched separately
      }));

    // Fetch steps for each script
    const scriptsWithSteps = await Promise.all(
      scripts.map(async (script) => {
        const steps = await scriptStepService.findAllByScript(script.id, ''); // Empty tenant since public
        return {
          ...script,
          steps: steps || [],
        };
      })
    );

    res.json(scriptsWithSteps);
  } catch (error) {
    console.error('[Public API] Error fetching scripts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
