import { describe, it, expect, beforeEach } from 'vitest';
import { projectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../models/project';

describe('ProjectService - Multi-Tenant Isolation', () => {
  const tenant1 = 'tenant-1-uuid';
  const tenant2 = 'tenant-2-uuid';

  beforeEach(async () => {
    await projectService.clear();
  });

  describe('create', () => {
    it('should create a project for a tenant', async () => {
      const dto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
      };

      const project = await projectService.create(tenant1, dto);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.tenantId).toBe(tenant1);
      expect(project.name).toBe(dto.name);
      expect(project.description).toBe(dto.description);
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should create projects for different tenants', async () => {
      const dto1: CreateProjectDto = { name: 'Tenant 1 Project' };
      const dto2: CreateProjectDto = { name: 'Tenant 2 Project' };

      const project1 = await projectService.create(tenant1, dto1);
      const project2 = await projectService.create(tenant2, dto2);

      expect(project1.tenantId).toBe(tenant1);
      expect(project2.tenantId).toBe(tenant2);
    });
  });

  describe('findAllByTenant - Multi-Tenant Isolation', () => {
    it('should return only projects for the specified tenant', async () => {
      // Create projects for tenant1
      await projectService.create(tenant1, { name: 'Tenant 1 - Project A' });
      await projectService.create(tenant1, { name: 'Tenant 1 - Project B' });

      // Create projects for tenant2
      await projectService.create(tenant2, { name: 'Tenant 2 - Project X' });
      await projectService.create(tenant2, { name: 'Tenant 2 - Project Y' });

      // Tenant 1 should see only their projects
      const tenant1Projects = await projectService.findAllByTenant(tenant1);
      expect(tenant1Projects).toHaveLength(2);
      expect(tenant1Projects.every((p) => p.tenantId === tenant1)).toBe(true);

      // Tenant 2 should see only their projects
      const tenant2Projects = await projectService.findAllByTenant(tenant2);
      expect(tenant2Projects).toHaveLength(2);
      expect(tenant2Projects.every((p) => p.tenantId === tenant2)).toBe(true);
    });

    it('should return empty array for tenant with no projects', async () => {
      const projects = await projectService.findAllByTenant(tenant1);
      expect(projects).toEqual([]);
    });
  });

  describe('findOne - Multi-Tenant Isolation', () => {
    it('should return project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });
      const found = await projectService.findOne(created.id, tenant1);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });
      
      // Tenant 2 should NOT be able to access tenant 1's project
      const found = await projectService.findOne(created.id, tenant2);

      expect(found).toBeNull();
    });

    it('should return null when project does not exist', async () => {
      const found = await projectService.findOne('non-existent-id', tenant1);
      expect(found).toBeNull();
    });
  });

  describe('update - Multi-Tenant Isolation', () => {
    it('should update project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { 
        name: 'Original Name',
        description: 'Original Description',
      });

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      const dto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const updated = await projectService.update(created.id, tenant1, dto);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe(dto.name);
      expect(updated?.description).toBe(dto.description);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should NOT update project when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Original Name' });

      const dto: UpdateProjectDto = { name: 'Hacked Name' };
      
      // Tenant 2 should NOT be able to update tenant 1's project
      const updated = await projectService.update(created.id, tenant2, dto);

      expect(updated).toBeNull();

      // Verify original project is unchanged
      const original = await projectService.findOne(created.id, tenant1);
      expect(original?.name).toBe('Original Name');
    });

    it('should update only provided fields', async () => {
      const created = await projectService.create(tenant1, {
        name: 'Original Name',
        description: 'Original Description',
      });

      const dto: UpdateProjectDto = { name: 'Updated Name' };
      const updated = await projectService.update(created.id, tenant1, dto);

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Original Description');
    });
  });

  describe('delete - Multi-Tenant Isolation', () => {
    it('should delete project when tenant matches', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      const deleted = await projectService.delete(created.id, tenant1);

      expect(deleted).toBe(true);

      // Verify project is deleted
      const found = await projectService.findOne(created.id, tenant1);
      expect(found).toBeNull();
    });

    it('should NOT delete project when tenant does not match (CRITICAL SECURITY)', async () => {
      const created = await projectService.create(tenant1, { name: 'Test Project' });

      // Tenant 2 should NOT be able to delete tenant 1's project
      const deleted = await projectService.delete(created.id, tenant2);

      expect(deleted).toBe(false);

      // Verify project still exists for tenant 1
      const found = await projectService.findOne(created.id, tenant1);
      expect(found).toBeDefined();
    });

    it('should return false when project does not exist', async () => {
      const deleted = await projectService.delete('non-existent-id', tenant1);
      expect(deleted).toBe(false);
    });
  });
});
