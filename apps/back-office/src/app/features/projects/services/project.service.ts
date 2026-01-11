import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api/projects';

  // For MVP: hardcoded tenant ID
  // In production: This would come from auth token
  private readonly tenantId = 'tenant-demo-001';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, dto, {
      headers: this.getHeaders(),
    });
  }

  updateProject(id: string, dto: UpdateProjectDto): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
