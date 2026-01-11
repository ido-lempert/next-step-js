import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:id',
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
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
