import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from './product.controller';
import { productService } from '../services/product.service';
import { projectService } from '../services/project.service';

describe('ProductController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await productService.clear();
    await projectService.clear();

    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnThis();
    mockSend = vi.fn().mockReturnThis();

    mockRequest = {
      tenantId: 'tenant-1',
      params: {},
      body: {},
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product and return 201', async () => {
      const projectId = 'project-1';
      const dto = { name: 'Test Product', description: 'Test description' };
      
      // Create a project first
      await projectService.create('tenant-1', { name: 'Test Project' });
      const projects = await projectService.findAllByTenant('tenant-1');
      const project = projects[0];

      mockRequest.params = { projectId: project.id };
      mockRequest.body = dto;
      mockRequest.tenantId = 'tenant-1';

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalled();
      const product = mockJson.mock.calls[0][0];
      expect(product.name).toBe(dto.name);
      expect(product.description).toBe(dto.description);
    });

    it('should return 404 when project not found', async () => {
      const projectId = 'non-existent';
      mockRequest.params = { projectId };
      mockRequest.body = { name: 'Test Product' };
      mockRequest.tenantId = 'tenant-1';

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Project not found',
      });
    });
  });

  describe('getProducts', () => {
    it('should return list of products', async () => {
      // Create a project first
      await projectService.create('tenant-1', { name: 'Test Project' });
      const projects = await projectService.findAllByTenant('tenant-1');
      const project = projects[0];
      
      // Create products
      await productService.create(project.id, 'tenant-1', { name: 'Product 1' });
      await productService.create(project.id, 'tenant-1', { name: 'Product 2' });

      mockRequest.params = { projectId: project.id };
      mockRequest.tenantId = 'tenant-1';

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const products = mockJson.mock.calls[0][0];
      expect(products).toHaveLength(2);
    });

    it('should return 404 when project not found', async () => {
      mockRequest.params = { projectId: 'non-existent' };
      mockRequest.tenantId = 'tenant-1';

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Project not found',
      });
    });
  });

  describe('getProduct', () => {
    it('should return a product by id', async () => {
      // Create a project and product
      await projectService.create('tenant-1', { name: 'Test Project' });
      const projects = await projectService.findAllByTenant('tenant-1');
      const project = projects[0];
      const createdProduct = await productService.create(project.id, 'tenant-1', { name: 'Test Product' });

      mockRequest.params = { id: createdProduct!.id };
      mockRequest.tenantId = 'tenant-1';

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const product = mockJson.mock.calls[0][0];
      expect(product.id).toBe(createdProduct!.id);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.tenantId = 'tenant-1';

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Product not found',
      });
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return it', async () => {
      // Create a project and product
      await projectService.create('tenant-1', { name: 'Test Project' });
      const projects = await projectService.findAllByTenant('tenant-1');
      const project = projects[0];
      const createdProduct = await productService.create(project.id, 'tenant-1', { name: 'Original Name' });

      const dto = { name: 'Updated Name' };
      mockRequest.params = { id: createdProduct!.id };
      mockRequest.body = dto;
      mockRequest.tenantId = 'tenant-1';

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const product = mockJson.mock.calls[0][0];
      expect(product.name).toBe(dto.name);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { name: 'Updated Name' };
      mockRequest.tenantId = 'tenant-1';

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Product not found',
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return 204', async () => {
      // Create a project and product
      await projectService.create('tenant-1', { name: 'Test Project' });
      const projects = await projectService.findAllByTenant('tenant-1');
      const project = projects[0];
      const createdProduct = await productService.create(project.id, 'tenant-1', { name: 'Test Product' });

      mockRequest.params = { id: createdProduct!.id };
      mockRequest.tenantId = 'tenant-1';

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.tenantId = 'tenant-1';

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Product not found',
      });
    });
  });
});
