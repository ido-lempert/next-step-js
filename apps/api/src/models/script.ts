export type ScriptType = 'walkthrough' | 'modal';
export type ScriptStatus = 'draft' | 'published';

export interface Script {
  id: string;
  productId: string;
  name: string;
  type: ScriptType;
  status: ScriptStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScriptDto {
  name: string;
  type: ScriptType;
}

export interface UpdateScriptDto {
  name?: string;
  type?: ScriptType;
}
