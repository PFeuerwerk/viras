import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-placeholder-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-hero.html'
})
export class PlaceholderHeroComponent implements OnInit {
    // Inputs dinámicos para el modo público (CMS)
    @Input() titulo: string | undefined = '';
    @Input() slogan: string | undefined = '';
    @Input() heroImage: string | undefined = '';

    // Datos de sesión para personalización proactiva
    public currentUser: Usuario | null = null;
    public userRole: string = '';

    // Evento para el botón de acción principal
    @Output() onAction = new EventEmitter<void>();

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadSessionContext();
    }

    /**
     * Identifica quién visita la página para personalizar la experiencia.
     * Solo aplica para Pacientes, Doctores y Asistentes en la web pública.
     */
    private loadSessionContext(): void {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            this.userRole = this.authService.getUserRole().toUpperCase();
        }
    }

    /**
     * Lógica de Acción Inteligente:
     * 1. Si no hay sesión: Ejecuta la acción normal (Wizard de Citas).
     * 2. Si hay sesión: Redirige al Dashboard correspondiente según el rol.
     */
    handlePrimaryAction(): void {
        if (!this.currentUser) {
            this.onAction.emit(); // Abre el Wizard vía componente padre
            return;
        }

        // SI ES PACIENTE: Como el botón dice "Ver mis Citas", lo llevamos a su Dashboard
        // para que vea su tarjeta de "Mis Consultas".
        if (this.userRole === 'PACIENTE') {
            this.router.navigate(['/paciente/dashboard']);
        } else if (this.userRole === 'DOCTOR' || this.userRole === 'ASISTENTE') {
            this.router.navigate(['/admin/citas-master']);
        } else if (this.userRole === 'TECHSOFT' || this.userRole === 'ADMIN') {
            this.router.navigate(['/admin/business-config']);
        }
    }
}
