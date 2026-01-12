import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { tenantMiddleware } from '../middleware/tenant';
import { projectRouter } from './projects';
import { productRouter } from './products';
import { scriptRouter } from './scripts';
import { projectStore } from '../models/project-store';
import { productStore } from '../models/product-store';
import { scriptStore } from '../models/script-store';
import { scriptStepStore } from '../models/script-step-store';

describe('Script API Routes', () => {
  let app: Express;
  const tenantId1 = 'tenant-1';
  const tenantId2 = 'tenant-2';
  let project1Id: string;
  let product1Id: string;
  let tenant2ProjectId: string;
  let tenant2ProductId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', tenantMiddleware, projectRouter);
    app.use('/api', tenantMiddleware, productRouter);
    app.use('/api', tenantMiddleware, scriptRouter);
  });

  beforeEach(async () => {
    // Clear the stores before each test
    const projStore = projectStore as any;
    const prodStore = productStore as any;
    const scriptSt = scriptStore as any;
    const stepStore = scriptStepStore as any;
    projStore.projects.clear();
    prodStore.products.clear();
    scriptSt.scripts.clear();
    stepStore.steps.clear();

    // Create test project and product for tenant 1
    const projectResponse = await request(app)
      .post('/api/projects')
      .set('X-Tenant-Id', tenantId1)
      .send({ name: 'Project 1' });
    project1Id = projectResponse.body.id;

    const productResponse = await request(app)
      .post(`/api/projects/${project1Id}/products`)
      .set('X-Tenant-Id', tenantId1)
      .send({ name: 'Product 1' });
    product1Id = productResponse.body.id;

    // Create test project and product for tenant 2
    const tenant2ProjectResponse = await request(app)
      .post('/api/projects')
      .set('X-Tenant-Id', tenantId2)
      .send({ name: 'Tenant 2 Project' });
    tenant2ProjectId = tenant2ProjectResponse.body.id;

    const tenant2ProductResponse = await request(app)
      .post(`/api/projects/${tenant2ProjectId}/products`)
      .set('X-Tenant-Id', tenantId2)
      .send({ name: 'Tenant 2 Product' });
    tenant2ProductId = tenant2ProductResponse.body.id;
  });

  describe('POST /api/products/:productId/scripts', () => {
    it('should create a new script', async () => {
      const response = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        product_id: product1Id,
        name: 'My Script',
        type: 'walkthrough',
        status: 'draft',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
    });

    it('should validate script name', async () => {
      const response = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: '', type: 'walkthrough' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name');
    });

    it('should validate script type', async () => {
      const response = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Type');
    });

    it('should enforce tenant isolation', async () => {
      const response = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'My Script', type: 'modal' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/products/:productId/scripts', () => {
    it('should list scripts for a product', async () => {
      // Create two scripts
      await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Script 1', type: 'walkthrough' });

      await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Script 2', type: 'modal' });

      const response = await request(app)
        .get(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].step_count).toBe(0);
    });

    it('should enforce tenant isolation', async () => {
      const response = await request(app)
        .get(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId2);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/scripts/:id', () => {
    it('should get a script with its steps', async () => {
      // Create script
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      // Add a step
      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1', description: 'First step' });

      const response = await request(app)
        .get(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(scriptId);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].title).toBe('Step 1');
    });

    it('should enforce tenant isolation', async () => {
      // Create script with tenant 1
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      // Try to access with tenant 2
      const response = await request(app)
        .get(`/api/scripts/${scriptResponse.body.id}`)
        .set('X-Tenant-Id', tenantId2);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/scripts/:id', () => {
    it('should update a script', async () => {
      // Create script
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const response = await request(app)
        .put(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Script' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Script');
      expect(response.body.type).toBe('walkthrough');
    });

    it('should enforce tenant isolation', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const response = await request(app)
        .put(`/api/scripts/${scriptResponse.body.id}`)
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'Hacked' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/scripts/:id/publish', () => {
    it('should publish a script with steps', async () => {
      // Create script
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      // Add a step
      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      const response = await request(app)
        .patch(`/api/scripts/${scriptId}/publish`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('published');
    });

    it('should not publish a script without steps', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const response = await request(app)
        .patch(`/api/scripts/${scriptResponse.body.id}/publish`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('without steps');
    });
  });

  describe('PATCH /api/scripts/:id/unpublish', () => {
    it('should unpublish a script', async () => {
      // Create and publish script
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      await request(app)
        .patch(`/api/scripts/${scriptId}/publish`)
        .set('X-Tenant-Id', tenantId1);

      const response = await request(app)
        .patch(`/api/scripts/${scriptId}/unpublish`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('draft');
    });
  });

  describe('DELETE /api/scripts/:id', () => {
    it('should delete a script and cascade delete its steps', async () => {
      // Create script with steps
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 2' });

      // Delete script
      const response = await request(app)
        .delete(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(204);

      // Verify steps are deleted
      const getResponse = await request(app)
        .get(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1);

      expect(getResponse.status).toBe(404);
    });

    it('should enforce tenant isolation', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const response = await request(app)
        .delete(`/api/scripts/${scriptResponse.body.id}`)
        .set('X-Tenant-Id', tenantId2);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/scripts/:scriptId/steps', () => {
    it('should add a step to a script', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const response = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({
          title: 'Step 1',
          description: 'First step',
          element_selector: '#button',
          action_type: 'click',
        });

      expect(response.status).toBe(201);
      expect(response.body.script_id).toBe(scriptId);
      expect(response.body.title).toBe('Step 1');
      expect(response.body.order_index).toBe(0);
    });

    it('should auto-increment order_index', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const response1 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      const response2 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 2' });

      expect(response1.body.order_index).toBe(0);
      expect(response2.body.order_index).toBe(1);
    });
  });

  describe('PUT /api/scripts/:scriptId/steps/:stepId', () => {
    it('should update a step', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const stepResponse = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      const stepId = stepResponse.body.id;

      const response = await request(app)
        .put(`/api/scripts/${scriptId}/steps/${stepId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Updated Step' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Step');
    });
  });

  describe('PATCH /api/scripts/:scriptId/steps/reorder', () => {
    it('should reorder steps', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const step1 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      const step2 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 2' });

      const step3 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 3' });

      // Reorder: [step3, step1, step2]
      const response = await request(app)
        .patch(`/api/scripts/${scriptId}/steps/reorder`)
        .set('X-Tenant-Id', tenantId1)
        .send({ stepIds: [step3.body.id, step1.body.id, step2.body.id] });

      expect(response.status).toBe(200);
      expect(response.body[0].id).toBe(step3.body.id);
      expect(response.body[0].order_index).toBe(0);
      expect(response.body[1].id).toBe(step1.body.id);
      expect(response.body[1].order_index).toBe(1);
      expect(response.body[2].id).toBe(step2.body.id);
      expect(response.body[2].order_index).toBe(2);
    });

    it('should validate all steps are included', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 2' });

      const response = await request(app)
        .patch(`/api/scripts/${scriptId}/steps/reorder`)
        .set('X-Tenant-Id', tenantId1)
        .send({ stepIds: ['fake-id'] });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/scripts/:scriptId/steps/:stepId', () => {
    it('should delete a step and renumber remaining', async () => {
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      const step1 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      const step2 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 2' });

      const step3 = await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 3' });

      // Delete step 2
      const response = await request(app)
        .delete(`/api/scripts/${scriptId}/steps/${step2.body.id}`)
        .set('X-Tenant-Id', tenantId1);

      expect(response.status).toBe(204);

      // Get script and verify remaining steps are renumbered
      const getResponse = await request(app)
        .get(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1);

      expect(getResponse.body.steps).toHaveLength(2);
      expect(getResponse.body.steps[0].id).toBe(step1.body.id);
      expect(getResponse.body.steps[0].order_index).toBe(0);
      expect(getResponse.body.steps[1].id).toBe(step3.body.id);
      expect(getResponse.body.steps[1].order_index).toBe(1);
    });
  });

  describe('CASCADE delete', () => {
    it('should cascade delete scripts when product is deleted', async () => {
      // Create script
      const scriptResponse = await request(app)
        .post(`/api/products/${product1Id}/scripts`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'My Script', type: 'walkthrough' });

      const scriptId = scriptResponse.body.id;

      // Add step
      await request(app)
        .post(`/api/scripts/${scriptId}/steps`)
        .set('X-Tenant-Id', tenantId1)
        .send({ title: 'Step 1' });

      // Delete product
      await request(app)
        .delete(`/api/products/${product1Id}`)
        .set('X-Tenant-Id', tenantId1);

      // Verify script is deleted
      const getResponse = await request(app)
        .get(`/api/scripts/${scriptId}`)
        .set('X-Tenant-Id', tenantId1);

      expect(getResponse.status).toBe(404);
    });
  });
});
