import { Response, NextFunction } from 'express';
import { RequestWithTenant } from './tenant';
import { projectStore } from '../models/project-store';

export interface RequestWithProject extends RequestWithTenant {
  project?: {
    id: string;
    tenant_id: string;
  };
}

export function projectOwnershipMiddleware(
  req: RequestWithProject,
  res: Response,
  next: NextFunction
): void {
  const projectId = req.params.projectId;
  const tenantId = req.tenantId!;

  const project = projectStore.findById(projectId, tenantId);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  req.project = {
    id: project.id,
    tenant_id: project.tenant_id,
  };

  next();
}
