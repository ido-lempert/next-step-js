import { aiService } from './ai.service';
import { Recording } from '../models/recording';
import { describe, it, expect } from 'vitest';

describe('AIService', () => {
  describe('generateScriptFromRecording', () => {
    it('should generate a mock script from recording', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#login-button',
            elementText: 'Login',
            elementType: 'button',
          },
          {
            type: 'input',
            timestamp: Date.now(),
            selector: '#username',
            elementText: 'Username',
            elementType: 'input',
            value: '[user input]',
          },
        ],
      };

      const result = await aiService.generateScriptFromRecording(recording);

      expect(result).toBeDefined();
      expect(result.title).toBeTruthy();
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].title).toContain('Login');
      expect(result.steps[0].elementSelector).toBe('#login-button');
      expect(result.steps[1].title).toContain('Username');
      expect(result.steps[1].elementSelector).toBe('#username');
    });

    it('should filter out non-click and non-input interactions', async () => {
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
            elementText: 'Click Me',
            elementType: 'button',
          },
          {
            type: 'scroll',
            timestamp: Date.now(),
            selector: '',
            scrollPosition: { x: 0, y: 100 },
          },
          {
            type: 'navigation',
            timestamp: Date.now(),
            selector: '',
            url: 'https://example.com/page2',
          },
        ],
      };

      const result = await aiService.generateScriptFromRecording(recording);

      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].elementSelector).toBe('#button');
    });

    it('should generate appropriate action descriptions', async () => {
      const recording: Recording = {
        sessionId: 'test-session',
        startUrl: 'https://example.com',
        pageTitle: 'Example Page',
        startTime: Date.now(),
        interactions: [
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#submit-button',
            elementText: 'Submit Form',
            elementType: 'button',
          },
          {
            type: 'click',
            timestamp: Date.now(),
            selector: '#login-link',
            elementText: 'Login',
            elementType: 'a',
          },
        ],
      };

      const result = await aiService.generateScriptFromRecording(recording);

      expect(result.steps[0].description).toContain('save');
      expect(result.steps[1].description).toContain('log you into');
    });

    it('should simulate AI processing delay', async () => {
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

      const startTime = Date.now();
      await aiService.generateScriptFromRecording(recording);
      const endTime = Date.now();

      // Should take at least 1.9 seconds (simulated delay with small margin)
      expect(endTime - startTime).toBeGreaterThanOrEqual(1900);
    });
  });
});
