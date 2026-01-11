import { describe, it, expect, beforeEach } from 'vitest';
import { scriptStepService } from '../services/script-step.service';
import { scriptService } from '../services/script.service';
import { productService } from '../services/product.service';
import { projectService } from '../services/project.service';
import { CreateScriptStepDto, UpdateScriptStepDto } from '../models/script-step';

describe('ScriptStepService - Step Management', () => {
  const tenant1 = 'tenant-1-uuid';
  const tenant2 = 'tenant-2-uuid';
  let project1Id: string;
  let project2Id: string;
  let product1Id: string;
  let product2Id: string;
  let script1Id: string;
  let script2Id: string;

  beforeEach(async () => {
    await scriptStepService.clear();
    await scriptService.clear();
    await productService.clear();
    await projectService.clear();

    // Setup hierarchy
    const project1 = await projectService.create(tenant1, { name: 'Project 1' });
    const project2 = await projectService.create(tenant2, { name: 'Project 2' });
    project1Id = project1.id;
    project2Id = project2.id;

    const product1 = await productService.create(project1Id, tenant1, { name: 'Product 1' });
    const product2 = await productService.create(project2Id, tenant2, { name: 'Product 2' });
    product1Id = product1!.id;
    product2Id = product2!.id;

    const script1 = await scriptService.create(product1Id, tenant1, { name: 'Script 1', type: 'walkthrough' });
    const script2 = await scriptService.create(product2Id, tenant2, { name: 'Script 2', type: 'modal' });
    script1Id = script1!.id;
    script2Id = script2!.id;
  });

  describe('create', () => {
    it('should create a step with auto-incremented order index', async () => {
      const dto: CreateScriptStepDto = {
        title: 'Step 1',
        description: 'Click the button',
        elementSelector: '#submit-btn',
        actionType: 'click',
      };

      const step = await scriptStepService.create(script1Id, tenant1, dto);

      expect(step).toBeDefined();
      expect(step!.id).toBeDefined();
      expect(step!.scriptId).toBe(script1Id);
      expect(step!.orderIndex).toBe(0);
      expect(step!.title).toBe(dto.title);
      expect(step!.description).toBe(dto.description);
      expect(step!.elementSelector).toBe(dto.elementSelector);
      expect(step!.actionType).toBe(dto.actionType);
    });

    it('should auto-increment order index for multiple steps', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'Desc 1' });
      const step2 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Desc 2' });
      const step3 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 3', description: 'Desc 3' });

      expect(step1!.orderIndex).toBe(0);
      expect(step2!.orderIndex).toBe(1);
      expect(step3!.orderIndex).toBe(2);
    });

    it('should not create step for script owned by different tenant', async () => {
      const dto: CreateScriptStepDto = {
        title: 'Hacked Step',
        description: 'This should fail',
      };

      // Try to create step for script2 using tenant1 credentials
      const step = await scriptStepService.create(script2Id, tenant1, dto);

      expect(step).toBeNull();
    });
  });

  describe('findAllByScript - Ordered Steps', () => {
    it('should return steps ordered by order index', async () => {
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Second' });
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 3', description: 'Third' });

      const steps = await scriptStepService.findAllByScript(script1Id, tenant1);

      expect(steps).toHaveLength(3);
      expect(steps![0].orderIndex).toBe(0);
      expect(steps![1].orderIndex).toBe(1);
      expect(steps![2].orderIndex).toBe(2);
    });

    it('should not return steps for script owned by different tenant', async () => {
      await scriptStepService.create(script2Id, tenant2, { title: 'Step', description: 'Desc' });

      // Try to access script2's steps using tenant1 credentials
      const steps = await scriptStepService.findAllByScript(script2Id, tenant1);

      expect(steps).toBeNull();
    });
  });

  describe('update', () => {
    it('should update step properties', async () => {
      const created = await scriptStepService.create(script1Id, tenant1, {
        title: 'Original',
        description: 'Original description',
        elementSelector: '#old',
      });

      const dto: UpdateScriptStepDto = {
        title: 'Updated',
        description: 'Updated description',
        elementSelector: '#new',
        actionType: 'hover',
      };

      const updated = await scriptStepService.update(created!.id, tenant1, dto);

      expect(updated).toBeDefined();
      expect(updated!.title).toBe(dto.title);
      expect(updated!.description).toBe(dto.description);
      expect(updated!.elementSelector).toBe(dto.elementSelector);
      expect(updated!.actionType).toBe(dto.actionType);
    });

    it('should not update step owned by different tenant', async () => {
      const created = await scriptStepService.create(script2Id, tenant2, { title: 'Step', description: 'Desc' });

      const dto: UpdateScriptStepDto = { title: 'Hacked' };

      // Try to update tenant2's step using tenant1 credentials
      const updated = await scriptStepService.update(created!.id, tenant1, dto);

      expect(updated).toBeNull();
    });
  });

  describe('reorder - Atomic Operation', () => {
    it('should reorder steps correctly', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      const step2 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Second' });
      const step3 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 3', description: 'Third' });

      // Reorder: 3, 1, 2
      const stepIds = [step3!.id, step1!.id, step2!.id];
      const reordered = await scriptStepService.reorder(script1Id, tenant1, stepIds);

      expect(reordered).toHaveLength(3);
      expect(reordered![0].id).toBe(step3!.id);
      expect(reordered![0].orderIndex).toBe(0);
      expect(reordered![1].id).toBe(step1!.id);
      expect(reordered![1].orderIndex).toBe(1);
      expect(reordered![2].id).toBe(step2!.id);
      expect(reordered![2].orderIndex).toBe(2);
    });

    it('should handle reverse order', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'A', description: 'First' });
      const step2 = await scriptStepService.create(script1Id, tenant1, { title: 'B', description: 'Second' });
      const step3 = await scriptStepService.create(script1Id, tenant1, { title: 'C', description: 'Third' });

      // Reverse order
      const stepIds = [step3!.id, step2!.id, step1!.id];
      const reordered = await scriptStepService.reorder(script1Id, tenant1, stepIds);

      expect(reordered![0].title).toBe('C');
      expect(reordered![1].title).toBe('B');
      expect(reordered![2].title).toBe('A');
    });

    it('should not reorder steps with invalid step IDs', async () => {
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });

      const reordered = await scriptStepService.reorder(script1Id, tenant1, ['invalid-id']);

      expect(reordered).toBeNull();
    });

    it('should not reorder steps from different script', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      const step2 = await scriptStepService.create(script2Id, tenant2, { title: 'Step 2', description: 'Second' });

      // Try to reorder script1 with step from script2
      const reordered = await scriptStepService.reorder(script1Id, tenant1, [step1!.id, step2!.id]);

      expect(reordered).toBeNull();
    });
  });

  describe('delete - Auto-Renumber', () => {
    it('should delete step and renumber remaining steps', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      const step2 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Second' });
      const step3 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 3', description: 'Third' });

      // Delete middle step
      const deleted = await scriptStepService.delete(step2!.id, tenant1);

      expect(deleted).toBe(true);

      const remaining = await scriptStepService.findAllByScript(script1Id, tenant1);

      expect(remaining).toHaveLength(2);
      expect(remaining![0].id).toBe(step1!.id);
      expect(remaining![0].orderIndex).toBe(0);
      expect(remaining![1].id).toBe(step3!.id);
      expect(remaining![1].orderIndex).toBe(1); // Renumbered from 2 to 1
    });

    it('should not delete step owned by different tenant', async () => {
      const created = await scriptStepService.create(script2Id, tenant2, { title: 'Step', description: 'Desc' });

      // Try to delete tenant2's step using tenant1 credentials
      const deleted = await scriptStepService.delete(created!.id, tenant1);

      expect(deleted).toBe(false);

      // Verify step still exists for tenant2
      const found = await scriptStepService.findOne(created!.id, tenant2);
      expect(found).toBeDefined();
    });
  });

  describe('deleteByScript - Cascade Delete', () => {
    it('should delete all steps when script is deleted', async () => {
      const step1 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      const step2 = await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Second' });

      await scriptStepService.deleteByScript(script1Id);

      const found1 = await scriptStepService.findOne(step1!.id, tenant1);
      const found2 = await scriptStepService.findOne(step2!.id, tenant1);

      expect(found1).toBeNull();
      expect(found2).toBeNull();
    });
  });

  describe('countByScript', () => {
    it('should count steps for a script', async () => {
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 1', description: 'First' });
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 2', description: 'Second' });
      await scriptStepService.create(script1Id, tenant1, { title: 'Step 3', description: 'Third' });

      const count = await scriptStepService.countByScript(script1Id);

      expect(count).toBe(3);
    });

    it('should return 0 for script with no steps', async () => {
      const count = await scriptStepService.countByScript(script1Id);

      expect(count).toBe(0);
    });
  });
});
