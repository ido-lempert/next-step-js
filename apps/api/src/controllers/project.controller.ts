import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../models/project';

/**
 * Create a new project
 */
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const dto: CreateProjectDto = req.body;

    const project = await projectService.create(tenantId, dto);

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create project' 
    });
  }
};

/**
 * Get all projects for the tenant
 */
export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const projects = await projectService.findAllByTenant(tenantId);

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch projects' 
    });
  }
};

/**
 * Get a single project by ID
 */
export const getProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const project = await projectService.findOne(id, tenantId);

    if (!project) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Project not found' 
      });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch project' 
    });
  }
};

/**
 * Update a project
 */
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const dto: UpdateProjectDto = req.body;

    const project = await projectService.update(id, tenantId, dto);

    if (!project) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Project not found' 
      });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update project' 
    });
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const deleted = await projectService.delete(id, tenantId);

    if (!deleted) {
      res.status(404).json({ 
        error: 'Not Found',
        message: 'Project not found' 
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete project' 
    });
  }
};
