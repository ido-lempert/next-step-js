import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:projectId/products',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:projectId/products/new',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:projectId/products/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'products/:productId/scripts',
    renderMode: RenderMode.Server,
  },
  {
    path: 'scripts/:id/editor',
    renderMode: RenderMode.Server,
  },
  {
    path: 'scripts/:id/preview',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
