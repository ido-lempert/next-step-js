import { ScriptStep, CreateScriptStepDto, UpdateScriptStepDto } from '../models/script-step';
import { randomUUID } from 'crypto';
import { scriptService } from './script.service';

class InMemoryScriptStepService {
  private steps: Map<string, ScriptStep> = new Map();

  /**
   * Create a new step for a script
   */
  async create(scriptId: string, tenantId: string, dto: CreateScriptStepDto): Promise<ScriptStep | null> {
    // Verify script exists and belongs to tenant
    const script = await scriptService.findOne(scriptId, tenantId);
    if (!script) {
      return null;
    }

    // Get current max order index for this script
    const existingSteps = Array.from(this.steps.values()).filter(
      (s) => s.scriptId === scriptId
    );
    const maxOrderIndex = existingSteps.length > 0
      ? Math.max(...existingSteps.map(s => s.orderIndex))
      : -1;

    const step: ScriptStep = {
      id: randomUUID(),
      scriptId,
      orderIndex: maxOrderIndex + 1,
      title: dto.title,
      description: dto.description,
      elementSelector: dto.elementSelector,
      actionType: dto.actionType,
      config: dto.config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.steps.set(step.id, step);
    return step;
  }

  /**
   * Get all steps for a script (with tenant verification)
   */
  async findAllByScript(scriptId: string, tenantId: string): Promise<ScriptStep[] | null> {
    // Verify script exists and belongs to tenant
    const script = await scriptService.findOne(scriptId, tenantId);
    if (!script) {
      return null;
    }

    const steps = Array.from(this.steps.values())
      .filter((s) => s.scriptId === scriptId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    return steps;
  }

  /**
   * Get a single step by ID and verify tenant ownership
   */
  async findOne(id: string, tenantId: string): Promise<ScriptStep | null> {
    const step = this.steps.get(id);
    if (!step) {
      return null;
    }

    // Verify step's script belongs to tenant
    const script = await scriptService.findOne(step.scriptId, tenantId);
    if (!script) {
      return null;
    }

    return step;
  }

  /**
   * Update a step (with tenant verification)
   */
  async update(
    id: string,
    tenantId: string,
    dto: UpdateScriptStepDto
  ): Promise<ScriptStep | null> {
    const step = await this.findOne(id, tenantId);
    if (!step) {
      return null;
    }

    const updatedStep: ScriptStep = {
      ...step,
      title: dto.title ?? step.title,
      description: dto.description ?? step.description,
      elementSelector: dto.elementSelector !== undefined ? dto.elementSelector : step.elementSelector,
      actionType: dto.actionType !== undefined ? dto.actionType : step.actionType,
      config: dto.config !== undefined ? dto.config : step.config,
      updatedAt: new Date(),
    };

    this.steps.set(id, updatedStep);
    return updatedStep;
  }

  /**
   * Reorder steps atomically
   */
  async reorder(scriptId: string, tenantId: string, stepIds: string[]): Promise<ScriptStep[] | null> {
    // Verify script exists and belongs to tenant
    const script = await scriptService.findOne(scriptId, tenantId);
    if (!script) {
      return null;
    }

    // Verify all step IDs belong to this script
    const stepsToReorder: ScriptStep[] = [];
    for (const stepId of stepIds) {
      const step = this.steps.get(stepId);
      if (!step || step.scriptId !== scriptId) {
        return null;
      }
      stepsToReorder.push(step);
    }

    // Update order indices
    for (let i = 0; i < stepsToReorder.length; i++) {
      const updatedStep: ScriptStep = {
        ...stepsToReorder[i],
        orderIndex: i,
        updatedAt: new Date(),
      };
      this.steps.set(updatedStep.id, updatedStep);
    }

    // Return all steps for this script in new order
    return this.findAllByScript(scriptId, tenantId);
  }

  /**
   * Delete a step and renumber remaining steps
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const step = await this.findOne(id, tenantId);
    if (!step) {
      return false;
    }

    const scriptId = step.scriptId;
    const deletedOrderIndex = step.orderIndex;

    // Delete the step
    this.steps.delete(id);

    // Renumber remaining steps
    const remainingSteps = Array.from(this.steps.values())
      .filter((s) => s.scriptId === scriptId && s.orderIndex > deletedOrderIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    remainingSteps.forEach(remainingStep => {
      const updatedStep: ScriptStep = {
        ...remainingStep,
        orderIndex: remainingStep.orderIndex - 1,
        updatedAt: new Date(),
      };
      this.steps.set(updatedStep.id, updatedStep);
    });

    return true;
  }

  /**
   * Delete all steps for a script (used when script is deleted)
   */
  async deleteByScript(scriptId: string): Promise<void> {
    const stepsToDelete = Array.from(this.steps.values()).filter(
      (s) => s.scriptId === scriptId
    );
    
    stepsToDelete.forEach(step => {
      this.steps.delete(step.id);
    });
  }

  /**
   * Count steps for a script
   */
  async countByScript(scriptId: string): Promise<number> {
    return Array.from(this.steps.values()).filter(
      (s) => s.scriptId === scriptId
    ).length;
  }

  /**
   * Clear all steps (for testing)
   */
  async clear(): Promise<void> {
    this.steps.clear();
  }
}

// Singleton instance
export const scriptStepService = new InMemoryScriptStepService();
