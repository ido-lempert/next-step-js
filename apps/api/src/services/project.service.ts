import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project';
import { randomUUID } from 'crypto';

class InMemoryProjectService {
  private projects: Map<string, Project> = new Map();

  /**
   * Create a new project for a tenant
   */
  async create(tenantId: string, dto: CreateProjectDto): Promise<Project> {
    const project: Project = {
      id: randomUUID(),
      tenantId,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Get all projects for a tenant
   */
  async findAllByTenant(tenantId: string): Promise<Project[]> {
    const projects = Array.from(this.projects.values()).filter(
      (p) => p.tenantId === tenantId
    );
    return projects;
  }

  /**
   * Get a single project by ID and verify tenant ownership
   */
  async findOne(id: string, tenantId: string): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project || project.tenantId !== tenantId) {
      return null;
    }
    return project;
  }

  /**
   * Update a project (with tenant verification)
   */
  async update(
    id: string,
    tenantId: string,
    dto: UpdateProjectDto
  ): Promise<Project | null> {
    const project = await this.findOne(id, tenantId);
    if (!project) {
      return null;
    }

    const updatedProject: Project = {
      ...project,
      name: dto.name ?? project.name,
      description: dto.description !== undefined ? dto.description : project.description,
      updatedAt: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  /**
   * Delete a project (with tenant verification)
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const project = await this.findOne(id, tenantId);
    if (!project) {
      return false;
    }

    this.projects.delete(id);
    return true;
  }

  /**
   * Clear all projects (for testing)
   */
  async clear(): Promise<void> {
    this.projects.clear();
  }
}

// Singleton instance
export const projectService = new InMemoryProjectService();
