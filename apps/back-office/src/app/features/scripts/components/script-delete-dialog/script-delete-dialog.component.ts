import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScriptService } from '../../services/script.service';
import { Script } from '../../models/script.model';

interface DialogData {
  script: Script;
}

@Component({
  selector: 'app-script-delete-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './script-delete-dialog.component.html',
  styleUrl: './script-delete-dialog.component.css',
})
export class ScriptDeleteDialogComponent {
  private readonly scriptService = inject(ScriptService);
  private readonly dialogRef = inject(MatDialogRef<ScriptDeleteDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  onConfirm(): void {
    this.loading.set(true);

    this.scriptService.deleteScript(this.data.script.id).subscribe({
      next: () => {
        this.snackBar.open('Script deleted successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error deleting script:', err);
        this.snackBar.open('Failed to delete script', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
