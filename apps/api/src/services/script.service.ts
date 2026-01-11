import { Script, CreateScriptDto, UpdateScriptDto } from '../models/script';
import { randomUUID } from 'crypto';
import { productService } from './product.service';

class InMemoryScriptService {
  private scripts: Map<string, Script> = new Map();

  /**
   * Create a new script for a product
   */
  async create(productId: string, tenantId: string, dto: CreateScriptDto): Promise<Script | null> {
    // Verify product exists and belongs to tenant
    const product = await productService.findOne(productId, tenantId);
    if (!product) {
      return null;
    }

    const script: Script = {
      id: randomUUID(),
      productId,
      name: dto.name,
      type: dto.type,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.scripts.set(script.id, script);
    return script;
  }

  /**
   * Get all scripts for a product (with tenant verification)
   */
  async findAllByProduct(productId: string, tenantId: string): Promise<Script[] | null> {
    // Verify product exists and belongs to tenant
    const product = await productService.findOne(productId, tenantId);
    if (!product) {
      return null;
    }

    const scripts = Array.from(this.scripts.values()).filter(
      (s) => s.productId === productId
    );
    return scripts;
  }

  /**
   * Get a single script by ID and verify tenant ownership through product→project chain
   */
  async findOne(id: string, tenantId: string): Promise<Script | null> {
    const script = this.scripts.get(id);
    if (!script) {
      return null;
    }

    // Verify script's product belongs to tenant
    const product = await productService.findOne(script.productId, tenantId);
    if (!product) {
      return null;
    }

    return script;
  }

  /**
   * Update a script (with tenant verification through product→project chain)
   */
  async update(
    id: string,
    tenantId: string,
    dto: UpdateScriptDto
  ): Promise<Script | null> {
    const script = await this.findOne(id, tenantId);
    if (!script) {
      return null;
    }

    const updatedScript: Script = {
      ...script,
      name: dto.name ?? script.name,
      type: dto.type ?? script.type,
      updatedAt: new Date(),
    };

    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  /**
   * Publish a script (change status from draft to published)
   */
  async publish(id: string, tenantId: string): Promise<Script | null> {
    const script = await this.findOne(id, tenantId);
    if (!script) {
      return null;
    }

    const updatedScript: Script = {
      ...script,
      status: 'published',
      updatedAt: new Date(),
    };

    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  /**
   * Unpublish a script (change status from published to draft)
   */
  async unpublish(id: string, tenantId: string): Promise<Script | null> {
    const script = await this.findOne(id, tenantId);
    if (!script) {
      return null;
    }

    const updatedScript: Script = {
      ...script,
      status: 'draft',
      updatedAt: new Date(),
    };

    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  /**
   * Delete a script (with tenant verification through product→project chain)
   * Also cascade deletes all steps
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const script = await this.findOne(id, tenantId);
    if (!script) {
      return false;
    }

    // Import here to avoid circular dependency
    const { scriptStepService } = await import('./script-step.service');
    
    // Cascade delete steps
    await scriptStepService.deleteByScript(id);

    this.scripts.delete(id);
    return true;
  }

  /**
   * Delete all scripts for a product (used when product is deleted)
   * Also cascade deletes all steps
   */
  async deleteByProduct(productId: string): Promise<void> {
    const scriptsToDelete = Array.from(this.scripts.values()).filter(
      (s) => s.productId === productId
    );
    
    // Import here to avoid circular dependency
    const { scriptStepService } = await import('./script-step.service');
    
    for (const script of scriptsToDelete) {
      // Cascade delete steps
      await scriptStepService.deleteByScript(script.id);
      this.scripts.delete(script.id);
    }
  }

  /**
   * Clear all scripts (for testing)
   */
  async clear(): Promise<void> {
    this.scripts.clear();
  }
}

// Singleton instance
export const scriptService = new InMemoryScriptService();
