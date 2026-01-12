import { ScriptStep } from '../types/script';

class ScriptStepStore {
  private steps: Map<string, ScriptStep> = new Map();

  create(step: ScriptStep): ScriptStep {
    this.steps.set(step.id, step);
    return step;
  }

  findByScriptId(scriptId: string): ScriptStep[] {
    return Array.from(this.steps.values())
      .filter((step) => step.script_id === scriptId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  findById(id: string): ScriptStep | undefined {
    return this.steps.get(id);
  }

  countByScriptId(scriptId: string): number {
    return this.findByScriptId(scriptId).length;
  }

  update(id: string, updates: Partial<ScriptStep>): ScriptStep | undefined {
    const step = this.findById(id);
    if (!step) {
      return undefined;
    }

    const updatedStep = {
      ...step,
      ...updates,
      id: step.id,
      script_id: step.script_id,
      created_at: step.created_at,
      updated_at: new Date(),
    };

    this.steps.set(id, updatedStep);
    return updatedStep;
  }

  delete(id: string): boolean {
    return this.steps.delete(id);
  }

  deleteByScriptId(scriptId: string): number {
    const stepsToDelete = this.findByScriptId(scriptId);
    let deletedCount = 0;
    
    for (const step of stepsToDelete) {
      if (this.steps.delete(step.id)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  getNextOrderIndex(scriptId: string): number {
    const steps = this.findByScriptId(scriptId);
    if (steps.length === 0) {
      return 0;
    }
    return Math.max(...steps.map(s => s.order_index)) + 1;
  }
}

export const scriptStepStore = new ScriptStepStore();
