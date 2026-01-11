import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api';

  // For MVP: hardcoded tenant ID
  // In production: This would come from auth token
  private readonly tenantId = 'tenant-demo-001';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': this.tenantId,
    });
  }

  getProducts(projectId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/projects/${projectId}/products`, {
      headers: this.getHeaders(),
    });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createProduct(projectId: string, dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/projects/${projectId}/products`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
