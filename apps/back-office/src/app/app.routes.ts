import { Route } from '@angular/router';
import { ProjectListComponent } from './components/projects/project-list.component';
import { ProjectFormComponent } from './components/projects/project-form.component';

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
];
