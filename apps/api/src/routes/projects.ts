import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { projectStore } from '../models/project-store';
import { CreateProjectDto, UpdateProjectDto } from '../types/project';
import { RequestWithTenant } from '../middleware/tenant';

export const projectRouter = Router();

// Validation helper
function validateProjectName(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  if (name.trim().length === 0) {
    return 'Name cannot be empty';
  }
  if (name.length > 255) {
    return 'Name must not exceed 255 characters';
  }
  return null;
}

// GET /api/projects - List all projects for tenant
projectRouter.get('/', (req: RequestWithTenant, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const projects = projectStore.findAll(tenantId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get a single project
projectRouter.get('/:id', (req: RequestWithTenant, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;
    
    const project = projectStore.findById(id, tenantId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects - Create a new project
projectRouter.post('/', (req: RequestWithTenant, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const dto: CreateProjectDto = req.body;

    // Validate name
    const nameError = validateProjectName(dto.name);
    if (nameError) {
      res.status(400).json({ error: nameError });
      return;
    }

    // Create project
    const project = projectStore.create({
      id: uuidv4(),
      tenant_id: tenantId,
      name: dto.name.trim(),
      description: dto.description?.trim() || undefined,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id - Update a project
projectRouter.put('/:id', (req: RequestWithTenant, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;
    const dto: UpdateProjectDto = req.body;

    // Validate name if provided
    if (dto.name !== undefined) {
      const nameError = validateProjectName(dto.name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }
    }

    // Prepare updates
    const updates: Partial<UpdateProjectDto> = {};
    if (dto.name !== undefined) {
      updates.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      updates.description = dto.description.trim() || undefined;
    }

    const updatedProject = projectStore.update(id, tenantId, updates);

    if (!updatedProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id - Delete a project
projectRouter.delete('/:id', (req: RequestWithTenant, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const deleted = projectStore.delete(id, tenantId);

    if (!deleted) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
