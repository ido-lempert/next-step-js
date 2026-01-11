import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error.set('Failed to load projects');
        this.loading.set(false);
        this.snackBar.open('Failed to load projects', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '500px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  openEditDialog(project: Project): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '500px',
      data: { mode: 'edit', project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  openDeleteDialog(project: Project): void {
    const dialogRef = this.dialog.open(ProjectDeleteDialogComponent, {
      width: '400px',
      data: { project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProjects();
      }
    });
  }
}
