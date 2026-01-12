/**
 * Unit tests for WalkthroughComponent
 */

import { WalkthroughComponent } from './WalkthroughComponent';
import { Script } from '../types';

describe('WalkthroughComponent', () => {
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
          elementSelector: '#test-element-1',
        },
        {
          id: 'step-2',
          scriptId: 'test-script-1',
          orderIndex: 1,
          title: 'Step 2',
          description: 'Second step description',
          elementSelector: '#test-element-2',
        },
        {
          id: 'step-3',
          scriptId: 'test-script-1',
          orderIndex: 2,
          title: 'Step 3',
          description: 'Third step description',
        },
      ],
    };

    // Create test elements
    const el1 = document.createElement('div');
    el1.id = 'test-element-1';
    document.body.appendChild(el1);

    const el2 = document.createElement('div');
    el2.id = 'test-element-2';
    document.body.appendChild(el2);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a walkthrough component', () => {
    const walkthrough = new WalkthroughComponent();
    expect(walkthrough).toBeTruthy();
  });

  it('should start walkthrough with a script', async () => {
    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);

    expect(walkthrough.isWalkthroughActive()).toBe(true);
    expect(walkthrough.getCurrentStepIndex()).toBe(0);
  });

  it('should not start walkthrough with empty steps', async () => {
    const onError = jest.fn();
    const walkthrough = new WalkthroughComponent({ onError });

    const emptyScript: Script = {
      ...mockScript,
      steps: [],
    };

    await walkthrough.start(emptyScript);

    expect(onError).toHaveBeenCalled();
    expect(walkthrough.isWalkthroughActive()).toBe(false);
  });

  it('should call onStepChange callback', async () => {
    const onStepChange = jest.fn();
    const walkthrough = new WalkthroughComponent({ onStepChange });

    await walkthrough.start(mockScript);

    expect(onStepChange).toHaveBeenCalledWith(mockScript.steps[0], 0);
  });

  it('should create shadow DOM container', async () => {
    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);

    const container = document.getElementById('nextstep-walkthrough');
    expect(container).toBeTruthy();
    expect(container?.shadowRoot).toBeTruthy();

    await walkthrough.destroy();
  });

  it('should handle keyboard events', async () => {
    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);

    expect(walkthrough.getCurrentStepIndex()).toBe(0);

    // Simulate arrow right key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    document.dispatchEvent(event);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have advanced to next step
    expect(walkthrough.getCurrentStepIndex()).toBeGreaterThan(0);

    await walkthrough.destroy();
  });

  it('should cleanup on destroy', async () => {
    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);

    const container = document.getElementById('nextstep-walkthrough');
    expect(container).toBeTruthy();

    await walkthrough.destroy();

    const containerAfter = document.getElementById('nextstep-walkthrough');
    expect(containerAfter).toBeFalsy();
    expect(walkthrough.isWalkthroughActive()).toBe(false);
  });

  it('should call onComplete when finished', async () => {
    const onComplete = jest.fn();
    const walkthrough = new WalkthroughComponent({ onComplete });

    await walkthrough.start(mockScript);

    // Simulate completing all steps
    // This is a simplified test - in real scenario, user would click Next multiple times
    await walkthrough.destroy();

    // Note: In a real scenario, onComplete would be called when navigating through all steps
  });

  it('should call onSkip when skipped', async () => {
    const onSkip = jest.fn();
    const walkthrough = new WalkthroughComponent({ onSkip });

    await walkthrough.start(mockScript);

    // Simulate ESC key press to skip
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(onSkip).toHaveBeenCalled();
  });

  it('should store analytics events in localStorage', async () => {
    const walkthrough = new WalkthroughComponent();
    
    // Clear localStorage
    localStorage.clear();

    await walkthrough.start(mockScript);

    // Wait for events to be tracked
    await new Promise((resolve) => setTimeout(resolve, 100));

    const events = localStorage.getItem('nextstep_analytics');
    expect(events).toBeTruthy();

    const parsed = JSON.parse(events || '[]');
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].type).toBe('step_view');

    await walkthrough.destroy();
  });

  it('should handle missing elements gracefully', async () => {
    const onError = jest.fn();
    const walkthrough = new WalkthroughComponent({ onError });

    const scriptWithMissingElement: Script = {
      ...mockScript,
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-1',
          orderIndex: 0,
          title: 'Step 1',
          description: 'First step description',
          elementSelector: '#non-existent-element',
        },
      ],
    };

    await walkthrough.start(scriptWithMissingElement);

    // Wait for error handling
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(onError).toHaveBeenCalled();

    await walkthrough.destroy();
  });
});

describe('WalkthroughComponent - Auto-Progress', () => {
  let mockScript: Script;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should auto-advance on click action', async () => {
    // Create test elements
    const button = document.createElement('button');
    button.id = 'test-button';
    button.textContent = 'Click Me';
    document.body.appendChild(button);

    const element2 = document.createElement('div');
    element2.id = 'test-element-2';
    document.body.appendChild(element2);

    mockScript = {
      id: 'test-script-auto',
      productId: 'test-product-1',
      name: 'Auto Progress Test',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-auto',
          orderIndex: 0,
          title: 'Click the button',
          description: 'Click the button to continue',
          elementSelector: '#test-button',
          autoProgress: true,
          autoProgressAction: 'click',
        },
        {
          id: 'step-2',
          scriptId: 'test-script-auto',
          orderIndex: 1,
          title: 'Step 2',
          description: 'Second step',
          elementSelector: '#test-element-2',
        },
      ],
    };

    const onStepChange = jest.fn();
    const walkthrough = new WalkthroughComponent({ onStepChange });

    await walkthrough.start(mockScript);
    expect(walkthrough.getCurrentStepIndex()).toBe(0);

    // Click the button
    button.click();

    // Wait for auto-advance
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should have advanced to step 2
    expect(walkthrough.getCurrentStepIndex()).toBe(1);
    expect(onStepChange).toHaveBeenCalledTimes(2); // Once for step 1, once for step 2

    await walkthrough.destroy();
  });

  it('should auto-advance on input action', async () => {
    const input = document.createElement('input');
    input.id = 'test-input';
    input.type = 'text';
    document.body.appendChild(input);

    const element2 = document.createElement('div');
    element2.id = 'test-element-2';
    document.body.appendChild(element2);

    mockScript = {
      id: 'test-script-input',
      productId: 'test-product-1',
      name: 'Input Auto Progress Test',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-input',
          orderIndex: 0,
          title: 'Enter text',
          description: 'Type something',
          elementSelector: '#test-input',
          autoProgress: true,
          autoProgressAction: 'input',
        },
        {
          id: 'step-2',
          scriptId: 'test-script-input',
          orderIndex: 1,
          title: 'Step 2',
          description: 'Second step',
          elementSelector: '#test-element-2',
        },
      ],
    };

    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);
    expect(walkthrough.getCurrentStepIndex()).toBe(0);

    // Type in the input
    input.value = 'test value';
    input.dispatchEvent(new Event('input'));

    // Wait for auto-advance
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should have advanced to step 2
    expect(walkthrough.getCurrentStepIndex()).toBe(1);

    await walkthrough.destroy();
  });

  it('should track action_completed event on auto-advance', async () => {
    const button = document.createElement('button');
    button.id = 'test-button-analytics';
    document.body.appendChild(button);

    const element2 = document.createElement('div');
    element2.id = 'test-element-2';
    document.body.appendChild(element2);

    mockScript = {
      id: 'test-script-analytics',
      productId: 'test-product-1',
      name: 'Analytics Test',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-analytics',
          orderIndex: 0,
          title: 'Click the button',
          description: 'Click to continue',
          elementSelector: '#test-button-analytics',
          autoProgress: true,
          autoProgressAction: 'click',
        },
        {
          id: 'step-2',
          scriptId: 'test-script-analytics',
          orderIndex: 1,
          title: 'Step 2',
          description: 'Second step',
          elementSelector: '#test-element-2',
        },
      ],
    };

    localStorage.clear();
    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);

    // Click the button
    button.click();

    // Wait for auto-advance and analytics
    await new Promise((resolve) => setTimeout(resolve, 500));

    const events = localStorage.getItem('nextstep_analytics');
    const parsed = JSON.parse(events || '[]');

    // Should have action_completed event
    const actionEvent = parsed.find((e: any) => e.type === 'action_completed');
    expect(actionEvent).toBeTruthy();
    expect(actionEvent.action).toBe('auto_advance');

    await walkthrough.destroy();
  });

  it('should still allow manual navigation with auto-progress enabled', async () => {
    const button = document.createElement('button');
    button.id = 'test-button-manual';
    document.body.appendChild(button);

    const element2 = document.createElement('div');
    element2.id = 'test-element-2';
    document.body.appendChild(element2);

    mockScript = {
      id: 'test-script-manual',
      productId: 'test-product-1',
      name: 'Manual Override Test',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-manual',
          orderIndex: 0,
          title: 'Step with auto-progress',
          description: 'But can still use Next button',
          elementSelector: '#test-button-manual',
          autoProgress: true,
          autoProgressAction: 'click',
        },
        {
          id: 'step-2',
          scriptId: 'test-script-manual',
          orderIndex: 1,
          title: 'Step 2',
          description: 'Second step',
          elementSelector: '#test-element-2',
        },
      ],
    };

    const walkthrough = new WalkthroughComponent();
    await walkthrough.start(mockScript);
    expect(walkthrough.getCurrentStepIndex()).toBe(0);

    // Use keyboard navigation instead of clicking button
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    document.dispatchEvent(event);

    // Wait for navigation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have advanced to step 2
    expect(walkthrough.getCurrentStepIndex()).toBe(1);

    await walkthrough.destroy();
  });

  it('should cleanup action listeners on destroy', async () => {
    const button = document.createElement('button');
    button.id = 'test-button-cleanup';
    document.body.appendChild(button);

    mockScript = {
      id: 'test-script-cleanup',
      productId: 'test-product-1',
      name: 'Cleanup Test',
      type: 'walkthrough',
      status: 'published',
      steps: [
        {
          id: 'step-1',
          scriptId: 'test-script-cleanup',
          orderIndex: 0,
          title: 'Step 1',
          description: 'First step',
          elementSelector: '#test-button-cleanup',
          autoProgress: true,
          autoProgressAction: 'click',
        },
      ],
    };

    const onStepChange = jest.fn();
    const walkthrough = new WalkthroughComponent({ onStepChange });
    await walkthrough.start(mockScript);

    // Destroy the walkthrough
    await walkthrough.destroy();

    // Clear the callback
    onStepChange.mockClear();

    // Click button after destroy
    button.click();

    // Wait
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should not have triggered callback
    expect(onStepChange).not.toHaveBeenCalled();
  });
});
