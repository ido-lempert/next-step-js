import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import {
  validateCreateProject,
  validateUpdateProject,
} from '../validators/project-validators';

const router = Router();

// Create a new project
router.post('/', validateCreateProject, createProject);

// Get all projects for tenant
router.get('/', getProjects);

// Get a single project by ID
router.get('/:id', getProject);

// Update a project
router.put('/:id', validateUpdateProject, updateProject);

// Delete a project
router.delete('/:id', deleteProject);

export default router;
