import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CitasService } from '../../../core/services/citas/citas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  userRole: string = '';
  userName: string = '';
  userId: string = '';
  userAvatar: string = '';
  businessId: string = '';
  businessSlug: string = ''; // ✅ NUEVO

  hasCitas: boolean = false;
  isLoadingCitas: boolean = true;

  showDeleteModal = false;
  isDeleting = false;

  constructor(
    private authService: AuthService,
    private citasService: CitasService,
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.syncUserData();
    this.fetchUserAppointments();
  }

  private syncUserData(): void {
    const user = this.authService.getCurrentUser();

    if (user && user.id) {
      this.userId = user.id;
      this.userName = `${user.nombres} ${user.apellidos}`;
      this.userRole = user.rol;
      this.businessId = user.business_id || '';
      this.businessSlug = user.slug || 'clinica-dental-pro'; // ✅ CLAVE
      this.userAvatar = (user as any).avatar || '';
    } else {
      this.logout();
    }
  }

  private fetchUserAppointments(): void {
    if (!this.userId) return;

    this.isLoadingCitas = true;

    this.citasService.getCitas().subscribe({
      next: (citas) => {
        const citasPaciente = citas.filter(c => c.paciente_id === this.userId);
        this.hasCitas = citasPaciente.length > 0;
        this.isLoadingCitas = false;
      },
      error: (err) => {
        console.error('Error al recuperar historial de citas:', err);
        this.isLoadingCitas = false;
      }
    });
  }

  // --- NAVEGACIÓN CORRECTA SaaS ---

  goToProfile(): void {
    this.router.navigate(['/paciente/perfil']).catch(err => {
      console.error('Error navigating to perfil:', err);
      alert('Error en Perfil: ' + (err?.message || err?.toString() || JSON.stringify(err)));
    });
  }

  /**
   * ✅ FIX CRÍTICO:
   * En lugar de ir al calendario → ir al flujo booking del negocio
   */
  goToNewAppointment(): void {
    if (!this.businessSlug) {
      console.warn('No se encontró slug del negocio');
      return;
    }

    this.router.navigate([`/${this.businessSlug}/agendar`]);
  }

  goToListCitas(): void {
    if (this.hasCitas) {
      this.router.navigate(['/paciente/mis-citas']);
    }
  }

  goToAnamnesis(): void {
    this.router.navigate(['/paciente/anamnesis']);
  }

  goToDentalHistory(): void {
    // Proximamente se implementará la ruta y el componente
    alert('Próximamente: Formulario de Historial Dental');
  }

  goToInsuranceInfo(): void {
    this.router.navigate(['/paciente/seguro']);
  }

  goToConsent(type: string): void {
    this.router.navigate(['/paciente/consentimientos', type]);
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
    }
  }

  executeDeleteAccount(): void {
    if (!this.userId) return;

    this.isDeleting = true;

    this.usuariosService.eliminar(this.userId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.logout();
      },
      error: (err) => {
        console.error('Error crítico al eliminar cuenta:', err);
        this.isDeleting = false;
        this.showDeleteModal = false;
        alert('No se pudo procesar la solicitud.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}