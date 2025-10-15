import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Breadcrumb, BreadcrumbItem } from '../../../../shared/components/ui/breadcrumb/breadcrumb';
import { AuthService } from '../../../../core/auth/services/auth';
import { NotificationService } from '../../../../shared/services/notification.service';
import { FormsModule } from '@angular/forms';
import { WaterQualityApi } from '../../services/water-quality-api';
import { TestingPoints } from '../../models/quality-test.model';
import { CreatePointsComponent } from './create-points/create-points.component';
import { DetailsPointsComponent } from './details-points/details-points.component';

// Interface to represent a point with zone information for display
interface PointWithZone {
  id: string;
  organizationId: string;
  pointCode: string;
  pointName: string;
  pointType: string;
  zoneId: string;
  locationDescription: string;
  street: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  zone: {
    id: string;
    name: string;
  } | null;
}

@Component({
  selector: 'app-analysis-points',
  standalone: true,
  imports: [ CommonModule, FormsModule, CreatePointsComponent],
  templateUrl: './analysis-points.html',
  styleUrls: ['./analysis-points.css']
})
export class AnalysisPoints implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Panel de Control',
      url: '/admin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'Calidad de Agua',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h16a8.014 8.014 0 00-.572-5.572zM7 9a2 2 0 11-4 0 2 2 0 014 0zM17 9a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'Puntos de Análisis',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  // Data
  points: PointWithZone[] = [];
  filteredPoints: PointWithZone[] = [];
  paginatedPoints: PointWithZone[] = [];

  // Statistics
  totalPoints: number = 0;
  activePoints: number = 0;
  inactivePoints: number = 0;
  showingPoints: number = 0;

  // Zones
  availableZones: string[] = [];
  selectedZone: string = '';

  // Filters
  searchTerm: string = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  // States
  isLoading: boolean = false;
  isCreating: boolean = false;

  // Dropdowns
  isZoneDropdownOpen: boolean = false;
  isStatusDropdownOpen: boolean = false;

  // Modal states
  isDetailsModalOpen: boolean = false;
  selectedPointId: string | null = null;

  Math = Math;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private waterQualityApi: WaterQualityApi
  ) { }

  ngOnInit(): void {
    console.log('AnalysisPoints component initialized');
    this.loadPoints();
  }

  loadPoints(): void {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    const organizationId = user?.organizationId;
    console.log('Organization ID:', organizationId);

    if (!organizationId) {
      console.error('Organization ID is not available. User:', user);
      this.notificationService.error('Error de Autenticación', 'No se pudo obtener la información de la organización. Por favor, inicie sesión de nuevo.');
      this.isLoading = false;
      return;
    }

    this.waterQualityApi.getTestingPointsByOrganizationId(organizationId).subscribe((response) => { // Use arrow function here
      console.log('API Response:', response);
      if (response.success && Array.isArray(response.data)) {
        this.points = response.data.map((point: any) => ({
          ...point,
          zone: null
        }));
        console.log('Mapped points:', this.points);
        this.filterPoints();
        this.calculateStatistics();
        
        const zones = new Set<string>();
        this.points.forEach(point => {
          if (point.zone?.name) {
            zones.add(point.zone.name);
          }
        });
        this.availableZones = Array.from(zones);
      } else {
        this.points = [];
        this.filterPoints();
        this.notificationService.error('Error', 'No se encontraron puntos de análisis o hubo un error en la respuesta.');
      }
      this.isLoading = false;
    }, (error) => {
      console.error('Error loading points:', error);
      this.notificationService.error('Error', 'Error al cargar los puntos de análisis');
      this.isLoading = false;
      this.points = [];
      this.filterPoints();
    });
  }

  calculateStatistics(): void {
    this.totalPoints = this.points.length;
    this.activePoints = this.points.filter(p => p.status === 'ACTIVE').length;
    this.inactivePoints = this.points.filter(p => p.status !== 'ACTIVE').length;
  }

  filterPoints(): void {
    let tempPoints = [...this.points];
    console.log('Filtering points. Initial count:', tempPoints.length);
    console.log('Filters:', { status: this.statusFilter, search: this.searchTerm, zone: this.selectedZone });

    if (this.statusFilter !== 'all') {
      const status = this.statusFilter === 'active' ? 'ACTIVE' : 'INACTIVE';
      tempPoints = tempPoints.filter(p => p.status === status);
      console.log('After status filter:', tempPoints.length);
    }

    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      tempPoints = tempPoints.filter(p =>
        (p.pointCode && p.pointCode.toLowerCase().includes(lowercasedTerm)) ||
        (p.pointName && p.pointName.toLowerCase().includes(lowercasedTerm))
      );
      console.log('After search filter:', tempPoints.length);
    }

    if (this.selectedZone) {
      tempPoints = tempPoints.filter(p => p.zone?.name === this.selectedZone);
      console.log('After zone filter:', tempPoints.length);
    }

    this.filteredPoints = tempPoints;
    console.log('Filtered points count:', this.filteredPoints.length);
    this.showingPoints = this.filteredPoints.length;
    this.totalPages = Math.ceil(this.showingPoints / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPoints = this.filteredPoints.slice(startIndex, endIndex);
    console.log('Paginated points:', this.paginatedPoints);
  }

  onSearch(): void {
    this.filterPoints();
  }

  viewPointDetails(point: PointWithZone): void {
    this.selectedPointId = point.id;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedPointId = null;
  }

  openCreatePointModal(): void {
    this.isCreating = true;
  }

  closeCreatePointModal(): void {
    this.isCreating = false;
  }

  onPointCreated(point: any): void {
    this.closeCreatePointModal();
    this.loadPoints(); // Reload the list to include the new point
    this.notificationService.success('Éxito', 'Punto de prueba creado correctamente');
  }

  deletePoint(point: PointWithZone): void {
    if (confirm(`¿Está seguro que desea eliminar el punto ${point.pointCode}?`)) {
      this.waterQualityApi.deleteTestingPoint(point.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Éxito', 'Punto eliminado correctamente');
            this.loadPoints(); // Reload the list
          } else {
            this.notificationService.error('Error', 'Error al eliminar el punto');
          }
        },
        error: (error) => {
          this.notificationService.error('Error', 'Error al eliminar el punto');
          console.error('Error deleting point:', error);
        }
      });
    }
  }

  // Pagination methods
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  trackById(index: number, item: PointWithZone): string {
    return item.id;
  }
}