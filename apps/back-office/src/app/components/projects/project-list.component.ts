import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projectToDelete = signal<Project | null>(null);
  showDeleteDialog = signal<boolean>(false);

  constructor(public projectService: ProjectService) {}

  ngOnInit() {
    this.projectService.loadProjects().subscribe();
  }

  onEdit(project: Project) {
    // Navigate to edit form (will be implemented with routing)
    console.log('Edit project:', project);
  }

  onDelete(project: Project) {
    this.projectToDelete.set(project);
    this.showDeleteDialog.set(true);
  }

  confirmDelete() {
    const project = this.projectToDelete();
    if (project) {
      this.projectService.deleteProject(project.id).subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.projectToDelete.set(null);
        },
        error: (err) => {
          console.error('Error deleting project:', err);
        },
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog.set(false);
    this.projectToDelete.set(null);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }
}
