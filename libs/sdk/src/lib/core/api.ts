/**
 * API Client for fetching scripts from the Next-Step backend
 */

import { Script } from '../types';
import { SDKConfig } from './config';

export class APIClient {
  private config: SDKConfig;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor(config: SDKConfig) {
    this.config = config;
  }

  /**
   * Fetch scripts for a project from the backend
   * @param projectId - The project ID
   * @returns Array of scripts
   */
  async fetchScripts(projectId: string): Promise<Script[]> {
    const url = `${this.config.apiUrl}/api/public/projects/${projectId}/scripts`;

    try {
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch scripts: ${response.status} ${response.statusText}`);
      }

      const scripts = await response.json();
      return scripts;
    } catch (error) {
      console.error('[NextStep] Failed to fetch scripts:', error);
      throw error;
    }
  }

  /**
   * Fetch with exponential backoff retry
   * @param url - URL to fetch
   * @param attempt - Current attempt number
   * @returns Response
   */
  private async fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API key if provided
      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on 5xx errors (server errors) or network errors
      if (!response.ok && attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }

      return response;
    } catch (error) {
      // Network error - retry
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Sleep for a given duration
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
