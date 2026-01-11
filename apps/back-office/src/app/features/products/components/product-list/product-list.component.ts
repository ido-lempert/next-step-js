import { Component, OnInit, signal, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductDeleteDialogComponent } from '../product-delete-dialog/product-delete-dialog.component';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  projectId = input.required<string>();
  
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    // React to projectId changes
    effect(() => {
      const id = this.projectId();
      if (id) {
        this.loadProducts();
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts(this.projectId()).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set('Failed to load products');
        this.loading.set(false);
        this.snackBar.open('Failed to load products', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '500px',
      data: { mode: 'create', projectId: this.projectId() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '500px',
      data: { mode: 'edit', product, projectId: this.projectId() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openDeleteDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDeleteDialogComponent, {
      width: '400px',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  viewScripts(product: Product): void {
    this.router.navigate(['/products', product.id, 'scripts']);
  }
}
