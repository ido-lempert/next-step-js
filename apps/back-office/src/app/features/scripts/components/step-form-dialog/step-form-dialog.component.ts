import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ScriptService } from '../../services/script.service';
import { ScriptStep, CreateScriptStepDto, UpdateScriptStepDto } from '../../models/script.model';

interface DialogData {
  mode: 'create' | 'edit';
  scriptId: string;
  step?: ScriptStep;
}

@Component({
  selector: 'app-step-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  templateUrl: './step-form-dialog.component.html',
  styleUrl: './step-form-dialog.component.css',
})
export class StepFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scriptService = inject(ScriptService);
  private readonly dialogRef = inject(MatDialogRef<StepFormDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  form: FormGroup;
  loading = signal<boolean>(false);

  actionTypes = [
    { value: 'click', label: 'Click' },
    { value: 'input', label: 'Input / Text Entry' },
    { value: 'submit', label: 'Form Submit' },
    { value: 'custom', label: 'Custom Event' },
  ];

  constructor() {
    const config = this.data.step?.config || {};
    
    this.form = this.fb.group({
      title: [this.data.step?.title || '', [Validators.required, Validators.maxLength(255)]],
      description: [this.data.step?.description || '', Validators.required],
      elementSelector: [this.data.step?.elementSelector || '', Validators.maxLength(500)],
      actionType: [this.data.step?.actionType || '', Validators.maxLength(50)],
      autoProgress: [config['autoProgress'] || false],
      autoProgressAction: [config['autoProgressAction'] || ''],
      autoProgressSelector: [config['autoProgressSelector'] || ''],
    });
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Step' : 'Add Step';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    // Extract form values
    const { autoProgress, autoProgressAction, autoProgressSelector, ...baseValues } = this.form.value;
    
    // Build config object
    const config: Record<string, unknown> = {};
    if (autoProgress) {
      config['autoProgress'] = true;
      config['autoProgressAction'] = autoProgressAction;
      if (autoProgressSelector) {
        config['autoProgressSelector'] = autoProgressSelector;
      }
    }

    // Merge with existing config if in edit mode
    const finalConfig = this.isEditMode && this.data.step?.config
      ? { ...this.data.step.config, ...config }
      : config;

    if (this.isEditMode && this.data.step) {
      const dto: UpdateScriptStepDto = {
        ...baseValues,
        config: Object.keys(finalConfig).length > 0 ? finalConfig : undefined,
      };
      this.scriptService.updateScriptStep(this.data.scriptId, this.data.step.id, dto).subscribe({
        next: () => {
          this.snackBar.open('Step updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating step:', err);
          this.snackBar.open('Failed to update step', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    } else {
      const dto: CreateScriptStepDto = {
        ...baseValues,
        config: Object.keys(finalConfig).length > 0 ? finalConfig : undefined,
      };
      this.scriptService.createScriptStep(this.data.scriptId, dto).subscribe({
        next: () => {
          this.snackBar.open('Step added successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating step:', err);
          this.snackBar.open('Failed to add step', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
