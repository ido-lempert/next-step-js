import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

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

  it('should load products by project', () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        project_id: 'project-1',
        name: 'Product 1',
        description: 'Description 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    service.loadProductsByProject('project-1').subscribe((products) => {
      expect(products).toEqual(mockProducts);
      expect(service.products()).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('http://localhost:3333/api/projects/project-1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should create a product', () => {
    const newProduct: Product = {
      id: '1',
      project_id: 'project-1',
      name: 'New Product',
      description: 'Description',
      created_at: new Date(),
      updated_at: new Date(),
    };

    service.createProduct('project-1', { name: 'New Product', description: 'Description' }).subscribe((product) => {
      expect(product).toEqual(newProduct);
    });

    const req = httpMock.expectOne('http://localhost:3333/api/projects/project-1/products');
    expect(req.request.method).toBe('POST');
    req.flush(newProduct);
  });

  it('should update a product', () => {
    const updatedProduct: Product = {
      id: '1',
      project_id: 'project-1',
      name: 'Updated Product',
      description: 'Updated Description',
      created_at: new Date(),
      updated_at: new Date(),
    };

    service.updateProduct('1', { name: 'Updated Product' }).subscribe((product) => {
      expect(product).toEqual(updatedProduct);
    });

    const req = httpMock.expectOne('http://localhost:3333/api/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedProduct);
  });

  it('should delete a product', () => {
    service.deleteProduct('1').subscribe();

    const req = httpMock.expectOne('http://localhost:3333/api/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
