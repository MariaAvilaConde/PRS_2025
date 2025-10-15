import { Component } from '@angular/core';
import { Breadcrumb, BreadcrumbItem } from '../../../shared/components/ui/breadcrumb/breadcrumb';

@Component({
  selector: 'app-global-analytics',
  standalone: true,
  imports: [Breadcrumb],
  templateUrl: './global-analytics.html',
  styleUrl: './global-analytics.css'
})
export class GlobalAnalytics {
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Inicio Global',
      url: '/super-admin/dashboard',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Analytics Global',
      icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];
}
