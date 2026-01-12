import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { tenantMiddleware } from '../middleware/tenant';
import { projectRouter } from './projects';
import { productRouter } from './products';
import { projectStore } from '../models/project-store';
import { productStore } from '../models/product-store';

describe('Product API Routes', () => {
  let app: Express;
  const tenantId1 = 'tenant-1';
  const tenantId2 = 'tenant-2';
  let project1Id: string;
  let project2Id: string;
  let tenant2ProjectId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', tenantMiddleware, projectRouter);
    app.use('/api', tenantMiddleware, productRouter);
  });

  beforeEach(async () => {
    // Clear the stores before each test
    const projStore = projectStore as any;
    const prodStore = productStore as any;
    projStore.projects.clear();
    prodStore.products.clear();

    // Create test projects
    const response1 = await request(app)
      .post('/api/projects')
      .set('X-Tenant-Id', tenantId1)
      .send({ name: 'Project 1' });
    project1Id = response1.body.id;

    const response2 = await request(app)
      .post('/api/projects')
      .set('X-Tenant-Id', tenantId1)
      .send({ name: 'Project 2' });
    project2Id = response2.body.id;

    const response3 = await request(app)
      .post('/api/projects')
      .set('X-Tenant-Id', tenantId2)
      .send({ name: 'Tenant 2 Project' });
    tenant2ProjectId = response3.body.id;
  });

  describe('POST /api/projects/:projectId/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({
          name: 'Test Product',
          description: 'Test Description',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Test Product',
        description: 'Test Description',
        project_id: project1Id,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });

    it('should create a product without description', async () => {
      const response = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({
          name: 'Test Product',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Product');
      expect(response.body.description).toBeUndefined();
    });

    it('should return 400 if name is missing', async () => {
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({})
        .expect(400);
    });

    it('should return 400 if name is empty', async () => {
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: '   ' })
        .expect(400);
    });

    it('should return 400 if name exceeds 255 characters', async () => {
      const longName = 'a'.repeat(256);
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: longName })
        .expect(400);
    });

    it('should return 404 if project does not exist', async () => {
      await request(app)
        .post('/api/projects/non-existent-id/products')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' })
        .expect(404);
    });

    it('should return 404 if project belongs to different tenant', async () => {
      await request(app)
        .post(`/api/projects/${tenant2ProjectId}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' })
        .expect(404);
    });

    it('should return 400 if tenant ID is missing', async () => {
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .send({ name: 'Test Product' })
        .expect(400);
    });
  });

  describe('GET /api/projects/:projectId/products', () => {
    it('should return all products for a project', async () => {
      // Create products for project 1
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Product 1' });

      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Product 2' });

      // Create product for project 2
      await request(app)
        .post(`/api/projects/${project2Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Project 2 Product' });

      const response = await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Product 1');
      expect(response.body[1].name).toBe('Product 2');
    });

    it('should return empty array when no products exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 if project does not exist', async () => {
      await request(app)
        .get('/api/projects/non-existent-id/products')
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 404 if project belongs to different tenant', async () => {
      await request(app)
        .get(`/api/projects/${tenant2ProjectId}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 400 if tenant ID is missing', async () => {
      await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Original Name', description: 'Original Description' });

      const productId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name', description: 'Updated Description' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated Description');
      expect(response.body.id).toBe(productId);
    });

    it('should update only the name', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Original Name', description: 'Original Description' });

      const productId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Original Description');
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .put('/api/products/non-existent-id')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 404 if product belongs to project of different tenant', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${tenant2ProjectId}/products`)
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .put(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 400 if name is invalid', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .put(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: '   ' })
        .expect(400);
    });

    it('should return 400 if tenant ID is missing', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .put(`/api/products/${productId}`)
        .send({ name: 'Updated Name' })
        .expect(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .delete(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(204);

      // Verify product is deleted
      const products = await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(products.body).toHaveLength(0);
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .delete('/api/products/non-existent-id')
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 404 if product belongs to project of different tenant', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${tenant2ProjectId}/products`)
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .delete(`/api/products/${productId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(404);

      // Verify product still exists for tenant 2
      const products = await request(app)
        .get(`/api/projects/${tenant2ProjectId}/products`)
        .set('X-Tenant-Id', tenantId2)
        .expect(200);

      expect(products.body).toHaveLength(1);
    });

    it('should return 400 if tenant ID is missing', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Product' });

      const productId = createResponse.body.id;

      await request(app)
        .delete(`/api/products/${productId}`)
        .expect(400);
    });
  });

  describe('CASCADE delete - deleting project should delete its products', () => {
    it('should delete all products when project is deleted', async () => {
      // Create products for project 1
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Product 1' });

      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Product 2' });

      // Verify products exist
      const productsBeforeDelete = await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(productsBeforeDelete.body).toHaveLength(2);

      // Delete the project
      await request(app)
        .delete(`/api/projects/${project1Id}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(204);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${project1Id}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(404);

      // Verify products can no longer be accessed through the deleted project
      await request(app)
        .get(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should not delete products from other projects', async () => {
      // Create products for both projects
      await request(app)
        .post(`/api/projects/${project1Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Project 1 Product' });

      await request(app)
        .post(`/api/projects/${project2Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Project 2 Product' });

      // Delete project 1
      await request(app)
        .delete(`/api/projects/${project1Id}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(204);

      // Verify project 2 products still exist
      const products = await request(app)
        .get(`/api/projects/${project2Id}/products`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(products.body).toHaveLength(1);
      expect(products.body[0].name).toBe('Project 2 Product');
    });
  });
});
