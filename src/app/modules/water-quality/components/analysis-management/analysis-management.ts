import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs';
import { QualityTest, QualityTestRequest } from '../../models/quality-test.model';
import { WaterQualityApi } from '../../services/water-quality-api';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { CreateManagementComponent } from './create-management/create-management.component';
import { DetailsManagementComponent } from './details-management/details-management.component';
import { AuthService } from '../../../../core/auth/services/auth';
import { User } from '../../../../core/auth/models/auth';

@Component({
  selector: 'app-analysis-management',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CreateManagementComponent,
    DetailsManagementComponent
  ],
  templateUrl: './analysis-management.html',
})
export class AnalysisManagement implements OnInit {
  public qualityTests$: Observable<QualityTest[]> = of([]);
  public isCreateModalOpen = false;
  public isEditModalOpen = false;
  public isDetailsModalOpen = false;
  public selectedTest: QualityTest | null = null;
  public lastAnalysisCode: string = 'ANL-001';
  public userOrganizationId: string = '';
  public currentUserId: string = '';

  constructor(
    private waterQualityApi: WaterQualityApi,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener información del usuario logueado
    const currentUser: User | null = this.authService.getCurrentUser();
    if (currentUser) {
      // Usar directamente organizationId del usuario
      this.userOrganizationId = currentUser.organizationId || '';
      this.currentUserId = currentUser.userId || '';
    } else {
      // Valores por defecto si no hay usuario logueado (solo para desarrollo)
      this.userOrganizationId = '6896b2ecf3e398570ffd99d3';
      this.currentUserId = '68c0a4ab07fa2d47448b530a';
    }

    this.loadQualityTests();
  }

  loadQualityTests(): void {
    this.qualityTests$ = this.waterQualityApi.getAllQualityTests().pipe(
      map((response: ApiResponse<QualityTest[]>) => response.data || []),
      tap((data: QualityTest[]) => {
        console.log('Quality tests data received:', data);
        if (!data) {
          console.warn('No quality tests data received');
        }
      }),
      catchError(error => {
        console.error('Error loading quality tests:', error);
        return of([]); // Return an empty array on error
      })
    );
  }

  openCreateManagement(): void {
    this.selectedTest = null;
    this.isCreateModalOpen = true;
  }

  openEditManagement(test: QualityTest): void {
    this.selectedTest = test;
    this.isCreateModalOpen = true; // Reuse the same modal
  }

  openDetailsManagement(test: QualityTest): void {
    this.selectedTest = test;
    this.isDetailsModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.selectedTest = null;
  }

  closeEditModal(): void {
    this.isCreateModalOpen = false;
    this.selectedTest = null;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedTest = null;
  }

  handleTestSubmission(testData: any): void {
    // El testData ya viene en el formato correcto del modal
    console.log('Enviando datos al backend:', testData);
    
    // Convertir el objeto al tipo QualityTestRequest para el servicio
    const qualityTestRequest: QualityTestRequest = {
      testCode: this.lastAnalysisCode,
      organizationId: testData.organization,
      testedByUserId: testData.testedByUser,
      testingPointId: testData.testingPointId,
      testDate: new Date().toISOString(), // Generar la fecha actual
      testType: testData.testType,
      weatherConditions: testData.weatherConditions,
      waterTemperature: 0, // Valor por defecto ya que no se envía en el formato
      generalObservations: testData.generalObservations,
      status: testData.status,
      results: testData.results
    };
    
    this.waterQualityApi.createQualityTest(qualityTestRequest).pipe(
      catchError(error => {
        console.error('Error creating test:', error);
        // Mostrar más detalles del error
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
        return of(null); // Return null or a specific error object
      }
    )).subscribe({
      next: (response) => {
        if (response && response.success) {
          console.log('Test created successfully:', response.data);
          this.loadQualityTests();
          this.closeCreateModal();
        } else {
          console.error('Failed to create test:', response?.message || 'Unknown error');
          // Mostrar mensaje de error al usuario
          if (response?.message) {
            console.error('Mensaje de error del servidor:', response.message);
          }
        }
      },
      error: (error) => {
        console.error('Error in subscription:', error);
      }
    });
  }

  handleTestUpdate(testData: QualityTestRequest): void {
    if (!this.selectedTest) {
      console.error('No test selected for update');
      return;
    }

    console.log('Actualizando test:', testData);
    
    this.waterQualityApi.updateQualityTest(this.selectedTest.id, testData).pipe(
      catchError(error => {
        console.error('Error updating test:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.success) {
          console.log('Test updated successfully:', response.data);
          this.loadQualityTests();
          this.closeCreateModal(); // Close the reused modal
        } else {
          console.error('Failed to update test:', response?.message || 'Unknown error');
        }
      },
      error: (error) => {
        console.error('Error in subscription:', error);
      }
    });
  }

  viewTest(test: QualityTest): void {
    this.openDetailsManagement(test);
  }

  editTest(test: QualityTest): void {
    this.openEditManagement(test);
  }

  deleteTest(test: QualityTest): void {
    // Implement delete logic
    console.log('Deleting test:', test);
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'ACCEPTABLE':
        return 'Aceptable';
      case 'WARNING':
        return 'Advertencia';
      case 'CRITICAL':
        return 'Crítico';
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  }
}