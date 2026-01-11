import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-delete-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './project-delete-dialog.component.html',
  styleUrl: './project-delete-dialog.component.css',
})
export class ProjectDeleteDialogComponent {
  private readonly projectService = inject(ProjectService);
  readonly dialogRef = inject(MatDialogRef<ProjectDeleteDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<{ project: Project }>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  onDelete(): void {
    this.loading.set(true);

    this.projectService.deleteProject(this.data.project.id).subscribe({
      next: () => {
        this.snackBar.open('Project deleted successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to delete project', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
