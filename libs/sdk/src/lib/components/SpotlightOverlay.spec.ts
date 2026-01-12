/**
 * Unit tests for SpotlightOverlay component
 */

import { SpotlightOverlay } from './SpotlightOverlay';

describe('SpotlightOverlay', () => {
  let shadowRoot: ShadowRoot;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    shadowRoot = container.attachShadow({ mode: 'open' });
  });

  afterEach(() => {
    container.remove();
  });

  it('should create overlay and spotlight elements', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    const overlay = shadowRoot.querySelector('.nextstep-overlay');
    const spotlightEl = shadowRoot.querySelector('.nextstep-spotlight');

    expect(overlay).toBeTruthy();
    expect(spotlightEl).toBeTruthy();
  });

  it('should mount overlay to shadow root', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    expect(shadowRoot.children.length).toBeGreaterThan(0);
  });

  it('should unmount overlay from shadow root', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    const initialChildren = shadowRoot.children.length;
    spotlight.unmount();

    expect(shadowRoot.children.length).toBeLessThan(initialChildren);
  });

  it('should set target element and update spotlight', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    const targetElement = document.createElement('div');
    document.body.appendChild(targetElement);

    jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 200,
      height: 100,
      bottom: 200,
      right: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    spotlight.setTarget(targetElement);

    expect(spotlight.getTarget()).toBe(targetElement);

    targetElement.remove();
  });

  it('should hide spotlight when target is null', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    spotlight.setTarget(null);

    const spotlightEl = shadowRoot.querySelector(
      '.nextstep-spotlight'
    ) as HTMLElement;
    expect(spotlightEl?.style.display).toBe('none');
  });

  it('should cleanup event listeners on unmount', () => {
    const spotlight = new SpotlightOverlay(shadowRoot);
    spotlight.mount();

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    spotlight.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      true
    );

    removeEventListenerSpy.mockRestore();
  });
});
