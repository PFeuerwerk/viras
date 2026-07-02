import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlaceholderService } from '../../../features/placeholder/services/placeholder.service';
import { PlaceholderFooterComponent } from '../../../features/placeholder/components/placeholder-footer/placeholder-footer';
import { Observable } from 'rxjs';
import { Business } from '../../../core/models/business.model';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, PlaceholderFooterComponent],
  templateUrl: './patient-layout.html'
})
export class PatientLayoutComponent implements OnInit {
  userName: string = '';
  userNameInitials: string = '';
  userRole: string = '';
  userAvatar: string = '';
  businessName: string = '';
  businessSlug: string = '';
  isMobileMenuOpen: boolean = false;
  
  businessData$: Observable<Business | undefined>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private plService: PlaceholderService
  ) {
    this.businessData$ = this.plService.businessData$;
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = `${user.nombres} ${user.apellidos}`;
      this.userNameInitials = this.userName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
      this.userRole = user.rol;
      this.userAvatar = (user as any).avatar || '';
      this.businessName = user.nombre_empresa || 'VIRAS Wellness';
      this.businessSlug = user.slug || 'clinica-dental-pro';
      
      // Cargar datos reales del negocio para el Footer sincronizado
      this.plService.loadInitialData(this.businessSlug).subscribe();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToNewAppointment(): void {
    this.router.navigate([`/${this.businessSlug}/agendar`]);
  }

  goToProfile(): void {
    this.router.navigate(['/paciente/perfil']).catch(err => {
      console.error('Error navigating to perfil:', err);
      alert('Error en Perfil: ' + (err?.message || err?.toString() || JSON.stringify(err)));
    });
  }

  // Método para el evento (navigate) del footer
  handleFooterNavigation(page: string): void {
    if (page === 'home') {
      this.router.navigate([`/${this.businessSlug}`]);
    } else {
      // Si el footer intenta navegar a otras páginas internas de la landing
      // podemos redirigir o manejar según sea necesario.
      this.router.navigate([`/${this.businessSlug}`], { fragment: page });
    }
  }
}
