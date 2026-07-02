import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Professional } from '../../../../../core/services/professionals/professionals';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CitasService } from '../../../../../core/services/citas/citas.service';
import { Cita } from '../../../../../core/models/cita.model';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cita-modal.html',
})
export class CitaModalComponent implements OnInit, OnChanges {
  @Input() selectedDate: string = '';
  @Input() businessId: string | null = null;
  @Input() doctorId: string | null = null;
  @Input() pacienteId: string | null = null;
  @Input() operadorId: string | null = null;
  @Input() wizardData: any = null;
  @Input() doctors: Professional[] = [];

  @Output() onSave = new EventEmitter<Cita>();
  @Output() onClose = new EventEmitter<void>();

  citaForm!: FormGroup;

  antecedentesClinicos: string[] = [
    'Diabetes',
    'Hipertensión',
    'Asma',
    'Alergías',
    'Tabaquismo',
    'Alcohol',
    'Embarazo',
    'Medicación actual',
    'Cirugías previas',
    'Problemas cardíacos'
  ];

  constructor(private fb: FormBuilder, private citasService: CitasService) { }

  ngOnInit(): void {
    this.loadPendingBookingFallback();
    this.initForm();

    if (this.wizardData) {
      this.applyWizardData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.citaForm) {
      this.citaForm.patchValue({ fecha: this.selectedDate });
    }

    if (changes['doctorId'] && this.citaForm && !this.citaForm.get('doctorId')?.value) {
      this.citaForm.patchValue({ doctorId: this.doctorId });
    }

    if (changes['wizardData'] && this.wizardData && this.citaForm) {
      this.applyWizardData();
    }
  }

  private loadPendingBookingFallback(): void {
    if (this.wizardData) return;

    const saved = sessionStorage.getItem('pending_booking');
    if (!saved) return;

    try {
      this.wizardData = JSON.parse(saved);
    } catch {
      this.wizardData = null;
    }
  }

  private initForm(): void {
    this.citaForm = this.fb.group({
      doctorId: [this.doctorId || '', [Validators.required]],
      motivoConsulta: [this.resolveServicioCita(), [Validators.required, Validators.minLength(3)]],
      fecha: [this.selectedDate, [Validators.required]],
      duracionEstimada: [this.resolveDuracionEstimada(), [Validators.required, Validators.min(15)]],
      antecedentesClinicos: this.fb.array([]),
      notasInternas: [''],
    });
  }

  private applyWizardData(): void {
    if (!this.wizardData || !this.citaForm) return;

    this.citaForm.patchValue({
      motivoConsulta: this.resolveServicioCita(),
      duracionEstimada: this.resolveDuracionEstimada(),
      notasInternas: ''
    });
  }

  private resolveDuracionEstimada(): number {
    return Number(
      this.wizardData?.duracionEstimada ||
      this.wizardData?.duracion_minutos ||
      this.wizardData?.duracion ||
      30
    );
  }

  private resolveServicioCita(): string {
    if (!this.wizardData) return 'Consulta médica';

    if (this.wizardData.servicio_cita) return this.wizardData.servicio_cita;
    if (this.wizardData.servicioCita) return this.wizardData.servicioCita;
    if (this.wizardData.titulo) return this.wizardData.titulo;
    if (this.wizardData.nombreServicio) return this.wizardData.nombreServicio;

    return 'Consulta médica';
  }

  get antecedentesArray(): FormArray {
    return this.citaForm.get('antecedentesClinicos') as FormArray;
  }

  isAntecedenteSelected(antecedente: string): boolean {
    return this.antecedentesArray.value.includes(antecedente);
  }

  toggleAntecedente(antecedente: string): void {
    const index = this.antecedentesArray.value.indexOf(antecedente);

    if (index >= 0) {
      this.antecedentesArray.removeAt(index);
    } else {
      this.antecedentesArray.push(this.fb.control(antecedente));
    }
  }

  save(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    const formData = this.citaForm.value;

    if (!this.pacienteId || !formData.doctorId) {
      alert('Error: Datos de sesión o profesional incompletos. Por favor, re-inicie sesión.');
      return;
    }

    const antecedentes = Array.isArray(formData.antecedentesClinicos)
      ? formData.antecedentesClinicos
      : [];

    const observacionesPaciente = formData.notasInternas || '';
    const servicioCita = formData.motivoConsulta || this.resolveServicioCita();

    const nuevaCita: any = {
      business_id: this.wizardData?.business_id || this.businessId,
      usuario_id: String(this.pacienteId),
      doctor_id: String(formData.doctorId),
      fecha: new Date(formData.fecha).toISOString(),
      motivoConsulta: servicioCita,
      duracionEstimada: Number(formData.duracionEstimada),
      notasInternas: observacionesPaciente,
      antecedentes_clinicos: antecedentes,
      observaciones_paciente: observacionesPaciente,
      nivel_dolor: this.wizardData?.nivelDolor ?? null,
      tipo_paciente: this.wizardData?.tipoPaciente ?? 'REGRESA',
      servicio_cita: servicioCita,
      estado: 'PENDIENTE',
      creadoPor: this.operadorId || this.pacienteId
    };

    this.citasService.createCita(nuevaCita).subscribe({
      next: (citaCreada: Cita) => {
        console.log('Cita agendada con éxito:', citaCreada);
        this.onSave.emit(citaCreada);
      },
      error: (err: any) => {
        console.error('Fallo en la creación de cita:', err);
        const msg = err.error?.message || 'Error al conectar con el servidor.';
        alert(`No se pudo agendar la cita: ${msg}`);
      },
    });
  }

  close(): void {
    this.onClose.emit();
  }
}
