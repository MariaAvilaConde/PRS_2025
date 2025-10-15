import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChlorineRecord, ChlorineRecordRequest } from '../../../models/chlorine-record.model';
import { MultiSelectDropdownComponent } from '../../../../../shared/components/forms/multi-select-dropdown/multi-select-dropdown.component';
import { TestingPoints } from '../../../models/quality-test.model';

@Component({
  selector: 'app-create-chlorine-record-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectDropdownComponent],
  templateUrl: './create-chlorine.component.html',
  styleUrls: ['./create-chlorine.component.css']
})
export class CreateChlorineModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() chlorineRecord: ChlorineRecord | null = null;
  @Input() userOrganizationId: string = '';
  @Input() currentUserId: string = '';
  @Input() availableTestingPoints: TestingPoints[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() submitRecord = new EventEmitter<ChlorineRecordRequest>();
  @Output() updateRecord = new EventEmitter<ChlorineRecordRequest>();

  recordForm: FormGroup;
  isSaving: boolean = false;

  recordTypes = [
    { value: 'CLORO', label: 'Cloro' },
    { value: 'SULFATO', label: 'Sulfato' }
  ];

  constructor(private fb: FormBuilder) {
    this.recordForm = this.fb.group({
      testingPointId: ['', Validators.required],
      recordDate: [new Date().toISOString().substring(0, 16), Validators.required], // Date and time
      level: [0, [Validators.required, Validators.min(0)]],
      acceptable: [true],
      actionRequired: [false],
      observations: [''],
      amount: [0, [Validators.required, Validators.min(0)]],
      recordType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initial load for edit mode if component is initialized with a record
    if (this.mode === 'edit' && this.chlorineRecord) {
      this.loadRecordData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chlorineRecord'] && changes['chlorineRecord'].currentValue) {
      this.loadRecordData();
    }
    if (changes['mode']) {
      if (this.mode === 'create') {
        this.resetForm();
      } else if (this.mode === 'edit' && this.chlorineRecord) {
        this.loadRecordData();
      }
    }
    
    // Log availableTestingPoints for debugging
    if (changes['availableTestingPoints']) {
      console.log('Available testing points updated:', this.availableTestingPoints);
    }
  }

  loadRecordData(): void {
    if (this.chlorineRecord && this.mode === 'edit') {
      // For edit mode, get the first testing point ID if available
      const testingPointId = this.chlorineRecord.testingPoints && this.chlorineRecord.testingPoints.length > 0 
        ? this.chlorineRecord.testingPoints[0] 
        : '';
      
      this.recordForm.patchValue({
        testingPointId: testingPointId,
        recordDate: this.chlorineRecord.recordDate.substring(0, 16), // Extract date and time portion
        level: this.chlorineRecord.level,
        acceptable: this.chlorineRecord.acceptable,
        actionRequired: this.chlorineRecord.actionRequired,
        observations: this.chlorineRecord.observations,
        amount: this.chlorineRecord.amount,
        recordType: this.chlorineRecord.recordType
      });
    }
  }

  resetForm(): void {
    this.recordForm.reset({
      testingPointId: '',
      recordDate: new Date().toISOString().substring(0, 16),
      level: 0,
      acceptable: true,
      actionRequired: false,
      observations: '',
      amount: 0,
      recordType: ''
    });
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
    this.recordForm.reset();
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.recordForm.value;

    const recordRequest: ChlorineRecordRequest = {
      organizationId: this.userOrganizationId,
      recordedByUserId: this.currentUserId,
      testingPointId: formValue.testingPointId,
      recordDate: new Date(formValue.recordDate).toISOString(),
      level: formValue.level,
      acceptable: formValue.acceptable,
      actionRequired: formValue.actionRequired,
      observations: formValue.observations,
      amount: formValue.amount,
      recordType: formValue.recordType
    };

    if (this.mode === 'create') {
      this.submitRecord.emit(recordRequest);
    } else {
      // For edit mode, we need the record ID which should be passed from the parent
      this.updateRecord.emit(recordRequest);
    }
    
    this.isSaving = false;
  }

  get modalTitle(): string {
    return this.mode === 'create' ? 'Nuevo Registro de Cloro' : 'Editar Registro de Cloro';
  }

  get submitButtonText(): string {
    if (this.isSaving) {
      return this.mode === 'create' ? 'Guardando Registro...' : 'Actualizando Registro...';
    }
    return this.mode === 'create' ? 'Guardar Registro' : 'Actualizar Registro';
  }
}