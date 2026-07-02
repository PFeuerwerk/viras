import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-layout.html'
})
export class AdminLayoutComponent implements OnInit {
    // Datos de sesión normalizados para la interfaz
    userRole: string = '';
    userName: string = '';
    businessName: string = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserData();
    }

    /**
     * Carga y sincroniza los datos del usuario para el Layout Maestro.
     * Implementa la lógica de visualización para los 5 roles del SaaS.
     */
    private loadUserData(): void {
        const user = this.authService.getCurrentUser();

        if (user) {
            // Obtenemos el rol normalizado (TECHSOFT, ADMIN, DOCTOR, ASISTENTE, PACIENTE)
            this.userRole = this.authService.getUserRole();
            this.userName = `${user.nombres} ${user.apellidos}`;

            // Lógica de Identidad de Negocio:
            // 1. Si es TechSoft: Se muestra como Soporte Global.
            // 2. Si es Admin (Rosita): Se muestra su nombre de empresa.
            // 3. Si es Doctor/Asistente/Paciente: Se muestra el contexto del negocio vinculado.
            this.businessName = user.nombre_empresa ||
                (this.isTechSoft() ? 'Soporte Global TechSoft' : 'Mi Portal de Salud');
        } else {
            this.logout();
        }
    }

    /**
     * Finaliza la sesión y redirige a la puerta de entrada única.
     */
    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    // --- MÉTODOS DE CONTROL DE ACCESO PARA LA PLANTILLA (RBAC) ---

    /**
     * Determina si el usuario es el SuperAdministrador del Software.
     */
    isTechSoft(): boolean {
        return this.userRole === 'TECHSOFT';
    }

    /**
     * Determina si el usuario es el dueño del negocio (como Rosita).
     */
    isAdmin(): boolean {
        return this.userRole === 'ADMIN';
    }

    /**
     * Determina si el usuario es un profesional médico (Doctor).
     */
    isDoctor(): boolean {
        return this.userRole === 'DOCTOR';
    }

    /**
     * Determina si el usuario es parte del staff operativo (Asistente).
     */
    isAsistente(): boolean {
        return this.userRole === 'ASISTENTE';
    }

    /**
     * Determina si el usuario es un cliente final (Paciente).
     */
    isPaciente(): boolean {
        return this.userRole === 'PACIENTE';
    }
}
