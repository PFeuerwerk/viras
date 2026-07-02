import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService, Usuario } from '../../../core/services/auth.service';
import { CitasService } from '../../../core/services/citas/citas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Cita } from '../../../core/models/cita.model';

interface DoctorDayGroup {
  doctorId: string;
  doctorName: string;
  citas: Cita[];
}

interface AssistantStats {
  totalToday: number;
  confirmed: number;
  pending: number;
  absent: number;
  cancelled: number;
  freeSlots: number;
}

@Component({
  selector: 'app-asistente-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './asistente-dashboard.component.html',
  styleUrl: './asistente-dashboard.component.css'
})
export class AsistenteDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);

  isLoading = true;
  isSavingPatient = false;
  errorMessage = '';
  successMessage = '';

  businessId: string | null = null;
  selectedDate = this.toDateInputValue(new Date());
  doctors: Usuario[] = [];
  patients: Usuario[] = [];
  citas: Cita[] = [];
  doctorGroups: DoctorDayGroup[] = [];
  editingCitaId: string | null = null;
  rescheduleValue = '';

  stats: AssistantStats = {
    totalToday: 0,
    confirmed: 0,
    pending: 0,
    absent: 0,
    cancelled: 0,
    freeSlots: 0
  };

  patientForm = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    movil1: [''],
    numero_documento: [''],
    fecha_nacimiento: [''],
    genero: [''],
    direccion: [''],
    dentista_id: ['']
  });

  constructor(
    private authService: AuthService,
    private citasService: CitasService,
    private usuariosService: UsuariosService
  ) { }

  ngOnInit(): void {
    this.businessId = this.authService.getBusinessId();
    if (!this.businessId) {
      this.errorMessage = 'No se pudo identificar el negocio del asistente.';
      this.isLoading = false;
      return;
    }

    this.loadDashboard();
  }

  loadDashboard(): void {
    if (!this.businessId) return;

    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      citas: this.citasService.getCitasByBusiness(this.businessId),
      doctors: this.usuariosService.listarPorNegocio(this.businessId, 'DOCTOR'),
      patients: this.usuariosService.listarPorNegocio(this.businessId, 'PACIENTE')
    }).subscribe({
      next: ({ citas, doctors, patients }) => {
        this.citas = citas;
        this.doctors = doctors;
        this.patients = patients;
        this.rebuildView();
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'No se pudo cargar el panel del asistente.';
        this.isLoading = false;
      }
    });
  }

  onDateChange(value: string): void {
    this.selectedDate = value;
    this.rebuildView();
  }

  cambiarEstado(cita: Cita, estado: Cita['estado']): void {
    if (!cita.id) return;

    this.citasService.updateCitaEstado(cita.id, estado).subscribe({
      next: () => this.loadDashboard(),
      error: (error: Error) => this.errorMessage = error.message || 'No se pudo actualizar la cita.'
    });
  }

  startReschedule(cita: Cita): void {
    this.editingCitaId = cita.id || null;
    this.rescheduleValue = this.toDatetimeLocalValue(cita.fecha);
  }

  cancelReschedule(): void {
    this.editingCitaId = null;
    this.rescheduleValue = '';
  }

  saveReschedule(cita: Cita): void {
    if (!cita.id || !this.rescheduleValue) return;

    this.citasService.createCita({
      id: cita.id,
      fecha: new Date(this.rescheduleValue).toISOString(),
      estado: cita.estado,
      motivoConsulta: cita.motivoConsulta,
      duracionEstimada: cita.duracionEstimada
    }).subscribe({
      next: () => {
        this.cancelReschedule();
        this.loadDashboard();
      },
      error: (error: Error) => this.errorMessage = error.message || 'No se pudo reprogramar la cita.'
    });
  }

  crearPaciente(): void {
    if (!this.businessId || this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSavingPatient = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.patientForm.getRawValue();
    const payload = {
      ...formValue,
      rol: 'PACIENTE',
      password_hash: this.generateTemporaryPassword()
    };

    this.usuariosService.crearPacienteEnNegocio(payload).subscribe({
      next: () => {
        this.successMessage = 'Paciente creado correctamente. Ya puede asignarse a una cita.';
        this.patientForm.reset();
        this.isSavingPatient = false;
        this.loadDashboard();
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'No se pudo crear el paciente.';
        this.isSavingPatient = false;
      }
    });
  }

  getDoctorName(cita: Cita): string {
    if (cita.doctor) return `${cita.doctor.nombres} ${cita.doctor.apellidos}`;
    const doctor = this.doctors.find(item => item.id === cita.doctor_id);
    return doctor ? `${doctor.nombres} ${doctor.apellidos}` : 'Doctor sin asignar';
  }

  getPatientName(cita: Cita): string {
    if (!cita.paciente) return 'Paciente sin datos';
    return `${cita.paciente.nombres} ${cita.paciente.apellidos}`;
  }

  trackByGroup(_: number, group: DoctorDayGroup): string {
    return group.doctorId;
  }

  trackByCita(_: number, cita: Cita): string {
    return cita.id || `${cita.doctor_id}-${cita.paciente_id}-${cita.fecha}`;
  }

  private rebuildView(): void {
    const citasDelDia = this.citas
      .filter(cita => this.toDateInputValue(new Date(cita.fecha)) === this.selectedDate)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    this.stats = {
      totalToday: citasDelDia.filter(cita => cita.estado !== 'CANCELADA').length,
      confirmed: citasDelDia.filter(cita => cita.estado === 'CONFIRMADA').length,
      pending: citasDelDia.filter(cita => cita.estado === 'PENDIENTE').length,
      absent: citasDelDia.filter(cita => cita.estado === 'AUSENTE').length,
      cancelled: citasDelDia.filter(cita => cita.estado === 'CANCELADA').length,
      freeSlots: Math.max((this.doctors.length * 8) - citasDelDia.filter(cita => cita.estado !== 'CANCELADA').length, 0)
    };

    const groups = new Map<string, DoctorDayGroup>();

    for (const doctor of this.doctors) {
      if (!doctor.id) continue;
      groups.set(doctor.id, {
        doctorId: doctor.id,
        doctorName: `${doctor.nombres} ${doctor.apellidos}`,
        citas: []
      });
    }

    for (const cita of citasDelDia) {
      const doctorId = cita.doctor?.id || cita.doctor_id || 'sin-doctor';
      if (!groups.has(doctorId)) {
        groups.set(doctorId, {
          doctorId,
          doctorName: this.getDoctorName(cita),
          citas: []
        });
      }

      groups.get(doctorId)?.citas.push(cita);
    }

    this.doctorGroups = Array.from(groups.values()).filter(group => group.citas.length > 0);
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDatetimeLocalValue(value: Date | string): string {
    const date = new Date(value);
    const datePart = this.toDateInputValue(date);
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${datePart}T${hours}:${minutes}`;
  }

  private generateTemporaryPassword(): string {
    const bytes = new Uint32Array(2);
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
      return `Viras-${bytes[0].toString(36)}${bytes[1].toString(36)}`.slice(0, 18);
    }

    return `Viras-${Date.now().toString(36)}`;
  }
}
