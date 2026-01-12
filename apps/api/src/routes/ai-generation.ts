import { Router } from 'express';
import {
  generateFromRecording,
  getGenerationStatus,
} from '../controllers/ai-generation.controller';

const router = Router();

// Generate script from recording
router.post('/scripts/generate-from-recording', generateFromRecording);

// Get generation job status
router.get('/scripts/generation-status/:jobId', getGenerationStatus);

export default router;
