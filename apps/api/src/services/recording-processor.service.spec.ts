import { recordingProcessorService } from './recording-processor.service';
import { productService } from './product.service';
import { projectService } from './project.service';
import { Recording } from '../models/recording';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('RecordingProcessorService', () => {
  let testProductId: string;
  let testTenantId: string;

  beforeEach(async () => {
    // Clear any existing data
    vi.clearAllMocks();
    
    // Create a test project and product for use in tests
    testTenantId = 'test-tenant';
    const project = await projectService.create(testTenantId, {
      name: 'Test Project',
      description: 'Test project for recording processor tests',
    });
    
    if (project) {
      const product = await productService.create(project.id, testTenantId, {
        name: 'Test Product',
        description: 'Test product for recording processor tests',
      });
      
      if (product) {
        testProductId = product.id;
      }
    }
  });

  describe('storeRecording', () => {
    it('should store a recording and return its ID', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [],
      };

      const recordingId = await recordingProcessorService.storeRecording(recording);

      expect(recordingId).toBeDefined();
      expect(typeof recordingId).toBe('string');

      // Verify it can be retrieved
      const retrieved = await recordingProcessorService.getRecording(recordingId);
      expect(retrieved).toEqual({ ...recording, id: recordingId });
    });

    it('should use provided ID if present', async () => {
      const recording: Recording = {
        id: 'custom-id',
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [],
      };

      const recordingId = await recordingProcessorService.storeRecording(recording);

      expect(recordingId).toBe('custom-id');
    });
  });

  describe('createJob', () => {
    it('should create a generation job', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#button',
            elementText: 'Click',
            elementType: 'button',
          },
        ],
      };

      const recordingId = await recordingProcessorService.storeRecording(recording);
      const job = await recordingProcessorService.createJob(recordingId, testProductId);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.recordingId).toBe(recordingId);
      expect(job.productId).toBe(testProductId);
      // Job may be pending or processing depending on timing
      expect(['pending', 'processing'].includes(job.status)).toBe(true);
    });

    it('should process job asynchronously', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Test Page',
        startTime: Date.now(),
        interactions: [
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#button',
            elementText: 'Click',
            elementType: 'button',
          },
        ],
      };

      const recordingId = await recordingProcessorService.storeRecording(recording);
      const job = await recordingProcessorService.createJob(recordingId, testProductId);

      // Job should start as pending or processing
      expect(['pending', 'processing'].includes(job.status)).toBe(true);

      // Wait for processing to complete (mock AI takes ~2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check job status - it should be completed or failed (depending on product existence)
      const updatedJob = await recordingProcessorService.getJob(job.id);
      
      // The job will be processed asynchronously - verify it has changed from pending
      expect(updatedJob?.status).not.toBe('pending');
      expect(['processing', 'completed', 'failed'].includes(updatedJob?.status || '')).toBe(true);
    }, 10000); // Increase timeout for this test
  });

  describe('getJob', () => {
    it('should return null for non-existent job', async () => {
      const job = await recordingProcessorService.getJob('non-existent');
      expect(job).toBeNull();
    });

    it('should return job if it exists', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#button',
            elementText: 'Click',
            elementType: 'button',
          },
        ],
      };

      const recordingId = await recordingProcessorService.storeRecording(recording);
      const createdJob = await recordingProcessorService.createJob(recordingId, 'product-123');

      const retrievedJob = await recordingProcessorService.getJob(createdJob.id);
      expect(retrievedJob).toEqual(createdJob);
    });
  });
});
