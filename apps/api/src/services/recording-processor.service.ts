// Service for processing recordings and managing generation jobs

import { Recording, GenerationJob } from '../models/recording';
import { randomUUID } from 'crypto';
import { aiService } from './ai.service';
import { scriptService } from './script.service';
import { scriptStepService } from './script-step.service';

class RecordingProcessorService {
  private jobs: Map<string, GenerationJob> = new Map();
  private recordings: Map<string, Recording> = new Map();

  /**
   * Store a recording temporarily
   */
  async storeRecording(recording: Recording): Promise<string> {
    const recordingId = recording.id || randomUUID();
    const recordingWithId = { ...recording, id: recordingId };
    this.recordings.set(recordingId, recordingWithId);
    return recordingId;
  }

  /**
   * Get a stored recording
   */
  async getRecording(recordingId: string): Promise<Recording | null> {
    return this.recordings.get(recordingId) || null;
  }

  /**
   * Create a generation job
   */
  async createJob(recordingId: string, productId: string): Promise<GenerationJob> {
    const job: GenerationJob = {
      id: randomUUID(),
      recordingId,
      productId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);

    // Start processing asynchronously
    this.processJob(job.id).catch((error) => {
      console.error(`Job ${job.id} failed:`, error);
      this.updateJobStatus(job.id, 'failed', undefined, error.message);
    });

    return job;
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<GenerationJob | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Process a generation job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Update status to processing
    this.updateJobStatus(jobId, 'processing');

    // Get recording
    const recording = await this.getRecording(job.recordingId);
    if (!recording) {
      throw new Error(`Recording ${job.recordingId} not found`);
    }

    // Generate script using AI
    const generatedScript = await aiService.generateScriptFromRecording(recording);

    // Create script in database
    const script = await scriptService.create(
      job.productId,
      'default-tenant', // TODO: Get tenant from context
      {
        name: generatedScript.title,
        type: 'walkthrough',
      }
    );

    if (!script) {
      throw new Error('Failed to create script');
    }

    // Create steps
    for (let i = 0; i < generatedScript.steps.length; i++) {
      const step = generatedScript.steps[i];
      await scriptStepService.create(script.id, 'default-tenant', {
        title: step.title,
        description: step.description,
        elementSelector: step.elementSelector,
        actionType: step.actionType,
      });
    }

    // Update job status to completed
    this.updateJobStatus(jobId, 'completed', script.id);

    // Clean up recording after successful processing
    this.recordings.delete(job.recordingId);
  }

  /**
   * Update job status
   */
  private updateJobStatus(
    jobId: string,
    status: GenerationJob['status'],
    scriptId?: string,
    error?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
      if (scriptId) {
        job.scriptId = scriptId;
      }
      if (error) {
        job.error = error;
      }
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Clean up old jobs (should be called periodically)
   */
  cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [jobId, job] of this.jobs.entries()) {
      const age = now - job.createdAt.getTime();
      if (age > maxAgeMs) {
        this.jobs.delete(jobId);
        // Also clean up associated recording if still exists
        if (this.recordings.has(job.recordingId)) {
          this.recordings.delete(job.recordingId);
        }
      }
    }
  }
}

export const recordingProcessorService = new RecordingProcessorService();
