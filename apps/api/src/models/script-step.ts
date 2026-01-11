export interface ScriptStep {
  id: string;
  scriptId: string;
  orderIndex: number;
  title: string;
  description: string;
  elementSelector?: string;
  actionType?: string;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
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
