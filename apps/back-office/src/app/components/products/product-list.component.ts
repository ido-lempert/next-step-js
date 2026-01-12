import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProjectService } from '../../services/project.service';
import { Product } from '../../models/product.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  productToDelete = signal<Product | null>(null);
  showDeleteDialog = signal<boolean>(false);
  projectId = signal<string>('');
  project = signal<Project | null>(null);

  constructor(
    public productService: ProductService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId) {
      this.projectId.set(projectId);
      this.loadProject(projectId);
      this.productService.loadProductsByProject(projectId).subscribe();
    }
  }

  loadProject(projectId: string) {
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project.set(project);
      },
      error: (err) => {
        console.error('Error loading project:', err);
      },
    });
  }

  onDelete(product: Product) {
    this.productToDelete.set(product);
    this.showDeleteDialog.set(true);
  }

  confirmDelete() {
    const product = this.productToDelete();
    if (product) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.productToDelete.set(null);
        },
        error: (err) => {
          console.error('Error deleting product:', err);
        },
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog.set(false);
    this.productToDelete.set(null);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }
}
