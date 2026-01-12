import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectListComponent } from './project-list.component';
import { ProjectService } from '../../services/project.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Project } from '../../models/project.model';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let projectService: ProjectService;

  const mockProjects: Project[] = [
    {
      id: '1',
      tenant_id: 'tenant-1',
      name: 'Project 1',
      description: 'Description 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      tenant_id: 'tenant-1',
      name: 'Project 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        ProjectService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    vi.spyOn(projectService, 'loadProjects').mockReturnValue(of(mockProjects));

    component.ngOnInit();

    expect(projectService.loadProjects).toHaveBeenCalled();
  });

  it('should show delete dialog when onDelete is called', () => {
    const project = mockProjects[0];

    component.onDelete(project);

    expect(component.showDeleteDialog()).toBe(true);
    expect(component.projectToDelete()).toEqual(project);
  });

  it('should cancel delete dialog', () => {
    component.projectToDelete.set(mockProjects[0]);
    component.showDeleteDialog.set(true);

    component.cancelDelete();

    expect(component.showDeleteDialog()).toBe(false);
    expect(component.projectToDelete()).toBeNull();
  });

  it('should confirm delete and call service', () => {
    const project = mockProjects[0];
    component.projectToDelete.set(project);
    component.showDeleteDialog.set(true);

    vi.spyOn(projectService, 'deleteProject').mockReturnValue(of(void 0));

    component.confirmDelete();

    expect(projectService.deleteProject).toHaveBeenCalledWith(project.id);
  });

  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    const formatted = component.formatDate(date);

    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
