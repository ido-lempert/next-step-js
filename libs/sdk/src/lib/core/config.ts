/**
 * Configuration parsing and validation for NextStep SDK
 */

export interface InitOptions {
  projectId: string;
  apiKey?: string;
  environment?: 'development' | 'staging' | 'production';
  apiUrl?: string;
  debug?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface SDKConfig {
  projectId: string;
  apiKey?: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  debug: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Default API URLs for different environments
 */
const DEFAULT_API_URLS: Record<string, string> = {
  development: 'http://localhost:3333',
  staging: 'https://api-staging.nextstep.app',
  production: 'https://api.nextstep.app',
};

/**
 * Parse and validate initialization options
 * @param options - Raw initialization options
 * @returns Validated SDK configuration
 */
export function parseConfig(options: InitOptions): SDKConfig {
  // Validate required fields
  if (!options.projectId || typeof options.projectId !== 'string') {
    throw new Error('projectId is required and must be a string');
  }

  // Determine environment
  const environment = options.environment || 'production';
  if (!['development', 'staging', 'production'].includes(environment)) {
    throw new Error('environment must be one of: development, staging, production');
  }

  // Determine API URL
  const apiUrl = options.apiUrl || DEFAULT_API_URLS[environment];

  // Build configuration
  const config: SDKConfig = {
    projectId: options.projectId,
    apiKey: options.apiKey,
    environment,
    apiUrl,
    debug: options.debug || false,
    onReady: options.onReady,
    onError: options.onError,
  };

  return config;
}

/**
 * Parse configuration from script tag data attributes
 * @param script - The script element
 * @returns Initialization options or null if not found
 */
export function parseScriptTagConfig(script: HTMLScriptElement | null): InitOptions | null {
  if (!script) {
    return null;
  }

  const projectId = script.dataset['projectId'];
  if (!projectId) {
    return null;
  }

  return {
    projectId,
    apiKey: script.dataset['apiKey'],
    environment: (script.dataset['environment'] as InitOptions['environment']) || 'production',
    debug: script.dataset['debug'] === 'true',
  };
}
