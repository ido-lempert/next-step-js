import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScriptService } from '../../services/script.service';
import { Script } from '../../models/script.model';
import { ScriptFormDialogComponent } from '../script-form-dialog/script-form-dialog.component';
import { ScriptDeleteDialogComponent } from '../script-delete-dialog/script-delete-dialog.component';

@Component({
  selector: 'app-script-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './script-list.component.html',
  styleUrl: './script-list.component.css',
})
export class ScriptListComponent implements OnInit {
  private readonly scriptService = inject(ScriptService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  productId = signal<string>('');

  scripts = signal<Script[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId.set(params['productId']);
      this.loadScripts();
    });
  }

  loadScripts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.scriptService.getScripts(this.productId()).subscribe({
      next: (data) => {
        this.scripts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading scripts:', err);
        this.error.set('Failed to load scripts');
        this.loading.set(false);
        this.snackBar.open('Failed to load scripts', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ScriptFormDialogComponent, {
      width: '500px',
      data: { mode: 'create', productId: this.productId() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadScripts();
      }
    });
  }

  openEditDialog(script: Script): void {
    const dialogRef = this.dialog.open(ScriptFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', script },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadScripts();
      }
    });
  }

  openDeleteDialog(script: Script): void {
    const dialogRef = this.dialog.open(ScriptDeleteDialogComponent, {
      width: '400px',
      data: { script },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadScripts();
      }
    });
  }

  openRecordingDialog(): void {
    import('../recording-upload-dialog/recording-upload-dialog.component').then((m) => {
      const dialogRef = this.dialog.open(m.RecordingUploadDialogComponent, {
        width: '600px',
        data: { productId: this.productId() },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadScripts();
        }
      });
    });
  }

  togglePublish(script: Script): void {
    const action = script.status === 'published' ? 'unpublish' : 'publish';
    const observable =
      script.status === 'published'
        ? this.scriptService.unpublishScript(script.id)
        : this.scriptService.publishScript(script.id);

    observable.subscribe({
      next: () => {
        this.snackBar.open(
          `Script ${action}ed successfully`,
          'Close',
          { duration: 3000 }
        );
        this.loadScripts();
      },
      error: (err) => {
        console.error(`Error ${action}ing script:`, err);
        this.snackBar.open(
          err.error?.message || `Failed to ${action} script`,
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  openScriptEditor(script: Script): void {
    this.router.navigate(['/scripts', script.id, 'editor']);
  }

  getTypeColor(type: string): string {
    return type === 'walkthrough' ? 'primary' : 'accent';
  }

  getStatusColor(status: string): string {
    return status === 'published' ? 'primary' : 'warn';
  }
}
