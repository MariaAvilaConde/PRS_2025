import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { UsersApi } from '../../../../user-management/services/users-api';

interface Zona {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-details-points',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './details-points.component.html',
  styleUrls: ['./details-points.component.css']
})
export class DetailsPointsComponent implements OnInit {
  @Input() isOpenPoint: boolean = false;
  @Output() closePoint = new EventEmitter<void>();

  createPointForm: FormGroup;
  isSavingPoint: boolean = false;
  zonasDisponibles: Zona[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly api: UsersApi,
    private readonly notificationService: NotificationService
  ) {
    this.createPointForm = this.formBuilder.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      zona: ['', Validators.required],
      descripcion: [''],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadZonas();
  }

  loadZonas() {
    // Simulación de carga de zonas
    this.zonasDisponibles = [
      { id: '1', nombre: 'Zona Norte' },
      { id: '2', nombre: 'Zona Sur' },
      { id: '3', nombre: 'Zona Centro' }
    ];
  }

  onCreatePoint() {
    if (this.createPointForm.invalid) return;

    this.isSavingPoint = true;
    const data = this.createPointForm.value;

    // Simulación de llamada a API
    setTimeout(() => {
      this.isSavingPoint = false;
      this.notificationService.showSuccess('Punto registrado correctamente');
      this.onClosePoint();
    }, 1500);
  }

  onClosePoint() {
    if (!this.isSavingPoint) {
      this.isOpenPoint = false;
      this.closePoint.emit();
      this.createPointForm.reset();
    }
  }
}
