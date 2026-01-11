import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProductListComponent } from '../../../products/components/product-list/product-list.component';

@Component({
  selector: 'app-project-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ProductListComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  project = signal<Project | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProject(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Failed to load project');
        this.loading.set(false);
        this.snackBar.open('Failed to load project', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
