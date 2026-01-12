import { sdk } from './sdk';

/**
 * Tests for NextStep SDK
 */

import { NextStepSDK, createNextStepSDK, nextStep } from './sdk';
import { WalkthroughConfig } from './types';

describe('NextStepSDK', () => {
  let sdk: NextStepSDK;
  let config: WalkthroughConfig;

  beforeEach(() => {
    sdk = new NextStepSDK();
    document.body.innerHTML = '';
    jest.useFakeTimers();
    
    // Mock window.scrollTo since jsdom doesn't implement it
    window.scrollTo = jest.fn();

    config = {
      id: 'test-walkthrough',
      name: 'Test Walkthrough',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1',
          description: 'First step',
          order_index: 0,
        },
      ],
    };
  });

  afterEach(() => {
    sdk.stopWalkthrough();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create SDK instance', () => {
      expect(sdk).toBeDefined();
      expect(sdk).toBeInstanceOf(NextStepSDK);
    });

    it('should create SDK with factory function', () => {
      const instance = createNextStepSDK();
      expect(instance).toBeInstanceOf(NextStepSDK);
    });

    it('should export default instance', () => {
      expect(nextStep).toBeInstanceOf(NextStepSDK);
    });
  });

  describe('startWalkthrough', () => {
    it('should start a walkthrough', async () => {
      await sdk.startWalkthrough(config);
      jest.runAllTimers();

      expect(sdk.isActive()).toBe(true);
      
      const container = document.querySelector('#nextstep-walkthrough');
      expect(container).toBeTruthy();
    });

    it('should stop previous walkthrough when starting new one', async () => {
      await sdk.startWalkthrough(config);
      jest.runAllTimers();
      
      const firstContainer = document.querySelector('#nextstep-walkthrough');
      expect(firstContainer).toBeTruthy();

      // Start another walkthrough
      const config2 = { ...config, id: 'walkthrough-2' };
      await sdk.startWalkthrough(config2);
      jest.runAllTimers();

      // Should still have only one container
      const containers = document.querySelectorAll('#nextstep-walkthrough');
      expect(containers.length).toBe(1);
    });
  });

  describe('stopWalkthrough', () => {
    it('should stop active walkthrough', async () => {
      await sdk.startWalkthrough(config);
      jest.runAllTimers();

      expect(sdk.isActive()).toBe(true);

      sdk.stopWalkthrough();

      expect(sdk.isActive()).toBe(false);
      
      const container = document.querySelector('#nextstep-walkthrough');
      expect(container).toBeNull();
    });

    it('should handle stop when no walkthrough is active', () => {
      expect(() => sdk.stopWalkthrough()).not.toThrow();
    });
  });

  describe('isActive', () => {
    it('should return false initially', () => {
      expect(sdk.isActive()).toBe(false);
    });

    it('should return true when walkthrough is active', async () => {
      await sdk.startWalkthrough(config);
      jest.runAllTimers();

      expect(sdk.isActive()).toBe(true);
    });

    it('should return false after stopping', async () => {
      await sdk.startWalkthrough(config);
      jest.runAllTimers();
      sdk.stopWalkthrough();

      expect(sdk.isActive()).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      config.onComplete = onComplete;

      await sdk.startWalkthrough(config);
      jest.runAllTimers();

      // Click finish button
      const container = document.querySelector('#nextstep-walkthrough');
      const shadowRoot = container?.shadowRoot;
      const nextBtn = shadowRoot?.querySelector('.nextstep-button-next') as HTMLButtonElement;
      nextBtn?.click();
      jest.runAllTimers();

      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onSkip callback', async () => {
      const onSkip = jest.fn();
      config.onSkip = onSkip;

      await sdk.startWalkthrough(config);
      jest.runAllTimers();

      const container = document.querySelector('#nextstep-walkthrough');
      const shadowRoot = container?.shadowRoot;
      const skipBtn = shadowRoot?.querySelector('.nextstep-button-skip') as HTMLButtonElement;
      skipBtn?.click();
      jest.runAllTimers();

      expect(onSkip).toHaveBeenCalled();
    });
  });
});

