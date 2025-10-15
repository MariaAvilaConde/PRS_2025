import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'management',
    loadComponent: () => import('./components/supplies-management/supplies-management').then(m => m.SuppliesManagement)
  },
  {
    path: 'assignment',
    loadComponent: () => import('./components/supplies-assignment/supplies-assignment').then(m => m.SuppliesAssignment)
  },
  {
    path: 'transfer',
    loadComponent: () => import('./components/supplies-transfer/supplies-transfer').then(m => m.SuppliesTransfer)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfrastructureRoutingModule { }
