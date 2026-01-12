/**
 * Tests for ActionDetector
 */

import { ActionDetector } from './action-detector';
import { StepConfig } from './types';

describe('ActionDetector', () => {
  let detector: ActionDetector;

  beforeEach(() => {
    detector = new ActionDetector();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    detector.detach();
    jest.useRealTimers();
  });

  describe('click action detection', () => {
    it('should detect click on target element', () => {
      const button = document.createElement('button');
      button.id = 'test-button';
      document.body.appendChild(button);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Click the button',
        order_index: 0,
        autoProgress: true,
        actionType: 'click',
      };

      detector.attach(step, button, onComplete);

      // Click the button
      button.click();

      // Should not call immediately (has delay)
      expect(onComplete).not.toHaveBeenCalled();

      // Advance timers past the delay
      jest.advanceTimersByTime(300);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not trigger without autoProgress enabled', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Click the button',
        order_index: 0,
        autoProgress: false,
        actionType: 'click',
      };

      detector.attach(step, button, onComplete);
      button.click();
      jest.advanceTimersByTime(300);

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('input action detection', () => {
    it('should detect input in text field', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Enter text',
        order_index: 0,
        autoProgress: true,
        actionType: 'input',
      };

      detector.attach(step, input, onComplete);

      // Type into input
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));

      expect(onComplete).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not trigger for empty input', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Enter text',
        order_index: 0,
        autoProgress: true,
        actionType: 'input',
      };

      detector.attach(step, input, onComplete);

      input.value = '';
      input.dispatchEvent(new Event('input'));

      jest.advanceTimersByTime(500);

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should detect select change', () => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      option.value = 'test';
      select.appendChild(option);
      document.body.appendChild(select);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Select option',
        order_index: 0,
        autoProgress: true,
        actionType: 'input',
      };

      detector.attach(step, select, onComplete);

      select.value = 'test';
      select.dispatchEvent(new Event('change'));

      jest.advanceTimersByTime(500);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('submit action detection', () => {
    it('should detect form submission', () => {
      const form = document.createElement('form');
      const button = document.createElement('button');
      button.type = 'submit';
      form.appendChild(button);
      document.body.appendChild(form);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Submit form',
        order_index: 0,
        autoProgress: true,
        actionType: 'submit',
      };

      detector.attach(step, form, onComplete);

      // Prevent actual submission
      form.addEventListener('submit', (e) => e.preventDefault());
      
      form.dispatchEvent(new Event('submit'));

      jest.advanceTimersByTime(300);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should find parent form when target is inside form', () => {
      const form = document.createElement('form');
      const input = document.createElement('input');
      form.appendChild(input);
      document.body.appendChild(form);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Submit form',
        order_index: 0,
        autoProgress: true,
        actionType: 'submit',
      };

      detector.attach(step, input, onComplete);

      form.addEventListener('submit', (e) => e.preventDefault());
      form.dispatchEvent(new Event('submit'));

      jest.advanceTimersByTime(300);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners when detached', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Click the button',
        order_index: 0,
        autoProgress: true,
        actionType: 'click',
      };

      detector.attach(step, button, onComplete);
      detector.detach();

      button.click();
      jest.advanceTimersByTime(300);

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should handle multiple attach/detach cycles', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const onComplete1 = jest.fn();
      const onComplete2 = jest.fn();
      
      const step: StepConfig = {
        id: 'step-1',
        title: 'Click the button',
        order_index: 0,
        autoProgress: true,
        actionType: 'click',
      };

      // First attach
      detector.attach(step, button, onComplete1);
      detector.detach();

      // Second attach
      detector.attach(step, button, onComplete2);
      button.click();
      jest.advanceTimersByTime(300);

      expect(onComplete1).not.toHaveBeenCalled();
      expect(onComplete2).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom action selector', () => {
    it('should use actionSelector instead of target element', () => {
      const targetElement = document.createElement('div');
      const actionButton = document.createElement('button');
      actionButton.id = 'action-button';
      
      document.body.appendChild(targetElement);
      document.body.appendChild(actionButton);

      const onComplete = jest.fn();
      const step: StepConfig = {
        id: 'step-1',
        title: 'Click the action button',
        order_index: 0,
        autoProgress: true,
        actionType: 'click',
        actionSelector: '#action-button',
      };

      detector.attach(step, targetElement, onComplete);

      // Click the action button (not the target element)
      actionButton.click();
      jest.advanceTimersByTime(300);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
