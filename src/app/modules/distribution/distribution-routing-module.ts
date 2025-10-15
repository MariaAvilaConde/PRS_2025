import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'routes',
    loadComponent: () => import('./components/routes-management/routes-management').then(m => m.RoutesManagement)
  },
  {
    path: 'rates',
    loadComponent: () => import('./components/rates-management/rates-management').then(m => m.RatesManagement)
  },
  {
    path: 'schedules',
    loadComponent: () => import('./components/schedules-management/schedules-management').then(m => m.SchedulesManagement)
  },
  {
    path: 'programming',
    loadComponent: () => import('./components/programming-management/programming-management').then(m => m.ProgrammingManagement)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DistributionRoutingModule { }
