import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private readonly tenantId = environment.defaultTenantId;

  // Signals for reactive state
  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  loadProjects(): Observable<Project[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<Project[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap({
          next: (projects) => {
            this.projects.set(projects);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to load projects');
            this.loading.set(false);
            console.error('Error loading projects:', err);
          },
        })
      );
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<Project>(this.apiUrl, dto, { headers: this.getHeaders() })
      .pipe(
        tap({
          next: (project) => {
            this.projects.update((projects) => [...projects, project]);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to create project');
            this.loading.set(false);
            console.error('Error creating project:', err);
          },
        })
      );
  }

  updateProject(id: string, dto: UpdateProjectDto): Observable<Project> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<Project>(`${this.apiUrl}/${id}`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (updatedProject) => {
            this.projects.update((projects) =>
              projects.map((p) => (p.id === id ? updatedProject : p))
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to update project');
            this.loading.set(false);
            console.error('Error updating project:', err);
          },
        })
      );
  }

  deleteProject(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap({
          next: () => {
            this.projects.update((projects) =>
              projects.filter((p) => p.id !== id)
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to delete project');
            this.loading.set(false);
            console.error('Error deleting project:', err);
          },
        })
      );
  }
}
