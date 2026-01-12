import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScriptService } from '../../services/script.service';
import { Script, ScriptStep } from '../../models/script.model';
import { StepFormDialogComponent } from '../step-form-dialog/step-form-dialog.component';

@Component({
  selector: 'app-script-editor',
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  templateUrl: './script-editor.component.html',
  styleUrl: './script-editor.component.css',
})
export class ScriptEditorComponent implements OnInit {
  private readonly scriptService = inject(ScriptService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  scriptId = signal<string>('');
  script = signal<Script | null>(null);
  steps = signal<ScriptStep[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.scriptId.set(params['id']);
      this.loadScript();
    });
  }

  loadScript(): void {
    this.loading.set(true);
    this.error.set(null);

    this.scriptService.getScript(this.scriptId()).subscribe({
      next: (data) => {
        this.script.set(data);
        this.steps.set(data.steps || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading script:', err);
        this.error.set('Failed to load script');
        this.loading.set(false);
        this.snackBar.open('Failed to load script', 'Close', { duration: 3000 });
      },
    });
  }

  drop(event: CdkDragDrop<ScriptStep[]>): void {
    const items = [...this.steps()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);

    // Optimistic update
    this.steps.set(items);

    // Persist to backend
    const stepIds = items.map((s) => s.id);
    this.scriptService.reorderScriptSteps(this.scriptId(), stepIds).subscribe({
      next: (reorderedSteps) => {
        this.steps.set(reorderedSteps);
        this.snackBar.open('Steps reordered successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error reordering steps:', err);
        this.snackBar.open('Failed to reorder steps', 'Close', { duration: 3000 });
        // Rollback on error
        this.loadScript();
      },
    });
  }

  openAddStepDialog(): void {
    const dialogRef = this.dialog.open(StepFormDialogComponent, {
      width: '600px',
      data: { mode: 'create', scriptId: this.scriptId() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadScript();
      }
    });
  }

  openEditStepDialog(step: ScriptStep): void {
    const dialogRef = this.dialog.open(StepFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', scriptId: this.scriptId(), step },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadScript();
      }
    });
  }

  deleteStep(step: ScriptStep): void {
    if (!confirm(`Are you sure you want to delete step "${step.title}"?`)) {
      return;
    }

    this.scriptService.deleteScriptStep(this.scriptId(), step.id).subscribe({
      next: () => {
        this.snackBar.open('Step deleted successfully', 'Close', { duration: 3000 });
        this.loadScript();
      },
      error: (err) => {
        console.error('Error deleting step:', err);
        this.snackBar.open('Failed to delete step', 'Close', { duration: 3000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products', this.script()?.productId]);
  }
}
