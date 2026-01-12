import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:3333/api';
  private readonly tenantId = 'tenant-1'; // For MVP, hardcoded tenant ID

  // Signals for reactive state
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  loadProductsByProject(projectId: string): Observable<Product[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<Product[]>(`${this.apiUrl}/projects/${projectId}/products`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (products) => {
            this.products.set(products);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to load products');
            this.loading.set(false);
            console.error('Error loading products:', err);
          },
        })
      );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createProduct(
    projectId: string,
    dto: CreateProductDto
  ): Observable<Product> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<Product>(`${this.apiUrl}/projects/${projectId}/products`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (product) => {
            this.products.update((products) => [...products, product]);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to create product');
            this.loading.set(false);
            console.error('Error creating product:', err);
          },
        })
      );
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<Product>(`${this.apiUrl}/products/${id}`, dto, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (updatedProduct) => {
            this.products.update((products) =>
              products.map((p) => (p.id === id ? updatedProduct : p))
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to update product');
            this.loading.set(false);
            console.error('Error updating product:', err);
          },
        })
      );
  }

  deleteProduct(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<void>(`${this.apiUrl}/products/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: () => {
            this.products.update((products) =>
              products.filter((p) => p.id !== id)
            );
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to delete product');
            this.loading.set(false);
            console.error('Error deleting product:', err);
          },
        })
      );
  }
}
