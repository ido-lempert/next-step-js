import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewPaneComponent } from './preview-pane.component';
import { PreviewBridgeService } from '../../services/preview-bridge.service';
import { Script } from '../../models/script.model';
import { signal } from '@angular/core';

describe('PreviewPaneComponent', () => {
  let component: PreviewPaneComponent;
  let fixture: ComponentFixture<PreviewPaneComponent>;
  let mockPreviewBridge: jest.Mocked<PreviewBridgeService>;

  const mockScript: Script = {
    id: 'script-1',
    productId: 'product-1',
    name: 'Test Script',
    type: 'walkthrough',
    status: 'draft',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    steps: [],
  };

  beforeEach(async () => {
    mockPreviewBridge = {
      extensionDetected: signal(false),
      currentStep: signal(null),
      previewError: signal(null),
      detectExtension: jest.fn().mockResolvedValue(false),
      setIframe: jest.fn(),
      loadScript: jest.fn(),
      playScript: jest.fn(),
      stopScript: jest.fn(),
      reloadPreview: jest.fn(),
      startListening: jest.fn(),
      stopListening: jest.fn(),
      clearState: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [PreviewPaneComponent],
      providers: [{ provide: PreviewBridgeService, useValue: mockPreviewBridge }],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewPaneComponent);
    component = fixture.componentInstance;
    component.script = mockScript;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect extension on init', () => {
    expect(mockPreviewBridge.detectExtension).toHaveBeenCalled();
  });

  it('should start listening for messages on init', () => {
    expect(mockPreviewBridge.startListening).toHaveBeenCalled();
  });

  it('should stop listening on destroy', () => {
    component.ngOnDestroy();
    expect(mockPreviewBridge.stopListening).toHaveBeenCalled();
  });

  it('should clear state on destroy', () => {
    component.ngOnDestroy();
    expect(mockPreviewBridge.clearState).toHaveBeenCalled();
  });

  it('should play script when playScript is called', () => {
    component.playScript();
    expect(mockPreviewBridge.playScript).toHaveBeenCalled();
  });

  it('should stop script when stopScript is called', () => {
    component.stopScript();
    expect(mockPreviewBridge.stopScript).toHaveBeenCalled();
  });

  it('should reload preview when reloadPreview is called', () => {
    component.reloadPreview();
    expect(mockPreviewBridge.reloadPreview).toHaveBeenCalled();
  });

  it('should toggle fullscreen', () => {
    expect(component.isFullscreen()).toBe(false);
    component.toggleFullscreen();
    expect(component.isFullscreen()).toBe(true);
    component.toggleFullscreen();
    expect(component.isFullscreen()).toBe(false);
  });

  it('should clear state when URL changes', () => {
    component.loadUrl();
    expect(mockPreviewBridge.clearState).toHaveBeenCalled();
  });
});
