/**
 * Tests for APIClient
 */

import { APIClient } from './api';
import { SDKConfig } from './config';

global.fetch = jest.fn();

describe('APIClient', () => {
  let client: APIClient;
  let config: SDKConfig;

  beforeEach(() => {
    config = {
      projectId: 'test-project',
      environment: 'development',
      apiUrl: 'http://localhost:3333',
      debug: false,
    };
    client = new APIClient(config);
    jest.clearAllMocks();
  });

  describe('fetchScripts', () => {
    it('should fetch scripts successfully', async () => {
      const mockScripts = [
        {
          id: 'script-1',
          productId: 'product-1',
          name: 'Test Script',
          type: 'walkthrough',
          status: 'published',
          steps: [],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockScripts,
      });

      const scripts = await client.fetchScripts('test-project');

      expect(scripts).toEqual(mockScripts);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3333/api/public/projects/test-project/scripts',
        expect.objectContaining({
          method: 'GET',
          mode: 'cors',
        })
      );
    });

    it('should include API key in headers if provided', async () => {
      config.apiKey = 'test-key';
      client = new APIClient(config);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await client.fetchScripts('test-project');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-key',
          }),
        })
      );
    });

    it('should throw error on 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.fetchScripts('test-project')).rejects.toThrow('Failed to fetch scripts: 404');
    });

    it('should throw error on 500', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.fetchScripts('test-project')).rejects.toThrow('Failed to fetch scripts: 500');
    });

    it('should retry on 5xx errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      await client.fetchScripts('test-project');

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.fetchScripts('test-project')).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      await client.fetchScripts('test-project');

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(client.fetchScripts('test-project')).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
