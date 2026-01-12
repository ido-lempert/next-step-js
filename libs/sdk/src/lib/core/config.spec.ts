/**
 * Tests for configuration parsing
 */

import { parseConfig, parseScriptTagConfig, InitOptions } from './config';

describe('config', () => {
  describe('parseConfig', () => {
    it('should parse valid configuration', () => {
      const options: InitOptions = {
        projectId: 'test-project',
      };

      const config = parseConfig(options);

      expect(config).toEqual({
        projectId: 'test-project',
        apiKey: undefined,
        environment: 'production',
        apiUrl: 'https://api.nextstep.app',
        debug: false,
        onReady: undefined,
        onError: undefined,
      });
    });

    it('should throw error if projectId is missing', () => {
      expect(() => parseConfig({ projectId: '' })).toThrow('projectId is required');
    });

    it('should throw error if projectId is not a string', () => {
      expect(() => parseConfig({ projectId: 123 as any })).toThrow('projectId is required');
    });

    it('should use custom environment', () => {
      const config = parseConfig({
        projectId: 'test-project',
        environment: 'development',
      });

      expect(config.environment).toBe('development');
      expect(config.apiUrl).toBe('http://localhost:3333');
    });

    it('should use custom API URL', () => {
      const config = parseConfig({
        projectId: 'test-project',
        apiUrl: 'https://custom.api.com',
      });

      expect(config.apiUrl).toBe('https://custom.api.com');
    });

    it('should enable debug mode', () => {
      const config = parseConfig({
        projectId: 'test-project',
        debug: true,
      });

      expect(config.debug).toBe(true);
    });

    it('should include callbacks', () => {
      const onReady = jest.fn();
      const onError = jest.fn();

      const config = parseConfig({
        projectId: 'test-project',
        onReady,
        onError,
      });

      expect(config.onReady).toBe(onReady);
      expect(config.onError).toBe(onError);
    });

    it('should throw error for invalid environment', () => {
      expect(() =>
        parseConfig({
          projectId: 'test-project',
          environment: 'invalid' as any,
        })
      ).toThrow('environment must be one of');
    });
  });

  describe('parseScriptTagConfig', () => {
    it('should parse script tag attributes', () => {
      const script = document.createElement('script');
      script.dataset['projectId'] = 'test-project';
      script.dataset['apiKey'] = 'test-key';
      script.dataset['environment'] = 'development';
      script.dataset['debug'] = 'true';

      const config = parseScriptTagConfig(script);

      expect(config).toEqual({
        projectId: 'test-project',
        apiKey: 'test-key',
        environment: 'development',
        debug: true,
      });
    });

    it('should return null if script is null', () => {
      const config = parseScriptTagConfig(null);
      expect(config).toBeNull();
    });

    it('should return null if projectId is missing', () => {
      const script = document.createElement('script');
      const config = parseScriptTagConfig(script);
      expect(config).toBeNull();
    });

    it('should use default values for optional attributes', () => {
      const script = document.createElement('script');
      script.dataset['projectId'] = 'test-project';

      const config = parseScriptTagConfig(script);

      expect(config).toEqual({
        projectId: 'test-project',
        apiKey: undefined,
        environment: 'production',
        debug: false,
      });
    });

    it('should handle debug=false', () => {
      const script = document.createElement('script');
      script.dataset['projectId'] = 'test-project';
      script.dataset['debug'] = 'false';

      const config = parseScriptTagConfig(script);

      expect(config?.debug).toBe(false);
    });
  });
});
