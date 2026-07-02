import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

import { PlaceholderService } from '../../services/placeholder.service';
import { Business, BookingService } from '../../../../core/models/business.model';

import { PlaceholderUpperNavComponent } from '../../components/placeholder-upper-nav/placeholder-upper-nav';
import { PlaceholderFooterComponent } from '../../components/placeholder-footer/placeholder-footer';

export type TipoPaciente = 'NUEVO' | 'REGRESA';

export interface BookingState {
    tipoPaciente: TipoPaciente | null;
    tipoCitaId: number | null;
    nivelDolor: number | null;
    duracionEstimada: number;
}

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PlaceholderUpperNavComponent,
        PlaceholderFooterComponent
    ],
    templateUrl: './booking.html'
})
export class BookingComponent implements OnInit {

    businessData: Business | null = null;
    isLoggedPatient = false;

    currentStep = signal(1);

    bookingState = signal<BookingState>({
        tipoPaciente: null,
        tipoCitaId: null,
        nivelDolor: null,
        duracionEstimada: 15
    });

    canProceed = computed(() => {
        const state = this.bookingState();
        if (!state.tipoPaciente || state.tipoCitaId === null) return false;

        const citaSeleccionada = this.businessData?.booking_services?.[state.tipoCitaId];
        if (citaSeleccionada?.es_emergencia && state.nivelDolor === null) return false;

        return true;
    });

    caritasDolor = [
        { nivel: 1, label: 'Ningún Dolor', icono: 'sentiment_very_satisfied', color: '#10b981' },
        { nivel: 2, label: 'Dolor suave', icono: 'sentiment_satisfied', color: '#84cc16' },
        { nivel: 3, label: 'Moderado', icono: 'sentiment_neutral', color: '#facc15' },
        { nivel: 4, label: 'Severo', icono: 'sentiment_dissatisfied', color: '#f97316' },
        { nivel: 5, label: 'Muy severo', icono: 'sentiment_very_dissatisfied', color: '#ef4444' },
        { nivel: 6, label: 'Insoportable', icono: 'mood_bad', color: '#b91c1c' }
    ];

    isScrolled = false;
    isMobileMenuOpen = false;
    activeDropdown: string | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private placeholderService: PlaceholderService
    ) { }

    ngOnInit(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const currentUser = this.authService.getCurrentUser();
        this.isLoggedPatient = currentUser?.rol === 'PACIENTE';

        if (this.isLoggedPatient) {
            this.bookingState.update(s => ({
                ...s,
                tipoPaciente: 'REGRESA'
            }));
        }

        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug) {
            this.placeholderService.businessData$.subscribe(data => {
                if (data) {
                    this.businessData = data;
                } else {
                    this.placeholderService.loadInitialData(slug).subscribe(d => this.businessData = d);
                }
            });
        }
    }

    navigateTo(page: string): void {
        const slug = this.route.snapshot.paramMap.get('slug') || 'clinica-dental-pro';
        this.closeMobileMenu();

        if (page === 'home') {
            this.router.navigate([`/${slug}`]);
        } else {
            this.router.navigate([`/${slug}`], { fragment: this.getLandingFragment(page) });
        }
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        if (!this.isMobileMenuOpen) this.activeDropdown = null;
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
        this.activeDropdown = null;
    }

    toggleDropdown(menu: string): void {
        this.activeDropdown = this.activeDropdown === menu ? null : menu;
    }

    private getLandingFragment(page: string): string {
        const fragmentByPage: Record<string, string> = {
            about: 'acerca',
            services: 'servicios',
            contact: 'contacto',
            history: 'historia',
            'what-we-do': 'que-hacemos'
        };

        return fragmentByPage[page] ?? 'servicios';
    }

    selectTipoPaciente(tipo: TipoPaciente) {
        if (this.isLoggedPatient && tipo === 'NUEVO') return;

        this.bookingState.update(s => ({ ...s, tipoPaciente: tipo }));
    }

    selectCita(index: number, service: BookingService) {
        this.bookingState.update(s => ({
            ...s,
            tipoCitaId: index,
            duracionEstimada: service.duracion_minutos
        }));

        if (service.es_emergencia) {
            setTimeout(() => {
                const element = document.getElementById('pain-scale-container');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 150);
        } else {
            this.bookingState.update(s => ({ ...s, nivelDolor: null }));
        }
    }

    selectDolor(nivel: number) {
        this.bookingState.update(s => ({ ...s, nivelDolor: nivel }));
    }

    proceedToDateTime() {
        if (!this.canProceed()) return;

        const state = this.bookingState();
        const slug = this.route.snapshot.paramMap.get('slug') || 'dental-clinic';
        const selectedService = state.tipoCitaId !== null
            ? this.businessData?.booking_services?.[state.tipoCitaId]
            : null;

        const pendingBooking = {
            ...state,
            tipoPaciente: this.isLoggedPatient ? 'REGRESA' : state.tipoPaciente,
            business_id: this.businessData?.id || null,
            business_name: this.businessData?.nombre_empresa || null,
            servicio_cita: selectedService?.titulo || 'Consulta médica',
            es_emergencia: selectedService?.es_emergencia || false,
            duracionEstimada: selectedService?.duracion_minutos || state.duracionEstimada
        };

        sessionStorage.setItem('pending_booking', JSON.stringify(pendingBooking));

        if (this.isLoggedPatient) {
            this.router.navigate(['/paciente/calendar']);
            return;
        }

        if (state.tipoPaciente === 'NUEVO') {
            this.router.navigate([`/${slug}/registro`]);
        } else {
            this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: '/paciente/calendar' }
            });
        }
    }
}
