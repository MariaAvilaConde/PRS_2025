import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'types',
    loadComponent: () => import('./components/incident-types/incident-types').then(m => m.IncidentTypes)
  },
  {
    path: 'list',
    loadComponent: () => import('./components/incidents-list/incidents-list').then(m => m.IncidentsList)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsIncidentsRoutingModule { }
