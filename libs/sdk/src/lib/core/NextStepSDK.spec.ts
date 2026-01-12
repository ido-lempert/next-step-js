/**
 * Tests for NextStepSDK class
 */

import { NextStepSDK } from './NextStepSDK';
import { APIClient } from './api';
import { Script } from '../types';

// Mock APIClient
jest.mock('./api');

describe('NextStepSDK', () => {
  let sdk: NextStepSDK;
  let mockApiClient: jest.Mocked<APIClient>;

  const mockScripts: Script[] = [
    {
      id: 'script-1',
      productId: 'product-1',
      name: 'Test Walkthrough',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'script-1',
          orderIndex: 0,
          title: 'Step 1',
          description: 'First step',
          elementSelector: '#button1',
        },
      ],
    },
    {
      id: 'script-2',
      productId: 'product-1',
      name: 'Test Modal',
      type: 'modal',
      status: 'published',
      steps: [
        {
          id: 'step-2',
          scriptId: 'script-2',
          orderIndex: 0,
          title: 'Modal Step',
          description: 'Modal content',
        },
      ],
    },
  ];

  beforeEach(() => {
    sdk = new NextStepSDK();
    mockApiClient = new APIClient({ projectId: 'test', apiUrl: 'http://test', environment: 'development', debug: false }) as jest.Mocked<APIClient>;
    mockApiClient.fetchScripts = jest.fn().mockResolvedValue(mockScripts);
    (APIClient as jest.MockedClass<typeof APIClient>).mockImplementation(() => mockApiClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize successfully with valid config', async () => {
      await sdk.init({ projectId: 'test-project' });

      expect(sdk.isInitialized()).toBe(true);
      expect(mockApiClient.fetchScripts).toHaveBeenCalledWith('test-project');
    });

    it('should throw error if projectId is missing', async () => {
      await expect(sdk.init({ projectId: '' })).rejects.toThrow('projectId is required');
    });

    it('should not re-initialize if already initialized', async () => {
      await sdk.init({ projectId: 'test-project' });
      await sdk.init({ projectId: 'test-project' });

      expect(mockApiClient.fetchScripts).toHaveBeenCalledTimes(1);
    });

    it('should call onReady callback when initialization succeeds', async () => {
      const onReady = jest.fn();
      await sdk.init({ projectId: 'test-project', onReady });

      expect(onReady).toHaveBeenCalled();
    });

    it('should call onError callback when initialization fails', async () => {
      const onError = jest.fn();
      mockApiClient.fetchScripts.mockRejectedValue(new Error('Network error'));

      await expect(sdk.init({ projectId: 'test-project', onError })).rejects.toThrow('Network error');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should use custom API URL if provided', async () => {
      await sdk.init({
        projectId: 'test-project',
        apiUrl: 'https://custom.api.com',
      });

      expect(APIClient).toHaveBeenCalledWith(
        expect.objectContaining({
          apiUrl: 'https://custom.api.com',
        })
      );
    });

    it('should enable debug mode when specified', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();

      await sdk.init({ projectId: 'test-project', debug: true });

      expect(consoleLog).toHaveBeenCalledWith(
        '[NextStep]',
        expect.any(String),
        expect.anything()
      );

      consoleLog.mockRestore();
    });
  });

  describe('getScripts', () => {
    it('should return empty array if not initialized', () => {
      expect(sdk.getScripts()).toEqual([]);
    });

    it('should return scripts after initialization', async () => {
      await sdk.init({ projectId: 'test-project' });

      const scripts = sdk.getScripts();
      expect(scripts).toEqual(mockScripts);
      expect(scripts).toHaveLength(2);
    });
  });

  describe('getScript', () => {
    beforeEach(async () => {
      await sdk.init({ projectId: 'test-project' });
    });

    it('should return script by ID', () => {
      const script = sdk.getScript('script-1');
      expect(script).toBeDefined();
      expect(script?.name).toBe('Test Walkthrough');
    });

    it('should return undefined for non-existent script', () => {
      const script = sdk.getScript('non-existent');
      expect(script).toBeUndefined();
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(sdk.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await sdk.init({ projectId: 'test-project' });
      expect(sdk.isInitialized()).toBe(true);
    });

    it('should return false after destroy', async () => {
      await sdk.init({ projectId: 'test-project' });
      sdk.destroy();
      expect(sdk.isInitialized()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should reset SDK state', async () => {
      await sdk.init({ projectId: 'test-project' });
      sdk.destroy();

      expect(sdk.isInitialized()).toBe(false);
      expect(sdk.getScripts()).toEqual([]);
    });
  });

  describe('environment configuration', () => {
    it('should default to production environment', async () => {
      await sdk.init({ projectId: 'test-project' });

      expect(APIClient).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'production',
        })
      );
    });

    it('should accept development environment', async () => {
      await sdk.init({
        projectId: 'test-project',
        environment: 'development',
      });

      expect(APIClient).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'development',
        })
      );
    });

    it('should accept staging environment', async () => {
      await sdk.init({
        projectId: 'test-project',
        environment: 'staging',
      });

      expect(APIClient).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'staging',
        })
      );
    });
  });
});
