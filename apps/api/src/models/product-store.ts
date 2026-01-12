import { Product } from '../types/product';
import { scriptStore } from './script-store';

class ProductStore {
  private products: Map<string, Product> = new Map();

  create(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  findByProjectId(projectId: string): Product[] {
    return Array.from(this.products.values()).filter(
      (product) => product.project_id === projectId
    );
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  update(id: string, updates: Partial<Product>): Product | undefined {
    const product = this.findById(id);
    if (!product) {
      return undefined;
    }

    const updatedProduct = {
      ...product,
      ...updates,
      id: product.id,
      project_id: product.project_id,
      created_at: product.created_at,
      updated_at: new Date(),
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  delete(id: string): boolean {
    // CASCADE delete: delete all scripts belonging to this product
    scriptStore.deleteByProductId(id);
    
    return this.products.delete(id);
  }

  deleteByProjectId(projectId: string): number {
    const productsToDelete = this.findByProjectId(projectId);
    let deletedCount = 0;
    
    for (const product of productsToDelete) {
      if (this.products.delete(product.id)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}

export const productStore = new ProductStore();
