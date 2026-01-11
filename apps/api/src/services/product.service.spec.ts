import { productService } from './product.service';
import { projectService } from './project.service';

describe('ProductService', () => {
  const tenantId1 = 'tenant-1';
  const tenantId2 = 'tenant-2';
  let projectId1: string;
  let projectId2: string;

  beforeEach(async () => {
    // Clear all data before each test
    await productService.clear();
    await projectService.clear();

    // Create test projects
    const project1 = await projectService.create(tenantId1, {
      name: 'Test Project 1',
      description: 'Project for tenant 1',
    });
    const project2 = await projectService.create(tenantId2, {
      name: 'Test Project 2',
      description: 'Project for tenant 2',
    });

    projectId1 = project1.id;
    projectId2 = project2.id;
  });

  afterEach(async () => {
    await productService.clear();
    await projectService.clear();
  });

  describe('create', () => {
    it('should create a product for a valid project', async () => {
      const dto = {
        name: 'Test Product',
        description: 'Test product description',
      };

      const product = await productService.create(projectId1, tenantId1, dto);

      expect(product).toBeDefined();
      expect(product?.id).toBeDefined();
      expect(product?.projectId).toBe(projectId1);
      expect(product?.name).toBe(dto.name);
      expect(product?.description).toBe(dto.description);
      expect(product?.createdAt).toBeInstanceOf(Date);
      expect(product?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent project', async () => {
      const dto = {
        name: 'Test Product',
      };

      const product = await productService.create('non-existent', tenantId1, dto);

      expect(product).toBeNull();
    });

    it('should return null when project belongs to different tenant', async () => {
      const dto = {
        name: 'Test Product',
      };

      // Try to create product in tenant2's project using tenant1's context
      const product = await productService.create(projectId2, tenantId1, dto);

      expect(product).toBeNull();
    });
  });

  describe('findAllByProject', () => {
    it('should return all products for a project', async () => {
      await productService.create(projectId1, tenantId1, { name: 'Product 1' });
      await productService.create(projectId1, tenantId1, { name: 'Product 2' });

      const products = await productService.findAllByProject(projectId1, tenantId1);

      expect(products).toHaveLength(2);
      expect(products?.[0].name).toBe('Product 1');
      expect(products?.[1].name).toBe('Product 2');
    });

    it('should return empty array when project has no products', async () => {
      const products = await productService.findAllByProject(projectId1, tenantId1);

      expect(products).toEqual([]);
    });

    it('should return null for non-existent project', async () => {
      const products = await productService.findAllByProject('non-existent', tenantId1);

      expect(products).toBeNull();
    });

    it('should return null when project belongs to different tenant', async () => {
      const products = await productService.findAllByProject(projectId2, tenantId1);

      expect(products).toBeNull();
    });

    it('should not return products from other projects', async () => {
      await productService.create(projectId1, tenantId1, { name: 'Project 1 Product' });
      
      const project3 = await projectService.create(tenantId1, {
        name: 'Project 3',
      });
      await productService.create(project3.id, tenantId1, { name: 'Project 3 Product' });

      const products = await productService.findAllByProject(projectId1, tenantId1);

      expect(products).toHaveLength(1);
      expect(products?.[0].name).toBe('Project 1 Product');
    });
  });

  describe('findOne', () => {
    it('should find a product by id', async () => {
      const created = await productService.create(projectId1, tenantId1, {
        name: 'Test Product',
      });

      const product = await productService.findOne(created!.id, tenantId1);

      expect(product).toBeDefined();
      expect(product?.id).toBe(created?.id);
      expect(product?.name).toBe('Test Product');
    });

    it('should return null for non-existent product', async () => {
      const product = await productService.findOne('non-existent', tenantId1);

      expect(product).toBeNull();
    });

    it('should return null when product belongs to different tenant', async () => {
      const created = await productService.create(projectId2, tenantId2, {
        name: 'Tenant 2 Product',
      });

      // Try to access tenant2's product as tenant1
      const product = await productService.findOne(created!.id, tenantId1);

      expect(product).toBeNull();
    });
  });

  describe('update', () => {
    it('should update product name', async () => {
      const created = await productService.create(projectId1, tenantId1, {
        name: 'Original Name',
      });

      const updated = await productService.update(created!.id, tenantId1, {
        name: 'Updated Name',
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBeUndefined();
    });

    it('should update product description', async () => {
      const created = await productService.create(projectId1, tenantId1, {
        name: 'Test Product',
        description: 'Original description',
      });

      const updated = await productService.update(created!.id, tenantId1, {
        description: 'Updated description',
      });

      expect(updated?.name).toBe('Test Product');
      expect(updated?.description).toBe('Updated description');
    });

    it('should return null for non-existent product', async () => {
      const updated = await productService.update('non-existent', tenantId1, {
        name: 'Updated Name',
      });

      expect(updated).toBeNull();
    });

    it('should return null when product belongs to different tenant', async () => {
      const created = await productService.create(projectId2, tenantId2, {
        name: 'Tenant 2 Product',
      });

      // Try to update tenant2's product as tenant1
      const updated = await productService.update(created!.id, tenantId1, {
        name: 'Hacked Name',
      });

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const created = await productService.create(projectId1, tenantId1, {
        name: 'Test Product',
      });

      const deleted = await productService.delete(created!.id, tenantId1);

      expect(deleted).toBe(true);

      const product = await productService.findOne(created!.id, tenantId1);
      expect(product).toBeNull();
    });

    it('should return false for non-existent product', async () => {
      const deleted = await productService.delete('non-existent', tenantId1);

      expect(deleted).toBe(false);
    });

    it('should return false when product belongs to different tenant', async () => {
      const created = await productService.create(projectId2, tenantId2, {
        name: 'Tenant 2 Product',
      });

      // Try to delete tenant2's product as tenant1
      const deleted = await productService.delete(created!.id, tenantId1);

      expect(deleted).toBe(false);

      // Verify product still exists
      const product = await productService.findOne(created!.id, tenantId2);
      expect(product).toBeDefined();
    });
  });

  describe('deleteByProject', () => {
    it('should delete all products for a project', async () => {
      const product1 = await productService.create(projectId1, tenantId1, {
        name: 'Product 1',
      });
      const product2 = await productService.create(projectId1, tenantId1, {
        name: 'Product 2',
      });

      await productService.deleteByProject(projectId1);

      const check1 = await productService.findOne(product1!.id, tenantId1);
      const check2 = await productService.findOne(product2!.id, tenantId1);

      expect(check1).toBeNull();
      expect(check2).toBeNull();
    });

    it('should not delete products from other projects', async () => {
      await productService.create(projectId1, tenantId1, { name: 'Project 1 Product' });
      
      const project3 = await projectService.create(tenantId1, {
        name: 'Project 3',
      });
      const product3 = await productService.create(project3.id, tenantId1, {
        name: 'Project 3 Product',
      });

      await productService.deleteByProject(projectId1);

      const check = await productService.findOne(product3!.id, tenantId1);
      expect(check).toBeDefined();
    });
  });
});
