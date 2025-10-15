import { Component } from '@angular/core';
import { Breadcrumb, BreadcrumbItem } from '../../../../shared/components/ui/breadcrumb/breadcrumb';

@Component({
  selector: 'app-incident-types',
  standalone: true,
  imports: [Breadcrumb],
  templateUrl: './incident-types.html',
  styleUrl: './incident-types.css'
})
export class IncidentTypes {
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Panel de Control',
      url: '/admin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'Reclamos e Incidentes',
      icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Tipos de Incidentes',
      icon: 'M7 7h.01M7 3h5c.512 0 .853.265 1.14.559l1.44 1.44c.293.293.559.634.559 1.14v6.862c0 .506-.266.847-.559 1.14l-1.44 1.44A1.5 1.5 0 0112 16H7c-.512 0-.853-.265-1.14-.559l-1.44-1.44A1.5 1.5 0 014 12.86V6c0-.506.266-.847.559-1.14l1.44-1.44A1.5 1.5 0 017 3z'
    }
  ];
}
