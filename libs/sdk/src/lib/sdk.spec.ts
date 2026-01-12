/**
 * Unit tests for SDK entry point
 */

import { startWalkthrough, createWalkthrough } from './sdk';
import { Script } from './types';

describe('sdk', () => {
  let mockScript: Script;

  beforeEach(() => {
    document.body.innerHTML = '';

    mockScript = {
      id: 'test-script-1',
      productId: 'test-product-1',
      name: 'Test Script',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-1',
          orderIndex: 0,
          title: 'Step 1',
          description: 'First step description',
        },
      ],
    };
  });

  describe('createWalkthrough', () => {
    it('should create a walkthrough component', () => {
      const walkthrough = createWalkthrough();
      expect(walkthrough).toBeTruthy();
      expect(walkthrough.isWalkthroughActive()).toBe(false);
    });

    it('should create walkthrough with config', () => {
      const config = {
        backdropOpacity: 0.5,
        spotlightPadding: 12,
      };

      const walkthrough = createWalkthrough(config);
      expect(walkthrough).toBeTruthy();
    });
  });

  describe('startWalkthrough', () => {
    it('should start a walkthrough', async () => {
      const walkthrough = await startWalkthrough(mockScript);

      expect(walkthrough).toBeTruthy();
      expect(walkthrough.isWalkthroughActive()).toBe(true);

      await walkthrough.destroy();
    });

    it('should start walkthrough with config', async () => {
      const onStepChange = jest.fn();
      const config = {
        backdropOpacity: 0.8,
        onStepChange,
      };

      const walkthrough = await startWalkthrough(mockScript, config);

      expect(walkthrough.isWalkthroughActive()).toBe(true);
      expect(onStepChange).toHaveBeenCalled();

      await walkthrough.destroy();
    });
  });
});

