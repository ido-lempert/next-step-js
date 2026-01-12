/**
 * Tests for WalkthroughComponent
 */

import { WalkthroughComponent } from './walkthrough-component';
import { WalkthroughConfig } from './types';

describe('WalkthroughComponent', () => {
  let config: WalkthroughConfig;

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
    
    // Mock window.scrollTo since jsdom doesn't implement it
    window.scrollTo = jest.fn();

    // Setup basic config
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
        {
          id: 'step-2',
          title: 'Step 2',
          description: 'Second step',
          order_index: 1,
        },
        {
          id: 'step-3',
          title: 'Step 3',
          description: 'Third step',
          order_index: 2,
        },
      ],
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create walkthrough component', () => {
      const walkthrough = new WalkthroughComponent(config);
      expect(walkthrough).toBeDefined();
    });

    it('should create shadow DOM container', () => {
      const walkthrough = new WalkthroughComponent(config);
      const container = document.querySelector('#nextstep-walkthrough');
      expect(container).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should cleanup DOM when destroyed', () => {
      const walkthrough = new WalkthroughComponent(config);
      
      // Start is needed to append container to DOM
      document.body.appendChild((walkthrough as any).container);
      
      let container = document.querySelector('#nextstep-walkthrough');
      expect(container).toBeTruthy();

      walkthrough.destroy();

      container = document.querySelector('#nextstep-walkthrough');
      expect(container).toBeNull();
    });
  });
});
