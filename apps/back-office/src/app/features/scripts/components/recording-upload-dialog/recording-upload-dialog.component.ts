import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AiGenerationService, Recording } from '../../services/ai-generation.service';

@Component({
  selector: 'app-recording-upload-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Generate Script from Recording</h2>
    
    <mat-dialog-content>
      @if (status() === 'idle') {
        <div class="upload-area">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3>Upload Recording File</h3>
          <p>
            Use the Next-Step browser extension to record your workflow,
            then upload the recording file here.
          </p>
          
          <input
            type="file"
            accept=".json"
            (change)="onFileSelected($event)"
            #fileInput
            style="display: none"
          />
          
          <button mat-raised-button color="primary" (click)="fileInput.click()">
            <mat-icon>folder_open</mat-icon>
            Select Recording File
          </button>

          @if (selectedFile()) {
            <div class="file-info">
              <mat-icon>description</mat-icon>
              <span>{{ selectedFile()?.name }}</span>
            </div>
          }
        </div>
      } @else if (status() === 'uploading') {
        <div class="status-area">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>Uploading recording...</p>
        </div>
      } @else if (status() === 'processing') {
        <div class="status-area">
          <mat-spinner diameter="50"></mat-spinner>
          <h3>Generating Script with AI</h3>
          <p>This may take a few moments...</p>
          <p class="status-detail">{{ statusMessage() }}</p>
        </div>
      } @else if (status() === 'completed') {
        <div class="status-area success">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h3>Script Generated Successfully!</h3>
          <p>Your AI-generated script is ready to review and edit.</p>
        </div>
      } @else if (status() === 'error') {
        <div class="status-area error">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Generation Failed</h3>
          <p>{{ errorMessage() }}</p>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (status() === 'idle' || status() === 'error') {
        <button mat-button (click)="cancel()">Cancel</button>
        @if (selectedFile()) {
          <button mat-raised-button color="primary" (click)="upload()">
            Upload & Generate
          </button>
        }
      } @else if (status() === 'completed') {
        <button mat-button (click)="cancel()">Close</button>
        <button mat-raised-button color="primary" (click)="openScript()">
          Open Script
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-area {
      text-align: center;
      padding: 40px 20px;
    }

    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .upload-area h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }

    .upload-area p {
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 6px;
      justify-content: center;
    }

    .file-info mat-icon {
      color: #667eea;
    }

    .status-area {
      text-align: center;
      padding: 40px 20px;
    }

    .status-area h3 {
      margin: 16px 0 8px 0;
      color: #374151;
    }

    .status-area p {
      color: #6b7280;
      margin: 8px 0;
    }

    .status-detail {
      font-size: 14px;
      font-style: italic;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #10b981;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ef4444;
    }

    mat-progress-bar {
      margin-bottom: 16px;
    }

    mat-spinner {
      margin: 0 auto 24px;
    }
  `],
})
export class RecordingUploadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RecordingUploadDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly aiService = inject(AiGenerationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  selectedFile = signal<File | null>(null);
  status = signal<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  statusMessage = signal<string>('');
  errorMessage = signal<string>('');
  generatedScriptId = signal<string | null>(null);

  productId: string = this.data.productId;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  async upload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    try {
      this.status.set('uploading');

      // Read file content
      const content = await this.readFile(file);
      const recording: Recording = JSON.parse(content);

      // Validate recording
      if (!recording.sessionId || !recording.interactions) {
        throw new Error('Invalid recording format');
      }

      // Upload and start generation
      this.status.set('processing');
      this.statusMessage.set('Starting AI generation...');

      this.aiService.generateFromRecording(recording, this.productId).subscribe({
        next: (job) => {
          this.statusMessage.set('AI is analyzing your recording...');
          this.pollJobStatus(job.jobId);
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.status.set('error');
          this.errorMessage.set(error.error?.error || 'Failed to upload recording');
          this.snackBar.open('Failed to upload recording', 'Close', {
            duration: 5000,
          });
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      this.status.set('error');
      this.errorMessage.set('Failed to read recording file. Please check the file format.');
      this.snackBar.open('Failed to read recording file', 'Close', {
        duration: 5000,
      });
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private pollJobStatus(jobId: string): void {
    this.aiService.pollGenerationStatus(jobId).subscribe({
      next: (job) => {
        if (job.status === 'processing') {
          this.statusMessage.set('Generating script steps...');
        } else if (job.status === 'completed') {
          this.status.set('completed');
          this.generatedScriptId.set(job.scriptId || null);
          this.snackBar.open('Script generated successfully!', 'Close', {
            duration: 3000,
          });
        } else if (job.status === 'failed') {
          this.status.set('error');
          this.errorMessage.set(job.error || 'AI generation failed');
          this.snackBar.open('Script generation failed', 'Close', {
            duration: 5000,
          });
        }
      },
      error: (error) => {
        console.error('Polling failed:', error);
        this.status.set('error');
        this.errorMessage.set('Failed to check generation status');
        this.snackBar.open('Failed to check generation status', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  openScript(): void {
    const scriptId = this.generatedScriptId();
    if (scriptId) {
      this.dialogRef.close({ scriptId });
      this.router.navigate(['/products', this.productId, 'scripts', scriptId, 'edit']);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
