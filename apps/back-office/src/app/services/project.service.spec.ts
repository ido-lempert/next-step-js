import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { provideHttpClient } from '@angular/common/http';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const mockProject: Project = {
    id: '1',
    tenant_id: 'tenant-1',
    name: 'Test Project',
    description: 'Test Description',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProjects', () => {
    it('should load projects and update signal', async () => {
      const mockProjects: Project[] = [mockProject];

      service.loadProjects().subscribe((projects) => {
        expect(projects).toEqual(mockProjects);
        expect(service.projects()).toEqual(mockProjects);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
      req.flush(mockProjects);
    });

    it('should handle error when loading projects', async () => {
      service.loadProjects().subscribe({
        error: () => {
          expect(service.error()).toBe('Failed to load projects');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects');
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getProject', () => {
    it('should get a single project', async () => {
      service.getProject('1').subscribe((project) => {
        expect(project).toEqual(mockProject);
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
      req.flush(mockProject);
    });
  });

  describe('createProject', () => {
    it('should create a project and update signal', async () => {
      const dto: CreateProjectDto = {
        name: 'New Project',
        description: 'New Description',
      };

      service.createProject(dto).subscribe((project) => {
        expect(project).toEqual(mockProject);
        expect(service.projects()).toContain(mockProject);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
      req.flush(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update a project and update signal', async () => {
      const dto: UpdateProjectDto = {
        name: 'Updated Project',
      };

      const updatedProject = { ...mockProject, name: 'Updated Project' };

      // Pre-populate with initial project
      service.projects.set([mockProject]);

      service.updateProject('1', dto).subscribe((project) => {
        expect(project).toEqual(updatedProject);
        expect(service.projects()[0].name).toBe('Updated Project');
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
      req.flush(updatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project and update signal', async () => {
      // Pre-populate with initial project
      service.projects.set([mockProject]);

      service.deleteProject('1').subscribe(() => {
        expect(service.projects().length).toBe(0);
        expect(service.loading()).toBe(false);
      });

      const req = httpMock.expectOne('http://localhost:3333/api/projects/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
      req.flush(null);
    });
  });
});
