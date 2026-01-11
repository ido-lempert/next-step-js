import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { projectService } from '../services/project.service';

describe('ProjectController', () => {
  const tenant1 = 'tenant-1-uuid';
  const tenant2 = 'tenant-2-uuid';

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await projectService.clear();

    jsonMock = vi.fn();
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({
      json: jsonMock,
      send: sendMock,
    });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      mockRequest = {
        tenantId: tenant1,
        body: {
          name: 'Test Project',
          description: 'Test Description',
        },
      };

      await createProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          tenantId: tenant1,
          name: 'Test Project',
          description: 'Test Description',
        })
      );
    });
  });

  describe('getProjects - Multi-Tenant Isolation', () => {
    it('should return only projects for the authenticated tenant', async () => {
      // Create projects for tenant1
      await projectService.create(tenant1, { name: 'Tenant 1 - Project A' });
      await projectService.create(tenant1, { name: 'Tenant 1 - Project B' });

      // Create projects for tenant2
      await projectService.create(tenant2, { name: 'Tenant 2 - Project X' });

      // Tenant 1 requests their projects
      mockRequest = { tenantId: tenant1 };
      await getProjects(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ tenantId: tenant1 }),
        ])
      );

      const returnedProjects = jsonMock.mock.calls[0][0];
      expect(returnedProjects).toHaveLength(2);
      expect(returnedProjects.every((p: any) => p.tenantId === tenant1)).toBe(true);
    });
  });

  describe('getProject - Multi-Tenant Isolation', () => {
    it('should return project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      mockRequest = {
        tenantId: tenant1,
        params: { id: created.id },
      };

      await getProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: created.id,
          tenantId: tenant1,
        })
      );
    });

    it('should return 404 when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      // Tenant 2 tries to access tenant 1's project
      mockRequest = {
        tenantId: tenant2,
        params: { id: created.id },
      };

      await getProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Not Found',
        })
      );
    });
  });

  describe('updateProject - Multi-Tenant Isolation', () => {
    it('should update project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { name: 'Original Name' });

      mockRequest = {
        tenantId: tenant1,
        params: { id: created.id },
        body: { name: 'Updated Name' },
      };

      await updateProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: created.id,
          name: 'Updated Name',
        })
      );
    });

    it('should return 404 when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Original Name' });

      // Tenant 2 tries to update tenant 1's project
      mockRequest = {
        tenantId: tenant2,
        params: { id: created.id },
        body: { name: 'Hacked Name' },
      };

      await updateProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);

      // Verify original project is unchanged
      const original = await projectService.findOne(created.id, tenant1);
      expect(original?.name).toBe('Original Name');
    });
  });

  describe('deleteProject - Multi-Tenant Isolation', () => {
    it('should delete project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      mockRequest = {
        tenantId: tenant1,
        params: { id: created.id },
      };

      await deleteProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should return 404 when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      // Tenant 2 tries to delete tenant 1's project
      mockRequest = {
        tenantId: tenant2,
        params: { id: created.id },
      };

      await deleteProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);

      // Verify project still exists for tenant 1
      const original = await projectService.findOne(created.id, tenant1);
      expect(original).toBeDefined();
    });
  });
});
