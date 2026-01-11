import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

export interface ProjectFormData {
  mode: 'create' | 'edit';
  project?: Project;
}

@Component({
  selector: 'app-project-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent {
  private readonly projectService = inject(ProjectService);
  readonly dialogRef = inject(MatDialogRef<ProjectFormComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<{ mode: 'create' | 'edit'; project?: Project }>(MAT_DIALOG_DATA);

  mode = this.data.mode;
  project = this.data.project;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    description: new FormControl(''),
  });

  loading = signal<boolean>(false);

  constructor() {
    if (this.data.mode === 'edit' && this.data.project) {
      this.form.patchValue({
        name: this.data.project.name,
        description: this.data.project.description || '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    const dto = {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
    };

    const request$ =
      this.data.mode === 'create'
        ? this.projectService.createProject(dto)
        : this.projectService.updateProject(this.data.project!.id, dto);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Project ${this.data.mode === 'create' ? 'created' : 'updated'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving project:', err);
        this.snackBar.open('Failed to save project', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
