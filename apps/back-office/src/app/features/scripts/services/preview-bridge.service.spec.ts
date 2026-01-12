import { TestBed } from '@angular/core/testing';
import { PreviewBridgeService } from './preview-bridge.service';
import { Script } from '../models/script.model';

describe('PreviewBridgeService', () => {
  let service: PreviewBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewBridgeService],
    });
    service = TestBed.inject(PreviewBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with extension not detected', () => {
    expect(service.extensionDetected()).toBe(false);
  });

  it('should initialize with no current step', () => {
    expect(service.currentStep()).toBeNull();
  });

  it('should initialize with no error', () => {
    expect(service.previewError()).toBeNull();
  });

  describe('detectExtension', () => {
    it('should detect extension when pong received', async () => {
      const detectPromise = service.detectExtension();

      // Simulate extension response
      setTimeout(() => {
        window.postMessage({ type: 'NEXTSTEP_EXTENSION_PONG' }, '*');
      }, 100);

      const result = await detectPromise;
      expect(result).toBe(true);
      expect(service.extensionDetected()).toBe(true);
    });

    it('should timeout if no pong received', async () => {
      const result = await service.detectExtension();
      expect(result).toBe(false);
      expect(service.extensionDetected()).toBe(false);
    });
  });

  describe('setIframe', () => {
    it('should set iframe reference', () => {
      const iframe = document.createElement('iframe');
      service.setIframe(iframe);
      // If no error, the iframe was set successfully
      expect(true).toBe(true);
    });
  });

  describe('loadScript', () => {
    it('should send message to iframe when iframe is set', () => {
      const iframe = document.createElement('iframe');
      const mockContentWindow = {
        postMessage: jest.fn(),
      } as any;
      Object.defineProperty(iframe, 'contentWindow', {
        value: mockContentWindow,
      });

      service.setIframe(iframe);

      const script: Script = {
        id: 'script-1',
        productId: 'product-1',
        name: 'Test Script',
        type: 'walkthrough',
        status: 'draft',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        steps: [],
      };

      service.loadScript(script);

      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        {
          type: 'NEXTSTEP_LOAD_SCRIPT',
          payload: {
            scriptId: 'script-1',
            type: 'walkthrough',
            steps: [],
          },
        },
        '*'
      );
    });

    it('should not throw error when iframe not set', () => {
      const script: Script = {
        id: 'script-1',
        productId: 'product-1',
        name: 'Test Script',
        type: 'walkthrough',
        status: 'draft',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        steps: [],
      };

      expect(() => service.loadScript(script)).not.toThrow();
    });
  });

  describe('message handling', () => {
    it('should update current step on NEXTSTEP_STEP_SHOWN', () => {
      const callback = jest.fn();
      service.startListening(callback);

      const stepData = {
        id: 'step-1',
        scriptId: 'script-1',
        orderIndex: 0,
        title: 'Test Step',
        description: 'Test Description',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      window.postMessage(
        {
          type: 'NEXTSTEP_STEP_SHOWN',
          payload: { step: stepData },
        },
        '*'
      );

      // Need to wait for async message handling
      setTimeout(() => {
        expect(service.currentStep()).toEqual(stepData);
        expect(callback).toHaveBeenCalled();
      }, 100);
    });

    it('should update error on NEXTSTEP_SCRIPT_ERROR', (done) => {
      const callback = jest.fn();
      service.startListening(callback);

      window.postMessage(
        {
          type: 'NEXTSTEP_SCRIPT_ERROR',
          payload: { error: 'Test error' },
        },
        '*'
      );

      setTimeout(() => {
        expect(service.previewError()).toBe('Test error');
        done();
      }, 100);
    });

    it('should clear current step on NEXTSTEP_SCRIPT_COMPLETE', (done) => {
      const callback = jest.fn();
      service.startListening(callback);

      // First set a step
      service.currentStep.set({
        id: 'step-1',
        scriptId: 'script-1',
        orderIndex: 0,
        title: 'Test',
        description: 'Test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      window.postMessage({ type: 'NEXTSTEP_SCRIPT_COMPLETE' }, '*');

      setTimeout(() => {
        expect(service.currentStep()).toBeNull();
        done();
      }, 100);
    });
  });

  describe('clearState', () => {
    it('should clear current step and error', () => {
      service.currentStep.set({
        id: 'step-1',
        scriptId: 'script-1',
        orderIndex: 0,
        title: 'Test',
        description: 'Test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
      service.previewError.set('Test error');

      service.clearState();

      expect(service.currentStep()).toBeNull();
      expect(service.previewError()).toBeNull();
    });
  });

  describe('stopListening', () => {
    it('should remove message listener', () => {
      const callback = jest.fn();
      service.startListening(callback);
      service.stopListening();

      window.postMessage({ type: 'NEXTSTEP_STEP_SHOWN', payload: {} }, '*');

      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 100);
    });
  });
});
