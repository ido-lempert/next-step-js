import { describe, it, expect, beforeEach } from 'vitest';
import { scriptService } from '../services/script.service';
import { projectService } from '../services/project.service';
import { productService } from '../services/product.service';
import { CreateScriptDto, UpdateScriptDto } from '../models/script';

describe('ScriptService - Multi-Tenant Isolation', () => {
  const tenant1 = 'tenant-1-uuid';
  const tenant2 = 'tenant-2-uuid';
  let project1Id: string;
  let project2Id: string;
  let product1Id: string;
  let product2Id: string;

  beforeEach(async () => {
    await scriptService.clear();
    await productService.clear();
    await projectService.clear();

    // Setup projects
    const project1 = await projectService.create(tenant1, { name: 'Project 1' });
    const project2 = await projectService.create(tenant2, { name: 'Project 2' });
    project1Id = project1.id;
    project2Id = project2.id;

    // Setup products
    const product1 = await productService.create(project1Id, tenant1, { name: 'Product 1' });
    const product2 = await productService.create(project2Id, tenant2, { name: 'Product 2' });
    product1Id = product1!.id;
    product2Id = product2!.id;
  });

  describe('create', () => {
    it('should create a script for a product', async () => {
      const dto: CreateScriptDto = {
        name: 'Onboarding Tutorial',
        type: 'walkthrough',
      };

      const script = await scriptService.create(product1Id, tenant1, dto);

      expect(script).toBeDefined();
      expect(script!.id).toBeDefined();
      expect(script!.productId).toBe(product1Id);
      expect(script!.name).toBe(dto.name);
      expect(script!.type).toBe(dto.type);
      expect(script!.status).toBe('draft');
      expect(script!.createdAt).toBeInstanceOf(Date);
      expect(script!.updatedAt).toBeInstanceOf(Date);
    });

    it('should not create script for non-existent product', async () => {
      const dto: CreateScriptDto = {
        name: 'Test Script',
        type: 'modal',
      };

      const script = await scriptService.create('non-existent-id', tenant1, dto);

      expect(script).toBeNull();
    });

    it('should not create script for product owned by different tenant', async () => {
      const dto: CreateScriptDto = {
        name: 'Test Script',
        type: 'walkthrough',
      };

      // Try to create script for product2 using tenant1 credentials
      const script = await scriptService.create(product2Id, tenant1, dto);

      expect(script).toBeNull();
    });
  });

  describe('findAllByProduct - Multi-Tenant Isolation', () => {
    it('should return all scripts for a product', async () => {
      await scriptService.create(product1Id, tenant1, { name: 'Script 1', type: 'walkthrough' });
      await scriptService.create(product1Id, tenant1, { name: 'Script 2', type: 'modal' });

      const scripts = await scriptService.findAllByProduct(product1Id, tenant1);

      expect(scripts).toHaveLength(2);
      expect(scripts!.every((s) => s.productId === product1Id)).toBe(true);
    });

    it('should not return scripts from different products', async () => {
      await scriptService.create(product1Id, tenant1, { name: 'Product 1 Script', type: 'walkthrough' });
      await scriptService.create(product2Id, tenant2, { name: 'Product 2 Script', type: 'modal' });

      const scripts = await scriptService.findAllByProduct(product1Id, tenant1);

      expect(scripts).toHaveLength(1);
      expect(scripts![0].name).toBe('Product 1 Script');
    });

    it('should not return scripts for product owned by different tenant', async () => {
      await scriptService.create(product2Id, tenant2, { name: 'Script', type: 'walkthrough' });

      // Try to access product2's scripts using tenant1 credentials
      const scripts = await scriptService.findAllByProduct(product2Id, tenant1);

      expect(scripts).toBeNull();
    });
  });

  describe('findOne - Multi-Tenant Isolation', () => {
    it('should return script with correct tenant ownership', async () => {
      const created = await scriptService.create(product1Id, tenant1, { name: 'Test Script', type: 'walkthrough' });

      const script = await scriptService.findOne(created!.id, tenant1);

      expect(script).toBeDefined();
      expect(script!.id).toBe(created!.id);
    });

    it('should not return script owned by different tenant', async () => {
      const created = await scriptService.create(product2Id, tenant2, { name: 'Script', type: 'modal' });

      // Try to access tenant2's script using tenant1 credentials
      const script = await scriptService.findOne(created!.id, tenant1);

      expect(script).toBeNull();
    });

    it('should return null for non-existent script', async () => {
      const script = await scriptService.findOne('non-existent-id', tenant1);

      expect(script).toBeNull();
    });
  });

  describe('update', () => {
    it('should update script name and type', async () => {
      const created = await scriptService.create(product1Id, tenant1, { name: 'Original', type: 'walkthrough' });

      const dto: UpdateScriptDto = {
        name: 'Updated Name',
        type: 'modal',
      };

      const updated = await scriptService.update(created!.id, tenant1, dto);

      expect(updated).toBeDefined();
      expect(updated!.name).toBe(dto.name);
      expect(updated!.type).toBe(dto.type);
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(created!.createdAt.getTime());
    });

    it('should not update script owned by different tenant', async () => {
      const created = await scriptService.create(product2Id, tenant2, { name: 'Script', type: 'walkthrough' });

      const dto: UpdateScriptDto = { name: 'Hacked Name' };

      // Try to update tenant2's script using tenant1 credentials
      const updated = await scriptService.update(created!.id, tenant1, dto);

      expect(updated).toBeNull();
    });
  });

  describe('publish and unpublish', () => {
    it('should publish a draft script', async () => {
      const created = await scriptService.create(product1Id, tenant1, { name: 'Script', type: 'walkthrough' });

      expect(created!.status).toBe('draft');

      const published = await scriptService.publish(created!.id, tenant1);

      expect(published).toBeDefined();
      expect(published!.status).toBe('published');
    });

    it('should unpublish a published script', async () => {
      const created = await scriptService.create(product1Id, tenant1, { name: 'Script', type: 'modal' });
      const published = await scriptService.publish(created!.id, tenant1);

      expect(published!.status).toBe('published');

      const unpublished = await scriptService.unpublish(published!.id, tenant1);

      expect(unpublished).toBeDefined();
      expect(unpublished!.status).toBe('draft');
    });

    it('should not publish script owned by different tenant', async () => {
      const created = await scriptService.create(product2Id, tenant2, { name: 'Script', type: 'walkthrough' });

      // Try to publish tenant2's script using tenant1 credentials
      const published = await scriptService.publish(created!.id, tenant1);

      expect(published).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete script', async () => {
      const created = await scriptService.create(product1Id, tenant1, { name: 'Script', type: 'walkthrough' });

      const deleted = await scriptService.delete(created!.id, tenant1);

      expect(deleted).toBe(true);

      const found = await scriptService.findOne(created!.id, tenant1);
      expect(found).toBeNull();
    });

    it('should not delete script owned by different tenant', async () => {
      const created = await scriptService.create(product2Id, tenant2, { name: 'Script', type: 'modal' });

      // Try to delete tenant2's script using tenant1 credentials
      const deleted = await scriptService.delete(created!.id, tenant1);

      expect(deleted).toBe(false);

      // Verify script still exists for tenant2
      const found = await scriptService.findOne(created!.id, tenant2);
      expect(found).toBeDefined();
    });
  });

  describe('deleteByProduct - Cascade Delete', () => {
    it('should delete all scripts when product is deleted', async () => {
      const script1 = await scriptService.create(product1Id, tenant1, { name: 'Script 1', type: 'walkthrough' });
      const script2 = await scriptService.create(product1Id, tenant1, { name: 'Script 2', type: 'modal' });

      await scriptService.deleteByProduct(product1Id);

      const found1 = await scriptService.findOne(script1!.id, tenant1);
      const found2 = await scriptService.findOne(script2!.id, tenant1);

      expect(found1).toBeNull();
      expect(found2).toBeNull();
    });
  });
});
