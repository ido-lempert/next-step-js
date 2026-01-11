import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 'product-1',
    projectId: 'project-1',
    name: 'Test Product',
    description: 'Test description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should retrieve products for a project', () => {
      const projectId = 'project-1';
      const mockProducts: Product[] = [mockProduct];

      service.getProducts(projectId).subscribe((products) => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(
        `http://localhost:3333/api/projects/${projectId}/products`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-demo-001');
      req.flush(mockProducts);
    });
  });

  describe('getProduct', () => {
    it('should retrieve a single product', () => {
      const productId = 'product-1';

      service.getProduct(productId).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`http://localhost:3333/api/products/${productId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-demo-001');
      req.flush(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', () => {
      const projectId = 'project-1';
      const dto: CreateProductDto = {
        name: 'New Product',
        description: 'New description',
      };

      service.createProduct(projectId, dto).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(
        `http://localhost:3333/api/projects/${projectId}/products`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-demo-001');
      req.flush(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', () => {
      const productId = 'product-1';
      const dto: UpdateProductDto = {
        name: 'Updated Name',
      };

      service.updateProduct(productId, dto).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`http://localhost:3333/api/products/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-demo-001');
      req.flush(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      const productId = 'product-1';

      service.deleteProduct(productId).subscribe();

      const req = httpMock.expectOne(`http://localhost:3333/api/products/${productId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-demo-001');
      req.flush(null);
    });
  });
});
