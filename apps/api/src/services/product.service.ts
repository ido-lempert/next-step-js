import { Product, CreateProductDto, UpdateProductDto } from '../models/product';
import { randomUUID } from 'crypto';
import { projectService } from './project.service';

class InMemoryProductService {
  private products: Map<string, Product> = new Map();

  /**
   * Create a new product for a project
   */
  async create(projectId: string, tenantId: string, dto: CreateProductDto): Promise<Product | null> {
    // Verify project exists and belongs to tenant
    const project = await projectService.findOne(projectId, tenantId);
    if (!project) {
      return null;
    }

    const product: Product = {
      id: randomUUID(),
      projectId,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.set(product.id, product);
    return product;
  }

  /**
   * Get all products for a project (with tenant verification)
   */
  async findAllByProject(projectId: string, tenantId: string): Promise<Product[] | null> {
    // Verify project exists and belongs to tenant
    const project = await projectService.findOne(projectId, tenantId);
    if (!project) {
      return null;
    }

    const products = Array.from(this.products.values()).filter(
      (p) => p.projectId === projectId
    );
    return products;
  }

  /**
   * Get a single product by ID and verify tenant ownership through project
   */
  async findOne(id: string, tenantId: string): Promise<Product | null> {
    const product = this.products.get(id);
    if (!product) {
      return null;
    }

    // Verify product's project belongs to tenant
    const project = await projectService.findOne(product.projectId, tenantId);
    if (!project) {
      return null;
    }

    return product;
  }

  /**
   * Update a product (with tenant verification through project)
   */
  async update(
    id: string,
    tenantId: string,
    dto: UpdateProductDto
  ): Promise<Product | null> {
    const product = await this.findOne(id, tenantId);
    if (!product) {
      return null;
    }

    const updatedProduct: Product = {
      ...product,
      name: dto.name ?? product.name,
      description: dto.description !== undefined ? dto.description : product.description,
      updatedAt: new Date(),
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  /**
   * Delete a product (with tenant verification through project)
   * Note: This will also cascade delete all scripts
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const product = await this.findOne(id, tenantId);
    if (!product) {
      return false;
    }

    // Import here to avoid circular dependency
    const { scriptService } = await import('./script.service');
    
    // Cascade delete scripts
    await scriptService.deleteByProduct(id);

    this.products.delete(id);
    return true;
  }

  /**
   * Delete all products for a project (used when project is deleted)
   */
  async deleteByProject(projectId: string): Promise<void> {
    const productsToDelete = Array.from(this.products.values()).filter(
      (p) => p.projectId === projectId
    );
    
    productsToDelete.forEach(product => {
      this.products.delete(product.id);
    });
  }

  /**
   * Clear all products (for testing)
   */
  async clear(): Promise<void> {
    this.products.clear();
  }
}

// Singleton instance
export const productService = new InMemoryProductService();
