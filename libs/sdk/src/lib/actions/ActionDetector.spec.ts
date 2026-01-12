/**
 * Unit tests for ActionDetector
 */

import { ActionDetector } from './ActionDetector';
import { ScriptStep } from '../types';

describe('ActionDetector', () => {
  let detector: ActionDetector;
  let mockStep: ScriptStep;
  let onComplete: jest.Mock;

  beforeEach(() => {
    detector = new ActionDetector();
    onComplete = jest.fn();
    
    // Clear DOM
    document.body.innerHTML = '';

    // Create a test element
    const testElement = document.createElement('button');
    testElement.id = 'test-button';
    testElement.textContent = 'Click Me';
    document.body.appendChild(testElement);

    mockStep = {
      id: 'step-1',
      scriptId: 'script-1',
      orderIndex: 0,
      title: 'Test Step',
      description: 'Test description',
      elementSelector: '#test-button',
      autoProgress: true,
      autoProgressAction: 'click',
    };
  });

  afterEach(() => {
    detector.detach();
  });

  describe('Click Action Detection', () => {
    it('should detect click on target element', async () => {
      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      const button = document.getElementById('test-button');
      button?.click();

      // Wait for the auto-advance delay (300ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('should add success class to element on click', async () => {
      detector.attach(mockStep, () => {});

      const button = document.getElementById('test-button');
      button?.click();

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(button?.classList.contains('nextstep-action-success')).toBe(true);
    });

    it('should not trigger when autoProgress is false', async () => {
      mockStep.autoProgress = false;
      detector.attach(mockStep, onComplete);

      const button = document.getElementById('test-button');
      button?.click();

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should clean up listeners on detach', async () => {
      detector.attach(mockStep, onComplete);
      detector.detach();

      const button = document.getElementById('test-button');
      button?.click();

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Input Action Detection', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const input = document.createElement('input');
      input.id = 'test-input';
      input.type = 'text';
      document.body.appendChild(input);

      mockStep.elementSelector = '#test-input';
      mockStep.autoProgressAction = 'input';
    });

    it('should detect input value change', async () => {
      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      const input = document.getElementById('test-input') as HTMLInputElement;
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));

      // Wait for the auto-advance delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('should not trigger on empty input', async () => {
      detector.attach(mockStep, onComplete);

      const input = document.getElementById('test-input') as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('input'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should validate input with custom validator', async () => {
      mockStep.autoProgressValidator = 'return value.length > 5;';
      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      const input = document.getElementById('test-input') as HTMLInputElement;
      
      // Should not trigger with short input
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).not.toHaveBeenCalled();

      // Should trigger with longer input
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });
  });

  describe('Submit Action Detection', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const form = document.createElement('form');
      form.id = 'test-form';
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'test';
      form.appendChild(input);
      const button = document.createElement('button');
      button.type = 'submit';
      form.appendChild(button);
      document.body.appendChild(form);

      mockStep.elementSelector = '#test-form';
      mockStep.autoProgressAction = 'submit';
    });

    it('should detect form submission', async () => {
      mockStep.config = { preventSubmit: true };
      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      const form = document.getElementById('test-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('should prevent submission when configured', () => {
      mockStep.config = { preventSubmit: true };
      detector.attach(mockStep, onComplete);

      const form = document.getElementById('test-form') as HTMLFormElement;
      const submitEvent = new Event('submit', { cancelable: true });
      
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Custom Action Detection', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const customElement = document.createElement('div');
      customElement.id = 'custom-element';
      document.body.appendChild(customElement);

      mockStep.elementSelector = '#custom-element';
      mockStep.autoProgressAction = 'custom';
      mockStep.config = { customEvent: 'myCustomEvent' };
    });

    it('should detect custom event', async () => {
      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      const element = document.getElementById('custom-element');
      element?.dispatchEvent(new Event('myCustomEvent'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing element gracefully', () => {
      mockStep.elementSelector = '#nonexistent';
      
      // Should not throw
      expect(() => {
        detector.attach(mockStep, onComplete);
      }).not.toThrow();
    });

    it('should handle missing selector gracefully', () => {
      mockStep.elementSelector = undefined;
      
      // Should not throw
      expect(() => {
        detector.attach(mockStep, onComplete);
      }).not.toThrow();
    });

    it('should handle invalid validator gracefully', async () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);

      mockStep.elementSelector = '#test-input';
      mockStep.autoProgressAction = 'input';
      mockStep.autoProgressValidator = 'invalid javascript code {{{';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      detector.attach(mockStep, onComplete);

      const inputElement = document.getElementById('test-input') as HTMLInputElement;
      inputElement.value = 'test';
      inputElement.dispatchEvent(new Event('input'));

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error in autoProgressValidator:',
        expect.any(Error)
      );
      expect(onComplete).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Custom Selector', () => {
    it('should use custom selector when provided', async () => {
      const customButton = document.createElement('button');
      customButton.id = 'custom-button';
      document.body.appendChild(customButton);

      mockStep.elementSelector = '#test-button';
      mockStep.autoProgressSelector = '#custom-button';

      const onCompleteMock = jest.fn();
      
      detector.attach(mockStep, onCompleteMock);

      customButton.click();

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(onCompleteMock).toHaveBeenCalled();
    });
  });
});
