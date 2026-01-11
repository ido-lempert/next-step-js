import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScriptService } from '../../services/script.service';
import { Script, CreateScriptDto, UpdateScriptDto } from '../../models/script.model';

interface DialogData {
  mode: 'create' | 'edit';
  productId?: string;
  script?: Script;
}

@Component({
  selector: 'app-script-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './script-form-dialog.component.html',
  styleUrl: './script-form-dialog.component.css',
})
export class ScriptFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scriptService = inject(ScriptService);
  private readonly dialogRef = inject(MatDialogRef<ScriptFormDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  form: FormGroup;
  loading = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      name: [this.data.script?.name || '', [Validators.required, Validators.maxLength(255)]],
      type: [this.data.script?.type || 'walkthrough', Validators.required],
    });
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Script' : 'Create Script';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    if (this.isEditMode && this.data.script) {
      const dto: UpdateScriptDto = this.form.value;
      this.scriptService.updateScript(this.data.script.id, dto).subscribe({
        next: () => {
          this.snackBar.open('Script updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating script:', err);
          this.snackBar.open('Failed to update script', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    } else if (this.data.productId) {
      const dto: CreateScriptDto = this.form.value;
      this.scriptService.createScript(this.data.productId, dto).subscribe({
        next: () => {
          this.snackBar.open('Script created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating script:', err);
          this.snackBar.open('Failed to create script', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
