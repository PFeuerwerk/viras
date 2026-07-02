import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Soporte para TechSoft
import { CitasService } from '../../../core/services/citas/citas.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-citas-master',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas-master.html',
  styleUrl: './citas-master.css'
})
export class CitasMasterComponent implements OnInit {
  // Listados clasificados para eficiencia operativa
  citasHoy: Cita[] = [];
  citasProximas: Cita[] = [];
  citasHistorial: Cita[] = [];

  isLoading = true;
  error: string | null = null;
  businessId: string | null = null;

  constructor(
    private citasService: CitasService,
    private authService: AuthService,
    private route: ActivatedRoute // Inyectado para soporte multi-tenant
  ) { }

  ngOnInit(): void {
    this.detectContextAndLoad();
  }

  /**
   * Detecta si es Rosita (su negocio) o TechSoft (negocio ajeno) y carga la agenda.
   */
  private detectContextAndLoad(): void {
    const urlBId = this.route.snapshot.queryParamMap.get('bId');
    const authBId = this.authService.getBusinessId();
    this.businessId = urlBId || authBId;

    if (!this.businessId) {
      this.error = 'No se pudo identificar el contexto del negocio para cargar la agenda.';
      this.isLoading = false;
      return;
    }

    this.cargarCitasDelNegocio();
  }

  /**
   * Recupera las citas y las organiza cronológicamente para el staff.
   */
  cargarCitasDelNegocio(): void {
    if (!this.businessId) return;

    this.isLoading = true;
    this.citasService.getCitasByBusiness(this.businessId).subscribe({
      next: (data: Cita[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);

        // Clasificación de Clase Mundial para facilitar el trabajo del Doctor/Asistente
        this.citasHoy = data.filter(c => {
          const fechaCita = new Date(c.fecha);
          return fechaCita >= hoy && fechaCita < mañana && c.estado !== 'CANCELADA';
        });

        this.citasProximas = data.filter(c => {
          const fechaCita = new Date(c.fecha);
          return fechaCita >= mañana && c.estado !== 'CANCELADA';
        });

        this.citasHistorial = data.filter(c => {
          const fechaCita = new Date(c.fecha);
          return fechaCita < hoy || c.estado === 'CANCELADA';
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('[CitasMaster] Fallo en carga:', err);
        this.error = 'No se pudo sincronizar la agenda con el servidor.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Gestión de estados: Permite al Staff confirmar, finalizar o anular.
   */
  cambiarEstado(citaId: string | undefined, nuevoEstado: string): void {
    if (!citaId) return;

    this.citasService.updateCitaEstado(citaId, nuevoEstado as any).subscribe({
      next: () => {
        // Recarga optimizada: solo refrescamos los listados
        this.cargarCitasDelNegocio();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Hubo un problema al cambiar el estado. Reintente.');
      }
    });
  }

  /**
   * Helper para el color de los badges según el estado
   */
  getStatusClass(estado: string): string {
    return `status-${estado.toLowerCase()}`;
  }
}
