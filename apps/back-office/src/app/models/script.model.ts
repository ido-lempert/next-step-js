export type ScriptType = 'walkthrough' | 'modal';
export type ScriptStatus = 'draft' | 'published';

export interface Script {
  id: string;
  product_id: string;
  name: string;
  type: ScriptType;
  status: ScriptStatus;
  created_at: Date | string;
  updated_at: Date | string;
  step_count?: number;
}

export interface CreateScriptDto {
  name: string;
  type: ScriptType;
}

export interface UpdateScriptDto {
  name?: string;
  type?: ScriptType;
}

export type ActionType = 'click' | 'hover' | 'input' | 'navigate' | 'wait';

export interface ScriptStep {
  id: string;
  script_id: string;
  order_index: number;
  title: string;
  description?: string;
  element_selector?: string;
  action_type?: ActionType;
  config?: Record<string, any>;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateScriptStepDto {
  title: string;
  description?: string;
  element_selector?: string;
  action_type?: ActionType;
  config?: Record<string, any>;
}

export interface UpdateScriptStepDto {
  title?: string;
  description?: string;
  element_selector?: string;
  action_type?: ActionType;
  config?: Record<string, any>;
}

export interface ReorderStepsDto {
  stepIds: string[];
}

export interface ScriptWithSteps extends Script {
  steps: ScriptStep[];
}
