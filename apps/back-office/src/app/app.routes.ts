import { Route } from '@angular/router';
import { ProjectListComponent } from './components/projects/project-list.component';
import { ProjectFormComponent } from './components/projects/project-form.component';
import { ProductListComponent } from './components/products/product-list.component';
import { ProductFormComponent } from './components/products/product-form.component';
import { ScriptListComponent } from './components/scripts/script-list.component';
import { ScriptEditorComponent } from './components/scripts/script-editor.component';
import { ScriptPreviewComponent } from './components/scripts/script-preview.component';

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
  {
    path: 'products/:productId/scripts',
    component: ScriptListComponent,
  },
  {
    path: 'scripts/:id/editor',
    component: ScriptEditorComponent,
  },
  {
    path: 'scripts/:id/preview',
    component: ScriptPreviewComponent,
  },
];
