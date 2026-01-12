// Controller for AI-powered script generation from recordings

import { Request, Response } from 'express';
import { recordingProcessorService } from '../services/recording-processor.service';
import { Recording } from '../models/recording';

/**
 * Upload a recording and start AI generation
 * POST /api/scripts/generate-from-recording
 */
export async function generateFromRecording(req: Request, res: Response) {
  try {
    const { recording, productId } = req.body;

    if (!recording) {
      return res.status(400).json({
        error: 'Recording data is required',
      });
    }

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required',
      });
    }

    // Validate recording structure
    if (!recording.sessionId || !recording.startUrl || !Array.isArray(recording.interactions)) {
      return res.status(400).json({
        error: 'Invalid recording format. Required fields: sessionId, startUrl, interactions',
      });
    }

    // Store recording
    const recordingId = await recordingProcessorService.storeRecording(recording as Recording);

    // Create generation job
    const job = await recordingProcessorService.createJob(recordingId, productId);

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'Recording received. Script generation started.',
    });
  } catch (error) {
    console.error('Error generating script from recording:', error);
    res.status(500).json({
      error: 'Failed to process recording',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get the status of a generation job
 * GET /api/scripts/generation-status/:jobId
 */
export async function getGenerationStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    const job = await recordingProcessorService.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      scriptId: job.scriptId,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  } catch (error) {
    console.error('Error getting generation status:', error);
    res.status(500).json({
      error: 'Failed to get generation status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
