import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = signal<boolean>(false);
  projectId = signal<string | null>(null);
  submitError = signal<string | null>(null);
  submitting = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  loadProject(id: string) {
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description || '',
        });
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.submitError.set('Failed to load project');
      },
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.controls[key].markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const formValue = this.projectForm.value;

    if (this.isEditMode()) {
      const id = this.projectId();
      if (id) {
        this.projectService.updateProject(id, formValue).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/projects']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.error?.error || 'Failed to update project');
          },
        });
      }
    } else {
      this.projectService.createProject(formValue).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.error?.error || 'Failed to create project');
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/projects']);
  }

  get nameControl() {
    return this.projectForm.get('name');
  }

  get descriptionControl() {
    return this.projectForm.get('description');
  }
}
