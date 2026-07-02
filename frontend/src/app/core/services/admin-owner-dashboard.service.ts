import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../api.config';

export interface AdminOwnerDashboard {
  business: {
    id: string;
    nombre_empresa: string;
    slug: string;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    tipo_negocio?: string;
  } | null;
  period: {
    generatedAt: string;
    today: string;
    weekStart: string;
    monthStart: string;
  };
  operations: {
    appointmentsToday: number;
    confirmedToday: number;
    pendingToday: number;
    cancelledToday: number;
    completedToday: number;
    noShowsToday: number;
    upcomingAppointments: AdminOwnerAppointment[];
  };
  patients: {
    total: number;
    newToday: number;
    newThisMonth: number;
    recent: AdminOwnerPatient[];
  };
  staff: {
    admins: number;
    doctors: number;
    assistants: number;
  };
  financial: {
    estimatedWeeklyProduction: number;
    estimatedMonthlyProduction: number;
    budgetsThisMonth: number;
    acceptedBudgetsThisMonth: number;
    pendingBudgetsThisMonth: number;
    acceptedBudgetAmount: number;
    pendingBudgetAmount: number;
    acceptanceRate: number;
  };
  occupancy: {
    byProfessional: Array<{
      doctorId: string;
      doctorName: string;
      appointmentsThisWeek: number;
    }>;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'success';
    title: string;
    detail: string;
  }>;
}

export interface AdminOwnerAppointment {
  id: string;
  fecha: string;
  estado: string;
  servicio_cita?: string | null;
  motivoConsulta?: string | null;
  paciente: { nombres: string; apellidos: string };
  doctor: { nombres: string; apellidos: string };
}

export interface AdminOwnerPatient {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  movil1?: string | null;
  creado_en?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminOwnerDashboardService {
  private readonly http = inject(HttpClient);
  private readonly url = apiUrl('/admin-owner/dashboard');

  getDashboard(): Observable<AdminOwnerDashboard> {
    return this.http.get<AdminOwnerDashboard>(this.url);
  }
}
