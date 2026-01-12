import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectFormComponent } from './project-form.component';
import { ProjectService } from '../../services/project.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Project } from '../../models/project.model';
import { vi } from 'vitest';

describe('ProjectFormComponent', () => {
  let component: ProjectFormComponent;
  let fixture: ComponentFixture<ProjectFormComponent>;
  let projectService: ProjectService;
  let router: Router;

  const mockProject: Project = {
    id: '1',
    tenant_id: 'tenant-1',
    name: 'Test Project',
    description: 'Test Description',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        ProjectService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFormComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.projectForm.value).toEqual({
      name: '',
      description: '',
    });
  });

  it('should validate required name field', () => {
    const nameControl = component.nameControl;
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('Test Project');
    expect(nameControl?.valid).toBe(true);
  });

  it('should validate name max length', () => {
    const nameControl = component.nameControl;
    const longName = 'a'.repeat(256);

    nameControl?.setValue(longName);
    expect(nameControl?.hasError('maxlength')).toBe(true);

    nameControl?.setValue('Valid Name');
    expect(nameControl?.hasError('maxlength')).toBe(false);
  });

  it('should create project on submit in create mode', () => {
    vi.spyOn(projectService, 'createProject').mockReturnValue(of(mockProject));
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.projectForm.setValue({
      name: 'New Project',
      description: 'New Description',
    });

    component.onSubmit();

    expect(projectService.createProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'New Description',
    });
  });

  it('should update project on submit in edit mode', () => {
    component.isEditMode.set(true);
    component.projectId.set('1');

    vi.spyOn(projectService, 'updateProject').mockReturnValue(of(mockProject));
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.projectForm.setValue({
      name: 'Updated Project',
      description: 'Updated Description',
    });

    component.onSubmit();

    expect(projectService.updateProject).toHaveBeenCalledWith('1', {
      name: 'Updated Project',
      description: 'Updated Description',
    });
  });

  it('should not submit if form is invalid', () => {
    vi.spyOn(projectService, 'createProject');

    component.projectForm.setValue({
      name: '',
      description: '',
    });

    component.onSubmit();

    expect(projectService.createProject).not.toHaveBeenCalled();
  });

  it('should handle submit error', () => {
    vi.spyOn(projectService, 'createProject').mockReturnValue(
      throwError(() => ({ error: { error: 'Test error' } }))
    );

    component.projectForm.setValue({
      name: 'Test Project',
      description: '',
    });

    component.onSubmit();

    expect(component.submitError()).toBe('Test error');
    expect(component.submitting()).toBe(false);
  });

  it('should navigate to projects list on cancel', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should load project in edit mode', () => {
    component.isEditMode.set(true);
    component.projectId.set('1');

    vi.spyOn(projectService, 'getProject').mockReturnValue(of(mockProject));

    component.loadProject('1');

    expect(projectService.getProject).toHaveBeenCalledWith('1');
    expect(component.projectForm.value.name).toBe('Test Project');
    expect(component.projectForm.value.description).toBe('Test Description');
  });
});
