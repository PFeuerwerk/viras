import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlaceholderService } from '../../services/placeholder.service';
import { AuthService, Usuario } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-placeholder-upper-nav',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './placeholder-upper-nav.html'
})
export class PlaceholderUpperNavComponent implements OnInit, OnChanges {
    @Input() telefono: string | undefined = '';
    @Input() direccion: string | undefined = '';
    @Input() horario: string | undefined = '';

    // Datos de sesión activa
    public currentUser: Usuario | null = null;
    public currentSlug: string = '';
    public horarioResumen: string = 'Consultar Horarios';

    constructor(
        private placeholderService: PlaceholderService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.abreviarHorario();
        this.trackBusinessSlug();
        this.checkSessionStatus();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['horario']) {
            this.abreviarHorario();
        }
    }

    /**
     * Verifica si existe un usuario logueado para personalizar la barra superior.
     */
    private checkSessionStatus(): void {
        this.currentUser = this.authService.getCurrentUser();
    }

    /**
     * Obtiene el slug del negocio actual para navegación contextual.
     */
    private trackBusinessSlug(): void {
        this.placeholderService.businessData$.subscribe(data => {
            if (data && data.slug) {
                this.currentSlug = data.slug;
            }
        });
    }

    private abreviarHorario(): void {
        if (!this.horario || this.horario.trim() === '') {
            this.horarioResumen = 'Horarios Disponibles';
            return;
        }
        this.horarioResumen = 'Ver Horarios de Atención';
    }

    /**
     * Lógica de Redirección Inteligente:
     * Si no hay sesión: Va al Login.
     * Si hay sesión: Envía al usuario a su panel correspondiente según su rol.
     */
    handleAuthAction(): void {
        if (!this.currentUser) {
            this.router.navigate(['/auth/login']);
            return;
        }

        // Brain Routing basado en Roles
        const role = this.authService.getUserRole().toUpperCase();

        if (role === 'TECHSOFT') {
            this.router.navigate(['/techsoft/dashboard']);
        } else if (role === 'ADMIN' || role === 'DOCTOR') {
            this.router.navigate(['/admin/business-config']);
        } else if (role === 'PACIENTE') {
            this.router.navigate(['/paciente/dashboard']);
        } else {
            this.router.navigate(['/auth/login']);
        }
    }

    /**
     * Redirige al registro. Si hay sesión, este botón suele ocultarse en el HTML.
     */
    goToRegister(): void {
        if (this.currentSlug) {
            this.router.navigate([`/${this.currentSlug}/registro`]);
        } else {
            this.router.navigate(['/auth/register']);
        }
    }

    logout(): void {
        this.authService.logout();
        this.currentUser = null;
        this.router.navigate(['/']); // Recarga la landing pública
    }
}
