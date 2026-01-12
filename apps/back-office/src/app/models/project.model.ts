export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
