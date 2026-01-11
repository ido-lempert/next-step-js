import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/components/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
];
