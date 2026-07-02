import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AdminOwnerDashboard,
  AdminOwnerDashboardService,
} from '../../../core/services/admin-owner-dashboard.service';

@Component({
  selector: 'app-admin-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-owner-dashboard.component.html',
  styleUrl: './admin-owner-dashboard.component.css',
})
export class AdminOwnerDashboardComponent implements OnInit {
  dashboard: AdminOwnerDashboard | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private readonly dashboardService: AdminOwnerDashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.isLoading = false;
      },
      error: (err) => {
        const status = err?.status ? ` (HTTP ${err.status})` : '';
        this.error = `No se pudo cargar el panel ejecutivo del negocio${status}. Verifica que el backend actualizado este corriendo en el puerto configurado.`;
        this.isLoading = false;
      },
    });
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  getAlertIcon(type: string): string {
    if (type === 'warning') return 'warning';
    if (type === 'success') return 'verified';
    return 'info';
  }
}
