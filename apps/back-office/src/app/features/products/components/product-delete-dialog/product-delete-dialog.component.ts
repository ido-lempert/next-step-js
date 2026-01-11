import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

export interface ProductDeleteDialogData {
  product: Product;
}

@Component({
  selector: 'app-product-delete-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-delete-dialog.component.html',
  styleUrl: './product-delete-dialog.component.css',
})
export class ProductDeleteDialogComponent {
  private readonly productService = inject(ProductService);
  private readonly dialogRef = inject(MatDialogRef<ProductDeleteDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  
  readonly data = inject<ProductDeleteDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  onConfirm(): void {
    this.loading.set(true);

    this.productService.deleteProduct(this.data.product.id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.loading.set(false);
        
        let message = 'Failed to delete product';
        if (err.error?.message) {
          message = err.error.message;
        }
        
        this.snackBar.open(message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
