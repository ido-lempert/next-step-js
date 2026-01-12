import { Router } from 'express';
import { getPublicScripts } from '../controllers/public.controller';

const router = Router();

/**
 * Public API endpoint - no authentication required
 * Returns active scripts for a project
 */
router.get('/projects/:projectId/scripts', getPublicScripts);

export default router;
