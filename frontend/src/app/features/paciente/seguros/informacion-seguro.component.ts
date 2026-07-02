import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../../../core/services/auth.service';
import { PlaceholderService } from '../../placeholder/services/placeholder.service';
import { Business } from '../../../core/models/business.model';
import { apiUrl } from '../../../core/api.config';

@Component({
  selector: 'app-informacion-seguro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './informacion-seguro.component.html'
})
export class InformacionSeguroComponent implements OnInit {
  seguroForm!: FormGroup;
  currentUser: Usuario | null = null;
  businessData: Business | undefined;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private plService: PlaceholderService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBusinessData();
    this.initForm();
  }

  private loadBusinessData(): void {
    const slug = this.currentUser?.slug || 'clinica-dental-pro';
    this.plService.loadInitialData(slug).subscribe(data => {
      this.businessData = data;
    });
  }

  private initForm(): void {
    this.seguroForm = this.fb.group({
      paciente_id: [this.currentUser?.id],
      
      // 2. SEGURO
      aseguradora_compania: [''],
      aseguradora_poliza: [''],
      aseguradora_titular: [''],
      aseguradora_numero: [''],
      aseguradora_cobertura: [''],
      
      // 3. PLAN TRATAMIENTO
      diagnostico_general: [''],
      plan_tratamiento: this.fb.array([this.createPlanItem()]),
      observaciones_clinicas: [''],
      
      // 4. PRESUPUESTO
      importe_total: [0, Validators.required],
      aceptacion_economica: [false, Validators.requiredTrue],
      
      // 5. PAGO
      modalidad_pago: ['pago_unico'],
      detalle_pagos: this.fb.array([this.createPagoItem()]),
      
      // 6. VALIDEZ
      validez_dias: [30],
      
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      firma_paciente: [''],
      firma_representante: [''],
      firma_profesional: ['']
    });
  }

  get planTratamiento() { return this.seguroForm.get('plan_tratamiento') as FormArray; }
  get detallePagos() { return this.seguroForm.get('detalle_pagos') as FormArray; }

  createPlanItem(): FormGroup {
    return this.fb.group({
      fase: [''],
      tratamiento: [''],
      duracion: [''],
      importe: [0]
    });
  }

  addPlanItem(): void { this.planTratamiento.push(this.createPlanItem()); }
  removePlanItem(i: number): void { this.planTratamiento.removeAt(i); }

  createPagoItem(): FormGroup {
    return this.fb.group({
      concepto: [''],
      fecha: [''],
      importe: [0]
    });
  }

  addPagoItem(): void { this.detallePagos.push(this.createPagoItem()); }
  removePagoItem(i: number): void { this.detallePagos.removeAt(i); }

  onSubmit(): void {
    if (this.seguroForm.invalid) return;
    this.isSaving = true;
    this.http.post(apiUrl('/presupuestos'), this.seguroForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Presupuesto y Plan de Tratamiento guardados correctamente.';
        setTimeout(() => this.router.navigate(['/paciente/dashboard']), 2000);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Error al guardar el presupuesto.';
      }
    });
  }

  printPage(): void { window.print(); }
  goBack(): void { this.router.navigate(['/paciente/dashboard']); }
}
