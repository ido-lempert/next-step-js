import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtensionPromptComponent } from './extension-prompt.component';
import { PreviewBridgeService } from '../../services/preview-bridge.service';

describe('ExtensionPromptComponent', () => {
  let component: ExtensionPromptComponent;
  let fixture: ComponentFixture<ExtensionPromptComponent>;
  let mockPreviewBridge: jest.Mocked<PreviewBridgeService>;

  beforeEach(async () => {
    mockPreviewBridge = {
      detectExtension: jest.fn().mockResolvedValue(false),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ExtensionPromptComponent],
      providers: [{ provide: PreviewBridgeService, useValue: mockPreviewBridge }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtensionPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call detectExtension when checkAgain is clicked', async () => {
    await component.checkAgain();
    expect(mockPreviewBridge.detectExtension).toHaveBeenCalled();
  });

  it('should display warning icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.warning-icon');
    expect(icon).toBeTruthy();
  });

  it('should display installation instructions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent;
    expect(content).toContain('Chrome Extension Required');
    expect(content).toContain('Install the Chrome Extension');
  });
});
