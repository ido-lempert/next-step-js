import { Injectable, signal } from '@angular/core';
import { Script, ScriptStep } from '../models/script.model';

export interface PreviewMessage {
  type: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PreviewBridgeService {
  private iframe?: HTMLIFrameElement;
  private messageListener?: (event: MessageEvent) => void;

  extensionDetected = signal(false);
  currentStep = signal<ScriptStep | null>(null);
  previewError = signal<string | null>(null);

  /**
   * Detect if the Chrome Extension is installed
   * Uses a ping/pong pattern with timeout
   */
  detectExtension(): Promise<boolean> {
    return new Promise((resolve) => {
      // Send ping to extension
      window.postMessage({ type: 'NEXTSTEP_EXTENSION_PING' }, '*');

      const timeout = setTimeout(() => {
        this.extensionDetected.set(false);
        resolve(false);
      }, 2000);

      // Listen for pong response
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'NEXTSTEP_EXTENSION_PONG') {
          clearTimeout(timeout);
          window.removeEventListener('message', listener);
          this.extensionDetected.set(true);
          resolve(true);
        }
      };

      window.addEventListener('message', listener);
    });
  }

  /**
   * Set the iframe reference for communication
   */
  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  /**
   * Load a script into the preview iframe
   */
  loadScript(script: Script) {
    if (!this.iframe?.contentWindow) {
      console.warn('Preview iframe not ready');
      return;
    }

    const message: PreviewMessage = {
      type: 'NEXTSTEP_LOAD_SCRIPT',
      payload: {
        scriptId: script.id,
        type: script.type,
        steps: script.steps || [],
      },
    };

    // Send message to iframe content
    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Start/play the current script in preview
   */
  playScript() {
    if (!this.iframe?.contentWindow) {
      console.warn('Preview iframe not ready');
      return;
    }

    const message: PreviewMessage = {
      type: 'NEXTSTEP_START_SCRIPT',
    };

    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Stop the current script in preview
   */
  stopScript() {
    if (!this.iframe?.contentWindow) {
      console.warn('Preview iframe not ready');
      return;
    }

    const message: PreviewMessage = {
      type: 'NEXTSTEP_STOP_SCRIPT',
    };

    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Reload the preview iframe
   */
  reloadPreview() {
    if (!this.iframe) {
      console.warn('Preview iframe not ready');
      return;
    }
    // Force reload by reassigning src
    const currentSrc = this.iframe.src;
    this.iframe.src = '';
    setTimeout(() => {
      if (this.iframe) {
        this.iframe.src = currentSrc;
      }
    }, 10);
  }

  /**
   * Start listening for messages from iframe
   */
  startListening(callback: (event: MessageEvent) => void) {
    this.messageListener = (event: MessageEvent) => {
      // Validate message structure
      if (!event.data || typeof event.data.type !== 'string') {
        return;
      }

      // Handle specific message types
      switch (event.data.type) {
        case 'NEXTSTEP_STEP_SHOWN':
          this.currentStep.set(event.data.payload?.step || null);
          break;
        case 'NEXTSTEP_SCRIPT_ERROR':
          this.previewError.set(event.data.payload?.error || 'Unknown error');
          break;
        case 'NEXTSTEP_SCRIPT_COMPLETE':
          this.currentStep.set(null);
          break;
      }

      // Call custom callback
      callback(event);
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Stop listening for messages
   */
  stopListening() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = undefined;
    }
  }

  /**
   * Clear preview state
   */
  clearState() {
    this.currentStep.set(null);
    this.previewError.set(null);
  }
}
