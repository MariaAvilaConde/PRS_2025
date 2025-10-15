import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WaterQualityApi } from '../../../services/water-quality-api';
import { QualityTest, QualityTestRequest, TestType, StatusResult, TestingPoints, TestResults } from '../../../models/quality-test.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { MultiSelectDropdownComponent } from '../../../../../shared/components/forms/multi-select-dropdown/multi-select-dropdown.component';

// Interfaz para parámetros predefinidos
interface PredefinedParameter {
  code: string;
  name: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
}

@Component({
  selector: 'app-water-test-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectDropdownComponent],
  providers: [WaterQualityApi],
  templateUrl: './create-management.component.html',
  styleUrls: ['./create-management.component.css']
})
export class CreateManagementComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create'; // Nuevo input para el modo
  @Input() qualityTest: QualityTest | null = null; // Nuevo input para el test a editar
  @Input() lastAnalysisCode: string = '';
  @Input() userOrganizationId: string = '';
  @Input() currentUserId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submitTest = new EventEmitter<QualityTestRequest>();
  @Output() updateTest = new EventEmitter<QualityTestRequest>(); // Nuevo output para actualización

  isSaving: boolean = false;
  displayTestDate: string = '';
  availableTestingPoints: TestingPoints[] = [];
 predefinedParameters: PredefinedParameter[] = [
    { code: 'CLORO_LIBRE', name: 'Cloro libre', unit: 'mg/L', minValue: 0.2, maxValue: 4.0 }, // Límites ajustados para agua potable (más estricto)
    { code: 'PH', name: 'pH', unit: 'Unidad de pH', minValue: 6.5, maxValue: 8.5 }, // Límites ajustados al rango de calidad del agua
    { code: 'TEMPERATURA', name: 'Temperatura', unit: '°C', minValue: 0, maxValue: 50 }, // Valores lógicos para la temperatura del agua
];
  waterTestForm!: FormGroup;
  testTypes = Object.values(TestType);
  statusResults = Object.values(StatusResult);

  constructor(private fb: FormBuilder, private waterQualityApi: WaterQualityApi) { }

  ngOnInit(): void {
    // Formatear la fecha para mostrar
    const now = new Date();
    this.displayTestDate = now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Cargar puntos de prueba disponibles desde la API
    this.loadTestingPoints();

    this.waterTestForm = this.fb.group({
      testingPointId: [[], Validators.required],
      testType: [TestType.RUTINARIO, Validators.required],
      weatherConditions: ['', Validators.required],
      generalObservations: [''],
      status: ['COMPLETED', Validators.required],
      results: this.fb.array([])
    });

    // Si estamos en modo edición y hay un test, cargar sus datos
    if (this.mode === 'edit' && this.qualityTest) {
      this.loadTestData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el test a editar, recargar los datos
    if (changes['qualityTest'] && changes['qualityTest'].currentValue) {
      this.loadTestData();
    }
    
    // Si cambia el modo, resetear el formulario si es necesario
    if (changes['mode']) {
      if (this.mode === 'create') {
        this.resetForm();
      } else if (this.mode === 'edit' && this.qualityTest) {
        this.loadTestData();
      }
    }
  }

  get results(): FormArray {
    return this.waterTestForm.get('results') as FormArray;
  }

  // Cargar puntos de prueba disponibles desde la API
  loadTestingPoints(): void {
    if (this.userOrganizationId) {
      this.waterQualityApi.getAllTestingPointsByOrganizationId(this.userOrganizationId)
        .subscribe({
          next: (response: ApiResponse<TestingPoints[]>) => {
            this.availableTestingPoints = response.data || [];
            console.log('Puntos de prueba cargados:', this.availableTestingPoints);
          },
          error: (error) => {
            console.error('Error cargando puntos de prueba:', error);
            // En caso de error, usar datos simulados
            this.loadTestingPointsFallback();
          }
        });
    } else {
      // Si no hay organización, usar datos simulados
      this.loadTestingPointsFallback();
    }
  }

  // Datos simulados como fallback
  loadTestingPointsFallback(): void {
    console.warn('Usando datos simulados para puntos de prueba');
    this.availableTestingPoints = [
      {
        id: 'tp-001',
        organizationId: this.userOrganizationId || 'org-default',
        pointCode: 'PT-001',
        pointName: 'Punto de Muestreo 1',
        pointType: 'Río',
        zoneId: 'zone-001',
        locationDescription: 'Río principal, entrada al pueblo',
        street: 'Calle Principal',
        coordinates: {
          latitude: -12.0464,
          longitude: -77.0428
        },
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tp-002',
        organizationId: this.userOrganizationId || 'org-default',
        pointCode: 'PT-002',
        pointName: 'Punto de Muestreo 2',
        pointType: 'Lago',
        zoneId: 'zone-001',
        locationDescription: 'Lago central del parque',
        street: 'Av. Central',
        coordinates: {
          latitude: -12.0464,
          longitude: -77.0428
        },
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Cargar los datos del test en el formulario
  loadTestData(): void {
    if (this.qualityTest && this.mode === 'edit') {
      // Limpiar resultados existentes
      while (this.results.length !== 0) {
        this.results.removeAt(0);
      }

      // Agregar resultados del test
      this.qualityTest.results.forEach(result => {
        this.results.push(this.fb.group({
          parameterId: [result.parameterId, Validators.required],
          parameterName: [result.parameterName, Validators.required],
          measuredValue: [result.measuredValue, [Validators.required, Validators.min(0)]],
          unit: [result.unit, Validators.required],
          status: [result.status, Validators.required],
          observations: [result.observations || '']
        }));
      });

      // Establecer valores del formulario
      this.waterTestForm.patchValue({
        testingPointId: this.qualityTest.testingPointId.map(point => point.id),
        testType: this.qualityTest.testType,
        weatherConditions: this.qualityTest.weatherConditions,
        generalObservations: this.qualityTest.generalObservations,
        status: this.qualityTest.status
      });
    }
  }

  // Resetear el formulario
  resetForm(): void {
    this.waterTestForm.reset({
      testType: TestType.RUTINARIO,
      status: 'COMPLETED'
    });
    
    // Limpiar resultados
    while (this.results.length !== 0) {
      this.results.removeAt(0);
    }
    
    // Agregar un resultado vacío
    this.addResult();
  }

  addResult(): void {
    this.results.push(this.newTestResult());
  }

  removeResult(index: number): void {
    this.results.removeAt(index);
  }

  newTestResult(): FormGroup {
    return this.fb.group({
      parameterId: ['', Validators.required],
      measuredValue: [null, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      status: [StatusResult.ACCEPTABLE, Validators.required],
      observations: ['']
    });
  }

  // Manejar el cambio de parámetro seleccionado
  onParameterChange(event: any, index: number): void {
    const selectedParamCode = event.target.value;
    const selectedParam = this.predefinedParameters.find(param => param.code === selectedParamCode);
    
    if (selectedParam && this.results.at(index)) {
      const resultGroup = this.results.at(index);
      resultGroup.get('parameterId')?.setValue(selectedParam.code);
      resultGroup.get('parameterName')?.setValue(selectedParam.name);
      resultGroup.get('unit')?.setValue(selectedParam.unit);
    }
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
    this.waterTestForm.reset();
  }

  onSubmit(): void {
    if (this.waterTestForm.invalid) {
      this.waterTestForm.markAllAsTouched();
      console.error('Form is invalid');
      return;
    }

    this.isSaving = true;
    
    // Preparar los datos en el formato correcto
    const formValue = this.waterTestForm.value;
    
    if (this.mode === 'create') {
      const testData: QualityTestRequest = {
        testCode: '', // Assuming backend generates this for new creations
        organizationId: this.userOrganizationId,
        testedByUserId: this.currentUserId,
        testingPointId: formValue.testingPointId,
        testDate: new Date().toISOString(),
        testType: formValue.testType,
        weatherConditions: formValue.weatherConditions,
        waterTemperature: 0, // Default value as it's not in the form
        generalObservations: formValue.generalObservations,
        status: formValue.status,
        results: formValue.results
      };
      
      // Agregar console.log para ver los datos que se envían
      console.log('Datos del formulario a enviar (creación):', testData);
      console.log('JSON.stringify de los datos:', JSON.stringify(testData, null, 2));
      
      this.submitTest.emit(testData);
    } else if (this.mode === 'edit' && this.qualityTest) {
      const testData: QualityTestRequest = {
        testCode: this.qualityTest.testCode || '',
        organizationId: this.userOrganizationId,
        testedByUserId: this.currentUserId,
        testingPointId: formValue.testingPointId,
        testDate: this.qualityTest.testDate || new Date().toISOString(),
        testType: formValue.testType,
        weatherConditions: formValue.weatherConditions,
        waterTemperature: this.qualityTest.waterTemperature || 0,
        generalObservations: formValue.generalObservations,
        status: formValue.status,
        results: formValue.results
      };
      
      // Agregar console.log para ver los datos que se envían
      console.log('Datos del formulario a enviar (edición):', testData);
      console.log('JSON.stringify de los datos:', JSON.stringify(testData, null, 2));
      
      this.updateTest.emit(testData);
    }
    
    this.isSaving = false;
  }

  // Getter para el título del modal
  get modalTitle(): string {
    return this.mode === 'create' ? 'Crear Nuevo Análisis de Calidad de Agua' : 'Editar Análisis de Calidad de Agua';
  }

  // Getter para el texto del botón
  get submitButtonText(): string {
    if (this.isSaving) {
      return this.mode === 'create' ? 'Guardando Análisis...' : 'Actualizando Análisis...';
    }
    return this.mode === 'create' ? 'Guardar Análisis' : 'Actualizar Análisis';
  }
}