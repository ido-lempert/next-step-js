import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { tenantMiddleware } from '../middleware/tenant';
import { projectRouter } from './projects';
import { projectStore } from '../models/project-store';

describe('Project API Routes', () => {
  let app: Express;
  const tenantId1 = 'tenant-1';
  const tenantId2 = 'tenant-2';

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', tenantMiddleware, projectRouter);
  });

  beforeEach(() => {
    // Clear the store before each test
    const store = projectStore as any;
    store.projects.clear();
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({
          name: 'Test Project',
          description: 'Test Description',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Test Project',
        description: 'Test Description',
        tenant_id: tenantId1,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });

    it('should create a project without description', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({
          name: 'Test Project',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Project');
      expect(response.body.description).toBeUndefined();
    });

    it('should return 400 if name is missing', async () => {
      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({})
        .expect(400);
    });

    it('should return 400 if name is empty', async () => {
      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: '   ' })
        .expect(400);
    });

    it('should return 400 if name exceeds 255 characters', async () => {
      const longName = 'a'.repeat(256);
      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: longName })
        .expect(400);
    });

    it('should return 400 if tenant ID is missing', async () => {
      await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' })
        .expect(400);
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects for a tenant', async () => {
      // Create projects for tenant 1
      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Project 1' });

      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Project 2' });

      // Create project for tenant 2
      await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'Tenant 2 Project' });

      const response = await request(app)
        .get('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Project 1');
      expect(response.body[1].name).toBe('Project 2');
    });

    it('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 400 if tenant ID is missing', async () => {
      await request(app).get('/api/projects').expect(400);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a project by id', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe('Test Project');
    });

    it('should return 404 if project does not exist', async () => {
      await request(app)
        .get('/api/projects/non-existent-id')
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 404 if project belongs to different tenant', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId2)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Original Name', description: 'Original Description' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name', description: 'Updated Description' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated Description');
      expect(response.body.id).toBe(projectId);
    });

    it('should update only the name', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Original Name', description: 'Original Description' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Original Description');
    });

    it('should return 404 if project does not exist', async () => {
      await request(app)
        .put('/api/projects/non-existent-id')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 404 if project belongs to different tenant', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      await request(app)
        .put(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId2)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 400 if name is invalid', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      await request(app)
        .put(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .send({ name: '   ' })
        .expect(400);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(204);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 404 if project does not exist', async () => {
      await request(app)
        .delete('/api/projects/non-existent-id')
        .set('X-Tenant-Id', tenantId1)
        .expect(404);
    });

    it('should return 404 if project belongs to different tenant', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Tenant-Id', tenantId1)
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId2)
        .expect(404);

      // Verify project still exists for tenant 1
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('X-Tenant-Id', tenantId1)
        .expect(200);
    });
  });
});
