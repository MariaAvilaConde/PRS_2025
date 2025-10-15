import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { WaterQualityApi } from '../../services/water-quality-api';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { ChlorineRecord, ChlorineRecordRequest } from '../../models/chlorine-record.model';
import { AuthService } from '../../../../core/auth/services/auth';
import { User } from '../../../../core/auth/models/auth';
import { CreateChlorineModalComponent } from './create-chlorine/create-chlorine.component';
import { DetailsChlorineComponent } from './details-chlorine/details-chlorine.component';
import { TestingPoints } from '../../models/quality-test.model';

@Component({
  selector: 'app-chlorine-control',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    CreateChlorineModalComponent,
    DetailsChlorineComponent
],
  templateUrl: './chlorine-control.html',
  styleUrls: ['./chlorine-control.css']
})
export class ChlorineControl implements OnInit {
  public chlorineRecords$: Observable<ChlorineRecord[]> = of([]);
  public isCreateModalOpen = false;
  public isDetailsModalOpen = false;
  public selectedRecord: ChlorineRecord | null = null;
  public userOrganizationId: string = '';
  public currentUserId: string = '';
  public availableTestingPoints: TestingPoints[] = [];

  constructor(private waterQualityApi: WaterQualityApi, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser: User | null = this.authService.getCurrentUser();
    if (currentUser) {
      this.userOrganizationId = currentUser.organizationId || '';
      this.currentUserId = currentUser.userId || '';
    } else {
      // Default values for development if no user is logged in
      this.userOrganizationId = 'default-org-id'; // Replace with actual default or handle error
      this.currentUserId = 'default-user-id'; // Replace with actual default or handle error
    }
    
    this.loadChlorineRecords();
    this.loadTestingPoints();
  }

  loadChlorineRecords(): void {
    this.chlorineRecords$ = this.waterQualityApi.getAllChlorineRecords().pipe(
      map(response => response.data || []),
      tap(data => {
        console.log('Chlorine records data received:', data);
        if (!data) {
          console.warn('No chlorine records data received');
        }
      }),
      catchError(error => {
        console.error('Error loading chlorine records:', error);
        return of([]); // Return an empty array on error
      })
    );
  }

  loadTestingPoints(): void {
    if (this.userOrganizationId) {
      this.waterQualityApi.getAllTestingPointsByOrganizationId(this.userOrganizationId).pipe(
        map(response => {
          console.log('Testing points response:', response);
          return response.data || [];
        }),
        catchError(error => {
          console.error('Error loading testing points:', error);
          return of([]); // Return an empty array on error
        })
      ).subscribe(points => {
        this.availableTestingPoints = points;
        console.log('Available testing points loaded:', this.availableTestingPoints);
      });
    }
  }

  openCreateManagement(): void {
    this.selectedRecord = null;
    this.isCreateModalOpen = true;
  }

  openEditManagement(record: ChlorineRecord): void {
    this.selectedRecord = record;
    this.isCreateModalOpen = true;
  }

  openDetailsManagement(record: ChlorineRecord): void {
    this.selectedRecord = record;
    this.isDetailsModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.selectedRecord = null;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedRecord = null;
  }

  handleRecordSubmission(recordData: ChlorineRecordRequest): void {
    // If selectedRecord exists, it's an update
    if (this.selectedRecord) {
      this.waterQualityApi.updateChlorineRecord(this.selectedRecord.id, recordData).subscribe(() => {
          this.loadChlorineRecords();
          this.closeCreateModal();
      });
    } else {
      // Otherwise, it's a new creation
      this.waterQualityApi.createChlorineRecord(recordData).subscribe(() => {
          this.loadChlorineRecords();
          this.closeCreateModal();
      });
    }
  }

  viewRecord(record: ChlorineRecord): void {
    this.openDetailsManagement(record);
  }

  editRecord(record: ChlorineRecord): void {
    this.openEditManagement(record);
  }

  deleteRecord(record: ChlorineRecord): void {
    if (confirm('¿Estás seguro de que quieres eliminar este registro de cloro?')) {
      this.waterQualityApi.deleteChlorineRecord(record.id).subscribe(() => {
        this.loadChlorineRecords();
      });
    }
  }

  translateStatus(acceptable: boolean, actionRequired: boolean): string {
    if (actionRequired) {
      return 'Acción Requerida';
    } else if (acceptable) {
      return 'Aceptado'; // Cambiado de 'Aceptable' a 'Aceptado'
    } else {
      return 'No Aceptable';
    }
  }
}