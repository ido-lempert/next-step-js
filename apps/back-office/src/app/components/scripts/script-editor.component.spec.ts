import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ScriptEditorComponent } from './script-editor.component';

describe('ScriptEditorComponent', () => {
  let component: ScriptEditorComponent;
  let fixture: ComponentFixture<ScriptEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptEditorComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScriptEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty editing states', () => {
    expect(component.editingScriptName()).toBe(false);
    expect(component.showStepDialog()).toBe(false);
    expect(component.editingStep()).toBe(null);
  });

  it('should show step dialog when onShowAddStep is called', () => {
    expect(component.showStepDialog()).toBe(false);
    component.onShowAddStep();
    expect(component.showStepDialog()).toBe(true);
    expect(component.editingStep()).toBe(null);
  });

  it('should toggle step expansion', () => {
    const stepId = 'step-1';
    expect(component.isStepExpanded(stepId)).toBe(false);
    
    component.toggleStepExpanded(stepId);
    expect(component.isStepExpanded(stepId)).toBe(true);
    
    component.toggleStepExpanded(stepId);
    expect(component.isStepExpanded(stepId)).toBe(false);
  });
});
