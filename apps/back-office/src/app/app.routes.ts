import { Route } from '@angular/router';
import { ProjectListComponent } from './components/projects/project-list.component';
import { ProjectFormComponent } from './components/projects/project-form.component';
import { ProductListComponent } from './components/products/product-list.component';
import { ProductFormComponent } from './components/products/product-form.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'projects', component: ProjectListComponent },
  { 
    path: 'projects/new', 
    component: ProjectFormComponent,
  },
  { 
    path: 'projects/edit/:id', 
    component: ProjectFormComponent,
  },
  {
    path: 'projects/:projectId/products',
    component: ProductListComponent,
  },
  {
    path: 'projects/:projectId/products/new',
    component: ProductFormComponent,
  },
  {
    path: 'projects/:projectId/products/edit/:id',
    component: ProductFormComponent,
  },
];
