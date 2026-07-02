import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CitasService } from '../../core/services/citas/citas.service';
import { PlaceholderService } from './services/placeholder.service';

// IMPORTACIÓN DE SUB-COMPONENTES
import { PlaceholderServicesComponent } from './components/placeholder-services/placeholder-services';
import { PlaceholderUpperNavComponent } from './components/placeholder-upper-nav/placeholder-upper-nav';
import { PlaceholderHeroComponent } from './components/placeholder-hero/placeholder-hero';
import { PlaceholderBookingModalComponent } from './components/placeholder-booking-modal/placeholder-booking-modal';
import { PlaceholderCtaBannerComponent } from './components/placeholder-cta-banner/placeholder-cta-banner';
import { PlaceholderInfoGridComponent } from './components/placeholder-info-grid/placeholder-info-grid';
import { PlaceholderTestimonialsComponent } from './components/placeholder-testimonials/placeholder-testimonials';
import { PlaceholderChatComponent } from './components/placeholder-chat/placeholder-chat';
import { PlaceholderFooterComponent } from './components/placeholder-footer/placeholder-footer';
import { PlaceholderStaffComponent } from './components/placeholder-staff/placeholder-staff';

// IMPORTACIÓN DE PÁGINAS INTERNAS
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { WhatWeDoComponent } from './pages/what-we-do/what-we-do';
import { HistoryComponent } from './pages/history/history';

import { Observable } from 'rxjs';
import { Business } from '../../core/models/business.model';
import { Professional } from '../../core/services/professionals/professionals';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PlaceholderServicesComponent,
    PlaceholderUpperNavComponent,
    PlaceholderHeroComponent,
    PlaceholderBookingModalComponent,
    PlaceholderCtaBannerComponent,
    PlaceholderInfoGridComponent,
    PlaceholderTestimonialsComponent,
    PlaceholderStaffComponent,
    PlaceholderChatComponent,
    PlaceholderFooterComponent,
    AboutComponent,
    ContactComponent,
    WhatWeDoComponent,
    HistoryComponent
  ],
  templateUrl: './placeholder.html'
})
export class Placeholder implements OnInit {
  businessData$: Observable<Business | undefined>;
  staff$: Observable<Professional[]>;

  isLoading = true;
  error = false;
  isMobileMenuOpen = false;
  activeDropdown: string | null = null;
  isScrolled = false;
  showBookingModal = false;
  isBooking = false;
  bookingSuccess = false;

  currentPage: 'home' | 'about' | 'services' | 'contact' | 'what-we-do' | 'history' = 'home';

  nuevaReserva = {
    fecha: '',
    hora: '',
    professionalId: '',
    motivo: ''
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public plService: PlaceholderService,
    private authService: AuthService,
    private citasService: CitasService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.businessData$ = this.plService.businessData$;
    this.staff$ = this.plService.staff$;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset = window.pageYOffset || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    this.isScrolled = offset > 50;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.plService.loadInitialData(slug).subscribe({
        next: () => {
          this.isLoading = false;
          this.route.fragment.subscribe(frag => this.handleRouteFragment(frag));
        },
        error: () => {
          this.isLoading = false;
          this.error = true;
        }
      });
    } else {
      this.isLoading = false;
      this.error = true;
    }
  }

  navigateTo(page: any): void {
    this.currentPage = page;
    this.closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'services') {
      this.currentPage = 'home';
      setTimeout(() => {
        const el = this.document.getElementById('servicios'); // Corregido ID
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  private handleRouteFragment(fragment: string | null): void {
    const pageByFragment: Record<string, string> = {
      acerca: 'about',
      servicios: 'services',
      contacto: 'contact',
      historia: 'history',
      'que-hacemos': 'what-we-do'
    };

    if (fragment && pageByFragment[fragment]) {
      this.navigateTo(pageByFragment[fragment]);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) this.activeDropdown = null;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
  }

  toggleDropdown(menu: string) {
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }

  /**
   * LÓGICA DE AGENDAMIENTO DE CLASE MUNDIAL
   * Redirige al Wizard de citas o al Calendario según el estado de sesión.
   */
  onAgendaCita(): void {
    this.closeMobileMenu();
    const slug = this.route.snapshot.paramMap.get('slug') || 'clinica-dental-pro';
    
    // El usuario solicita que SIEMPRE se redirija a la página de "Programa tu cita" (Wizard)
    // independientemente de si hay sesión iniciada o no.
    this.router.navigate([`/${slug}/agendar`]);
  }

  // Los métodos de reserva directa mediante modal se mantienen 
  // para usuarios que ya están logueados y operan desde la landing.
  confirmarReserva(): void {
    if (!this.nuevaReserva.fecha || !this.nuevaReserva.hora) return;
    this.isBooking = true;
    const user = this.authService.getCurrentUser();
    const data = this.plService.businessDataSubject.value;
    const fechaCompleta = new Date(`${this.nuevaReserva.fecha}T${this.nuevaReserva.hora}`);

    const citaPayload: any = {
      business_id: data?.id,
      paciente_id: user?.id,
      doctor_id: this.nuevaReserva.professionalId,
      fecha: fechaCompleta,
      motivoConsulta: this.nuevaReserva.motivo,
      estado: 'PENDIENTE'
    };

    this.citasService.createCita(citaPayload).subscribe({
      next: () => {
        this.isBooking = false;
        this.bookingSuccess = true;
        setTimeout(() => this.closeModal(), 3000);
      },
      error: () => this.isBooking = false
    });
  }

  closeModal(): void {
    this.showBookingModal = false;
    this.bookingSuccess = false;
    this.nuevaReserva = { fecha: '', hora: '', professionalId: '', motivo: '' };
  }

  openLink(url?: string): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
