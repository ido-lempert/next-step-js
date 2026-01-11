export type ScriptType = 'walkthrough' | 'modal';
export type ScriptStatus = 'draft' | 'published';

export interface Script {
  id: string;
  productId: string;
  name: string;
  type: ScriptType;
  status: ScriptStatus;
  createdAt: string;
  updatedAt: string;
  steps?: ScriptStep[];
}

export interface ScriptStep {
  id: string;
  scriptId: string;
  orderIndex: number;
  title: string;
  description: string;
  elementSelector?: string;
  actionType?: string;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptDto {
  name: string;
  type: ScriptType;
}

export interface UpdateScriptDto {
  name?: string;
  type?: ScriptType;
}

export interface CreateScriptStepDto {
  title: string;
  description: string;
  elementSelector?: string;
  actionType?: string;
  config?: Record<string, unknown>;
}

export interface UpdateScriptStepDto {
  title?: string;
  description?: string;
  elementSelector?: string;
  actionType?: string;
  config?: Record<string, unknown>;
}
