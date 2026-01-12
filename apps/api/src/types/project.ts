export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
