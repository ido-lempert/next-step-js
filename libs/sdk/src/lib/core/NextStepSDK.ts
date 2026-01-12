/**
 * NextStepSDK - Main SDK class for initializing and managing Next-Step components
 */

import { WalkthroughComponent } from '../components/WalkthroughComponent';
import { ModalComponent } from '../components/ModalComponent';
import { Script, WalkthroughConfig, ModalConfig } from '../types';
import { APIClient } from './api';
import { parseConfig, InitOptions, SDKConfig } from './config';

export class NextStepSDK {
  private config: SDKConfig | null = null;
  private apiClient: APIClient | null = null;
  private scripts: Script[] = [];
  private initialized = false;
  private activeWalkthroughs: Map<string, WalkthroughComponent> = new Map();
  private activeModals: Map<string, ModalComponent> = new Map();

  /**
   * Initialize the SDK with configuration options
   * @param options - Initialization options
   * @returns Promise that resolves when initialization is complete
   */
  async init(options: InitOptions): Promise<void> {
    if (this.initialized) {
      this.log('warn', 'SDK already initialized');
      return;
    }

    try {
      // Parse and validate configuration
      this.config = parseConfig(options);
      this.log('info', 'Initializing SDK', this.config);

      // Create API client
      this.apiClient = new APIClient(this.config);

      // Fetch scripts from backend
      this.scripts = await this.apiClient.fetchScripts(this.config.projectId);
      this.log('info', `Loaded ${this.scripts.length} scripts`);

      // Register web components
      this.registerComponents();

      // Mark as initialized
      this.initialized = true;

      // Call onReady callback
      if (this.config.onReady) {
        this.config.onReady();
      }

      this.log('info', 'SDK initialized successfully');
    } catch (error) {
      this.log('error', 'SDK initialization failed', error);

      // Call onError callback
      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get all loaded scripts
   */
  getScripts(): Script[] {
    if (!this.initialized) {
      this.log('warn', 'SDK not initialized. Call init() first.');
      return [];
    }
    return this.scripts;
  }

  /**
   * Get a specific script by ID
   */
  getScript(scriptId: string): Script | undefined {
    return this.scripts.find((s) => s.id === scriptId);
  }

  /**
   * Start a walkthrough by script ID
   */
  async startWalkthrough(
    scriptId: string,
    config?: WalkthroughConfig
  ): Promise<WalkthroughComponent | null> {
    if (!this.initialized) {
      this.log('error', 'Cannot start walkthrough: SDK not initialized');
      return null;
    }

    const script = this.getScript(scriptId);
    if (!script) {
      this.log('error', `Script not found: ${scriptId}`);
      return null;
    }

    if (script.type !== 'walkthrough') {
      this.log('error', `Script ${scriptId} is not a walkthrough`);
      return null;
    }

    // Create and start walkthrough
    const walkthrough = new WalkthroughComponent(config);
    this.activeWalkthroughs.set(scriptId, walkthrough);

    await walkthrough.start(script);
    return walkthrough;
  }

  /**
   * Start a modal by script ID
   */
  async startModal(
    scriptId: string,
    config?: ModalConfig
  ): Promise<ModalComponent | null> {
    if (!this.initialized) {
      this.log('error', 'Cannot start modal: SDK not initialized');
      return null;
    }

    const script = this.getScript(scriptId);
    if (!script) {
      this.log('error', `Script not found: ${scriptId}`);
      return null;
    }

    if (script.type !== 'modal') {
      this.log('error', `Script ${scriptId} is not a modal`);
      return null;
    }

    // Create and start modal
    const modal = new ModalComponent(config);
    this.activeModals.set(scriptId, modal);

    await modal.start(script);
    return modal;
  }

  /**
   * Destroy the SDK and clean up resources
   */
  destroy(): void {
    this.log('info', 'Destroying SDK');

    // Clean up active components
    this.activeWalkthroughs.forEach((walkthrough) => {
      walkthrough.destroy();
    });
    this.activeWalkthroughs.clear();

    this.activeModals.forEach((modal) => {
      modal.destroy();
    });
    this.activeModals.clear();

    // Reset state
    this.config = null;
    this.apiClient = null;
    this.scripts = [];
    this.initialized = false;
  }

  /**
   * Register web components
   */
  private registerComponents(): void {
    // Components are already registered via their class definitions
    // This is a placeholder for any future component registration logic
    this.log('info', 'Components registered');
  }

  /**
   * Internal logging method
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (!this.config?.debug && level === 'info') {
      return;
    }

    const prefix = '[NextStep]';
    switch (level) {
      case 'info':
        console.log(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }
}
