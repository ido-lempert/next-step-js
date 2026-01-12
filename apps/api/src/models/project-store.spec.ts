import { describe, it, expect, beforeEach } from 'vitest';
import { projectStore } from './project-store';
import { Project } from '../types/project';

describe('ProjectStore', () => {
  const tenantId1 = 'tenant-1';
  const tenantId2 = 'tenant-2';

  beforeEach(() => {
    // Clear the store before each test
    const store = projectStore as any;
    store.projects.clear();
  });

  describe('create', () => {
    it('should create a project', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const created = projectStore.create(project);
      expect(created).toEqual(project);
    });
  });

  describe('findAll', () => {
    it('should return all projects for a tenant', () => {
      const project1: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Project 1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const project2: Project = {
        id: 'project-2',
        tenant_id: tenantId1,
        name: 'Project 2',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project1);
      projectStore.create(project2);

      const projects = projectStore.findAll(tenantId1);
      expect(projects).toHaveLength(2);
      expect(projects).toContainEqual(project1);
      expect(projects).toContainEqual(project2);
    });

    it('should return empty array when no projects exist', () => {
      const projects = projectStore.findAll(tenantId1);
      expect(projects).toEqual([]);
    });

    it('should only return projects for the specified tenant', () => {
      const project1: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Tenant 1 Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const project2: Project = {
        id: 'project-2',
        tenant_id: tenantId2,
        name: 'Tenant 2 Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project1);
      projectStore.create(project2);

      const tenant1Projects = projectStore.findAll(tenantId1);
      expect(tenant1Projects).toHaveLength(1);
      expect(tenant1Projects[0].id).toBe('project-1');

      const tenant2Projects = projectStore.findAll(tenantId2);
      expect(tenant2Projects).toHaveLength(1);
      expect(tenant2Projects[0].id).toBe('project-2');
    });
  });

  describe('findById', () => {
    it('should find a project by id for the correct tenant', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project);

      const found = projectStore.findById('project-1', tenantId1);
      expect(found).toEqual(project);
    });

    it('should return undefined if project does not exist', () => {
      const found = projectStore.findById('non-existent', tenantId1);
      expect(found).toBeUndefined();
    });

    it('should return undefined if project belongs to different tenant', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project);

      const found = projectStore.findById('project-1', tenantId2);
      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a project', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Original Name',
        description: 'Original Description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      projectStore.create(project);

      const updated = projectStore.update('project-1', tenantId1, {
        name: 'Updated Name',
        description: 'Updated Description',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.description).toBe('Updated Description');
      expect(updated!.id).toBe('project-1');
      expect(updated!.tenant_id).toBe(tenantId1);
      expect(updated!.created_at).toEqual(new Date('2024-01-01'));
      expect(updated!.updated_at.getTime()).toBeGreaterThan(project.updated_at.getTime());
    });

    it('should return undefined if project does not exist', () => {
      const updated = projectStore.update('non-existent', tenantId1, {
        name: 'New Name',
      });
      expect(updated).toBeUndefined();
    });

    it('should return undefined if project belongs to different tenant', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project);

      const updated = projectStore.update('project-1', tenantId2, {
        name: 'Updated Name',
      });
      expect(updated).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a project', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project);

      const deleted = projectStore.delete('project-1', tenantId1);
      expect(deleted).toBe(true);

      const found = projectStore.findById('project-1', tenantId1);
      expect(found).toBeUndefined();
    });

    it('should return false if project does not exist', () => {
      const deleted = projectStore.delete('non-existent', tenantId1);
      expect(deleted).toBe(false);
    });

    it('should return false if project belongs to different tenant', () => {
      const project: Project = {
        id: 'project-1',
        tenant_id: tenantId1,
        name: 'Test Project',
        created_at: new Date(),
        updated_at: new Date(),
      };

      projectStore.create(project);

      const deleted = projectStore.delete('project-1', tenantId2);
      expect(deleted).toBe(false);

      // Verify project still exists
      const found = projectStore.findById('project-1', tenantId1);
      expect(found).toBeDefined();
    });
  });
});
