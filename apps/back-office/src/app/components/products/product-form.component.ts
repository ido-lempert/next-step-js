import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = signal<boolean>(false);
  productId = signal<string | null>(null);
  projectId = signal<string>('');
  project = signal<Project | null>(null);
  submitError = signal<string | null>(null);
  submitting = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    const productId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      this.projectId.set(projectId);
      this.loadProject(projectId);
    }

    if (productId) {
      this.isEditMode.set(true);
      this.productId.set(productId);
      this.loadProduct(productId);
    }
  }

  loadProject(projectId: string) {
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project.set(project);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.submitError.set('Failed to load project');
      },
    });
  }

  loadProduct(productId: string) {
    // Find product in the service's products signal
    const products = this.productService.products();
    const product = products.find((p) => p.id === productId);

    if (product) {
      this.productForm.patchValue({
        name: product.name,
        description: product.description || '',
      });
    } else {
      // If not found in signal, we need to load products first
      const projectId = this.projectId();
      if (projectId) {
        this.productService.loadProductsByProject(projectId).subscribe({
          next: (products) => {
            const product = products.find((p) => p.id === productId);
            if (product) {
              this.productForm.patchValue({
                name: product.name,
                description: product.description || '',
              });
            }
          },
          error: (err) => {
            console.error('Error loading product:', err);
            this.submitError.set('Failed to load product');
          },
        });
      }
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach((key) => {
        this.productForm.controls[key].markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const formValue = this.productForm.value;
    const projectId = this.projectId();

    if (!projectId) {
      this.submitError.set('Project ID is missing');
      this.submitting.set(false);
      return;
    }

    if (this.isEditMode()) {
      const id = this.productId();
      if (id) {
        this.productService.updateProduct(id, formValue).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/projects', projectId, 'products']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.error?.error || 'Failed to update product'
            );
          },
        });
      }
    } else {
      this.productService.createProduct(projectId, formValue).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/projects', projectId, 'products']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.error?.error || 'Failed to create product');
        },
      });
    }
  }

  onCancel() {
    const projectId = this.projectId();
    this.router.navigate(['/projects', projectId, 'products']);
  }

  get nameControl() {
    return this.productForm.get('name');
  }

  get descriptionControl() {
    return this.productForm.get('description');
  }
}
