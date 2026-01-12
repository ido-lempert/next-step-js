/**
 * Unit tests for ProgressIndicator component
 */

import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  let shadowRoot: ShadowRoot;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    shadowRoot = container.attachShadow({ mode: 'open' });
  });

  afterEach(() => {
    container.remove();
  });

  it('should create progress indicator element', () => {
    const progress = new ProgressIndicator(shadowRoot);
    const element = progress.getElement();

    expect(element).toBeTruthy();
    expect(element.className).toBe('nextstep-progress');
  });

  it('should update progress text', () => {
    const progress = new ProgressIndicator(shadowRoot);
    progress.update(2, 5);

    const element = progress.getElement();
    expect(element.textContent).toContain('Step 3 of 5');
  });

  it('should create dots for each step', () => {
    const progress = new ProgressIndicator(shadowRoot);
    progress.update(1, 5);

    const element = progress.getElement();
    const dots = element.querySelectorAll('.nextstep-progress-dot');

    expect(dots.length).toBe(5);
  });

  it('should mark completed steps', () => {
    const progress = new ProgressIndicator(shadowRoot);
    progress.update(2, 5);

    const element = progress.getElement();
    const completedDots = element.querySelectorAll(
      '.nextstep-progress-dot.completed'
    );

    expect(completedDots.length).toBe(2); // Steps 0 and 1 are completed
  });

  it('should mark current step', () => {
    const progress = new ProgressIndicator(shadowRoot);
    progress.update(2, 5);

    const element = progress.getElement();
    const currentDot = element.querySelector('.nextstep-progress-dot.current');

    expect(currentDot).toBeTruthy();
  });

  it('should update dots when progress changes', () => {
    const progress = new ProgressIndicator(shadowRoot);
    const element = progress.getElement();

    progress.update(0, 3);
    let dots = element.querySelectorAll('.nextstep-progress-dot');
    expect(dots.length).toBe(3);

    progress.update(1, 3);
    dots = element.querySelectorAll('.nextstep-progress-dot');
    expect(dots.length).toBe(3);

    const completedDots = element.querySelectorAll(
      '.nextstep-progress-dot.completed'
    );
    expect(completedDots.length).toBe(1);
  });
});
