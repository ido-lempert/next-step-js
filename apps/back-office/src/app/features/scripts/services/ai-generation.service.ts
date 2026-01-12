import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recording {
  sessionId: string;
  startUrl: string;
  pageTitle: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  interactions: Array<{
    type: 'click' | 'input' | 'navigation' | 'scroll';
    timestamp: number;
    selector: string;
    value?: string;
    url?: string;
    scrollPosition?: { x: number; y: number };
    screenshot?: string;
    elementText?: string;
    elementType?: string;
  }>;
  metadata?: {
    userAgent?: string;
    viewport?: { width: number; height: number };
  };
}

export interface GenerationJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scriptId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiGenerationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api';

  /**
   * Upload recording and start AI generation
   */
  generateFromRecording(recording: Recording, productId: string): Observable<GenerationJob> {
    return this.http.post<GenerationJob>(`${this.apiUrl}/scripts/generate-from-recording`, {
      recording,
      productId,
    });
  }

  /**
   * Get generation job status
   */
  getGenerationStatus(jobId: string): Observable<GenerationJob> {
    return this.http.get<GenerationJob>(`${this.apiUrl}/scripts/generation-status/${jobId}`);
  }

  /**
   * Poll for job completion
   */
  pollGenerationStatus(jobId: string, interval = 2000): Observable<GenerationJob> {
    return new Observable((observer) => {
      const poll = async () => {
        try {
          const status = await this.getGenerationStatus(jobId).toPromise();
          observer.next(status);

          if (status?.status === 'completed' || status?.status === 'failed') {
            observer.complete();
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          observer.error(error);
        }
      };

      poll();
    });
  }
}
