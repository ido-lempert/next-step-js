import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';

export interface ProductFormData {
  mode: 'create' | 'edit';
  product?: Product;
  projectId: string;
}

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly dialogRef = inject(MatDialogRef<ProductFormComponent>);
  private readonly snackBar = inject(MatSnackBar);
  
  readonly data = inject<ProductFormData>(MAT_DIALOG_DATA);

  productForm!: FormGroup;
  loading = signal<boolean>(false);

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEditMode ? 'Edit Product' : 'Create Product';
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: [
        this.data.product?.name || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      description: [this.data.product?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.loading.set(true);

    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct(): void {
    const dto: CreateProductDto = this.productForm.value;

    this.productService.createProduct(this.data.projectId, dto).subscribe({
      next: () => {
        this.snackBar.open('Product created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.loading.set(false);
        
        let message = 'Failed to create product';
        if (err.error?.validationErrors) {
          const errors = err.error.validationErrors
            .map((e: any) => e.message)
            .join(', ');
          message = errors;
        }
        
        this.snackBar.open(message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  private updateProduct(): void {
    const dto: UpdateProductDto = this.productForm.value;

    this.productService.updateProduct(this.data.product!.id, dto).subscribe({
      next: () => {
        this.snackBar.open('Product updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.loading.set(false);
        
        let message = 'Failed to update product';
        if (err.error?.validationErrors) {
          const errors = err.error.validationErrors
            .map((e: any) => e.message)
            .join(', ');
          message = errors;
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
