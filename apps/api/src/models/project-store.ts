import { Project } from '../types/project';
import { productStore } from './product-store';

class ProjectStore {
  private projects: Map<string, Project> = new Map();

  create(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  findAll(tenantId: string): Project[] {
    return Array.from(this.projects.values()).filter(
      (project) => project.tenant_id === tenantId
    );
  }

  findById(id: string, tenantId: string): Project | undefined {
    const project = this.projects.get(id);
    if (project && project.tenant_id === tenantId) {
      return project;
    }
    return undefined;
  }

  update(id: string, tenantId: string, updates: Partial<Project>): Project | undefined {
    const project = this.findById(id, tenantId);
    if (!project) {
      return undefined;
    }

    const updatedProject = {
      ...project,
      ...updates,
      id: project.id,
      tenant_id: project.tenant_id,
      created_at: project.created_at,
      updated_at: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  delete(id: string, tenantId: string): boolean {
    const project = this.findById(id, tenantId);
    if (!project) {
      return false;
    }
    
    // CASCADE delete: delete all products belonging to this project
    productStore.deleteByProjectId(id);
    
    return this.projects.delete(id);
  }
}

export const projectStore = new ProjectStore();
