import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Script,
  ScriptStep,
  CreateScriptDto,
  UpdateScriptDto,
  CreateScriptStepDto,
  UpdateScriptStepDto,
} from '../models/script.model';

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api';

  // For MVP: hardcoded tenant ID
  // In production: This would come from auth token
  private readonly tenantId = 'tenant-demo-001';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  // Script operations
  getScripts(productId: string): Observable<Script[]> {
    return this.http.get<Script[]>(
      `${this.apiUrl}/products/${productId}/scripts`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getScript(id: string): Observable<Script> {
    return this.http.get<Script>(`${this.apiUrl}/scripts/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createScript(
    productId: string,
    dto: CreateScriptDto
  ): Observable<Script> {
    return this.http.post<Script>(
      `${this.apiUrl}/products/${productId}/scripts`,
      dto,
      {
        headers: this.getHeaders(),
      }
    );
  }

  updateScript(id: string, dto: UpdateScriptDto): Observable<Script> {
    return this.http.put<Script>(`${this.apiUrl}/scripts/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  publishScript(id: string): Observable<Script> {
    return this.http.patch<Script>(
      `${this.apiUrl}/scripts/${id}/publish`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  unpublishScript(id: string): Observable<Script> {
    return this.http.patch<Script>(
      `${this.apiUrl}/scripts/${id}/unpublish`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  deleteScript(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scripts/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Script step operations
  getScriptSteps(scriptId: string): Observable<ScriptStep[]> {
    return this.http.get<ScriptStep[]>(
      `${this.apiUrl}/scripts/${scriptId}/steps`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getScriptStep(scriptId: string, stepId: string): Observable<ScriptStep> {
    return this.http.get<ScriptStep>(
      `${this.apiUrl}/scripts/${scriptId}/steps/${stepId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  createScriptStep(
    scriptId: string,
    dto: CreateScriptStepDto
  ): Observable<ScriptStep> {
    return this.http.post<ScriptStep>(
      `${this.apiUrl}/scripts/${scriptId}/steps`,
      dto,
      {
        headers: this.getHeaders(),
      }
    );
  }

  updateScriptStep(
    scriptId: string,
    stepId: string,
    dto: UpdateScriptStepDto
  ): Observable<ScriptStep> {
    return this.http.put<ScriptStep>(
      `${this.apiUrl}/scripts/${scriptId}/steps/${stepId}`,
      dto,
      {
        headers: this.getHeaders(),
      }
    );
  }

  reorderScriptSteps(
    scriptId: string,
    stepIds: string[]
  ): Observable<ScriptStep[]> {
    return this.http.patch<ScriptStep[]>(
      `${this.apiUrl}/scripts/${scriptId}/steps/reorder`,
      { stepIds },
      {
        headers: this.getHeaders(),
      }
    );
  }

  deleteScriptStep(scriptId: string, stepId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/scripts/${scriptId}/steps/${stepId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
