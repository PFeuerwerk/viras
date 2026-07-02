import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CitasService } from '../../../core/services/citas/citas.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cita } from '../../../core/models/cita.model';

@Component({
    selector: 'app-mis-citas',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './mis-citas.component.html'
})
export class MisCitasComponent implements OnInit {
    // Listados categorizados para una UX de Clase Mundial
    public citasProximas: Cita[] = [];
    public citasPasadas: Cita[] = [];

    public userId: string = '';
    public userName: string = '';
    public userRole: string = '';
    public userAvatar: string = '';
    public loading: boolean = true;

    // Gestión de Estados para Feedback Dinámico
    public showConfirmModal = false;
    public showSuccessToast = false;
    public citaParaAnular: Cita | null = null;
    public mensajeToast = '';
    public isProcessing = false;

    constructor(
        private citasService: CitasService,
        private authService: AuthService,
        public router: Router // Cambiado a public para ser accesible desde el HTML
    ) { }

    ngOnInit(): void {
        this.syncSession();
        this.fetchCitas();
    }

    /**
     * Sincronización Segura: Obtiene los datos del AuthService centralizado.
     */
    private syncSession(): void {
        const user = this.authService.getCurrentUser();
        if (user && user.id) {
            this.userId = user.id;
            this.userName = `${user.nombres} ${user.apellidos}`;
            this.userRole = user.rol || 'PACIENTE';
            this.userAvatar = (user as any).avatar || '';
        } else {
            this.logout();
        }
    }

    /**
     * Recupera y organiza las citas cronológicamente.
     */
    public fetchCitas(): void {
        if (!this.userId) return;

        this.loading = true;
        this.citasService.getCitasByPaciente(this.userId).subscribe({
            next: (data) => {
                const ahora = new Date();

                // Categorización inteligente de consultas
                this.citasProximas = data
                    .filter(c => new Date(c.fecha) >= ahora && c.estado !== 'CANCELADA')
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

                this.citasPasadas = data
                    .filter(c => new Date(c.fecha) < ahora || c.estado === 'CANCELADA')
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                this.loading = false;
            },
            error: (err) => {
                console.error('[MisCitas] Error al recuperar historial:', err);
                this.loading = false;
            }
        });
    }

    // --- ACCIONES OPERATIVAS ---

    public pedirConfirmacionAnular(cita: Cita): void {
        this.citaParaAnular = cita;
        this.showConfirmModal = true;
    }

    public cerrarModal(): void {
        if (!this.isProcessing) {
            this.showConfirmModal = false;
            this.citaParaAnular = null;
        }
    }

    public confirmarAnulacion(): void {
        if (!this.citaParaAnular || !this.citaParaAnular.id) return;

        this.isProcessing = true;
        const idCita = this.citaParaAnular.id;

        this.citasService.updateCitaEstado(idCita, 'CANCELADA').subscribe({
            next: () => {
                this.isProcessing = false;
                this.showConfirmModal = false;
                this.mostrarToast('Cita anulada correctamente.');
                this.fetchCitas(); // Refresco reactivo
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('[MisCitas] Fallo al anular:', err);
                alert('No se pudo procesar la cancelación.');
            }
        });
    }

    private mostrarToast(mensaje: string): void {
        this.mensajeToast = mensaje;
        this.showSuccessToast = true;
        setTimeout(() => this.showSuccessToast = false, 4000);
    }

    // --- NAVEGACIÓN ---

    public volver(): void {
        this.router.navigate(['/paciente/dashboard']);
    }

    public logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
