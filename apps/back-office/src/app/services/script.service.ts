import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Script,
  ScriptWithSteps,
  CreateScriptDto,
  UpdateScriptDto,
  ScriptStep,
  CreateScriptStepDto,
  UpdateScriptStepDto,
  ReorderStepsDto,
} from '../models/script.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tenantId = environment.defaultTenantId;

  scripts = signal<Script[]>([]);
  currentScript = signal<ScriptWithSteps | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  loadScriptsByProduct(productId: string): Observable<Script[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<Script[]>(`${this.apiUrl}/products/${productId}/scripts`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (scripts) => {
            this.scripts.set(scripts);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to load scripts');
            this.loading.set(false);
            console.error('Error loading scripts:', err);
          },
        })
      );
  }

  getScript(scriptId: string): Observable<ScriptWithSteps> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<ScriptWithSteps>(`${this.apiUrl}/scripts/${scriptId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (script) => {
            this.currentScript.set(script);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to load script');
            this.loading.set(false);
            console.error('Error loading script:', err);
          },
        })
      );
  }

  createScript(
    productId: string,
    dto: CreateScriptDto
  ): Observable<Script> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<Script>(`${this.apiUrl}/products/${productId}/scripts`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (script) => {
            this.scripts.update((scripts) => [...scripts, script]);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to create script');
            this.loading.set(false);
            console.error('Error creating script:', err);
          },
        })
      );
  }

  updateScript(id: string, dto: UpdateScriptDto): Observable<Script> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<Script>(`${this.apiUrl}/scripts/${id}`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (updatedScript) => {
            this.scripts.update((scripts) =>
              scripts.map((s) => (s.id === id ? updatedScript : s))
            );
            if (this.currentScript()?.id === id) {
              this.currentScript.update((current) =>
                current ? { ...current, ...updatedScript } : null
              );
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to update script');
            this.loading.set(false);
            console.error('Error updating script:', err);
          },
        })
      );
  }

  publishScript(id: string): Observable<Script> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .patch<Script>(`${this.apiUrl}/scripts/${id}/publish`, {}, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (updatedScript) => {
            this.scripts.update((scripts) =>
              scripts.map((s) => (s.id === id ? updatedScript : s))
            );
            if (this.currentScript()?.id === id) {
              this.currentScript.update((current) =>
                current ? { ...current, status: 'published' } : null
              );
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to publish script');
            this.loading.set(false);
            console.error('Error publishing script:', err);
          },
        })
      );
  }

  unpublishScript(id: string): Observable<Script> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .patch<Script>(`${this.apiUrl}/scripts/${id}/unpublish`, {}, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (updatedScript) => {
            this.scripts.update((scripts) =>
              scripts.map((s) => (s.id === id ? updatedScript : s))
            );
            if (this.currentScript()?.id === id) {
              this.currentScript.update((current) =>
                current ? { ...current, status: 'draft' } : null
              );
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to unpublish script');
            this.loading.set(false);
            console.error('Error unpublishing script:', err);
          },
        })
      );
  }

  deleteScript(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<void>(`${this.apiUrl}/scripts/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: () => {
            this.scripts.update((scripts) =>
              scripts.filter((s) => s.id !== id)
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to delete script');
            this.loading.set(false);
            console.error('Error deleting script:', err);
          },
        })
      );
  }

  createStep(
    scriptId: string,
    dto: CreateScriptStepDto
  ): Observable<ScriptStep> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<ScriptStep>(`${this.apiUrl}/scripts/${scriptId}/steps`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (step) => {
            this.currentScript.update((current) =>
              current ? { ...current, steps: [...current.steps, step] } : null
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to create step');
            this.loading.set(false);
            console.error('Error creating step:', err);
          },
        })
      );
  }

  updateStep(
    scriptId: string,
    stepId: string,
    dto: UpdateScriptStepDto
  ): Observable<ScriptStep> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<ScriptStep>(
        `${this.apiUrl}/scripts/${scriptId}/steps/${stepId}`,
        dto,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap({
          next: (updatedStep) => {
            this.currentScript.update((current) =>
              current
                ? {
                    ...current,
                    steps: current.steps.map((s) =>
                      s.id === stepId ? updatedStep : s
                    ),
                  }
                : null
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to update step');
            this.loading.set(false);
            console.error('Error updating step:', err);
          },
        })
      );
  }

  reorderSteps(
    scriptId: string,
    dto: ReorderStepsDto
  ): Observable<ScriptStep[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .patch<ScriptStep[]>(
        `${this.apiUrl}/scripts/${scriptId}/steps/reorder`,
        dto,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap({
          next: (steps) => {
            this.currentScript.update((current) =>
              current ? { ...current, steps } : null
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to reorder steps');
            this.loading.set(false);
            console.error('Error reordering steps:', err);
          },
        })
      );
  }

  deleteStep(scriptId: string, stepId: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<void>(`${this.apiUrl}/scripts/${scriptId}/steps/${stepId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: () => {
            this.currentScript.update((current) =>
              current
                ? {
                    ...current,
                    steps: current.steps.filter((s) => s.id !== stepId),
                  }
                : null
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to delete step');
            this.loading.set(false);
            console.error('Error deleting step:', err);
          },
        })
      );
  }
}
