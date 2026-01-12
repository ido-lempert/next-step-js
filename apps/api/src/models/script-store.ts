import { Script } from '../types/script';
import { scriptStepStore } from './script-step-store';

class ScriptStore {
  private scripts: Map<string, Script> = new Map();

  create(script: Script): Script {
    this.scripts.set(script.id, script);
    return script;
  }

  findByProductId(productId: string): Script[] {
    return Array.from(this.scripts.values()).filter(
      (script) => script.product_id === productId
    );
  }

  findById(id: string): Script | undefined {
    return this.scripts.get(id);
  }

  update(id: string, updates: Partial<Script>): Script | undefined {
    const script = this.findById(id);
    if (!script) {
      return undefined;
    }

    const updatedScript = {
      ...script,
      ...updates,
      id: script.id,
      product_id: script.product_id,
      created_at: script.created_at,
      updated_at: new Date(),
    };

    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  delete(id: string): boolean {
    const script = this.findById(id);
    if (!script) {
      return false;
    }
    
    // CASCADE delete: delete all steps belonging to this script
    scriptStepStore.deleteByScriptId(id);
    
    return this.scripts.delete(id);
  }

  deleteByProductId(productId: string): number {
    const scriptsToDelete = this.findByProductId(productId);
    let deletedCount = 0;
    
    for (const script of scriptsToDelete) {
      if (this.delete(script.id)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}

export const scriptStore = new ScriptStore();
