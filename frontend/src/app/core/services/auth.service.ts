import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { apiUrl } from '../api.config';

/**
 * Interface de Usuario SaaS de Clase Mundial
 * Define los 5 roles fundamentales del ecosistema VIRAS.
 */
export interface Usuario {
    id?: string;
    business_id?: string;

    /**
     * Doctor asignado al paciente.
     * Se soportan varios nombres por compatibilidad con backend/Prisma.
     */
    doctor_id?: string;
    doctorId?: string;
    profesional_id?: string;
    professional_id?: string;

    email: string;
    password?: string;
    rol: 'DOCTOR' | 'PACIENTE' | 'ASISTENTE' | 'TECHSOFT' | 'ADMIN' | '';
    nombres: string;
    apellidos: string;
    movil1?: string;
    numero_documento?: string;
    fecha_nacimiento?: string;
    seguridad_social?: string;
    genero?: string;
    direccion?: string;
    nombre_empresa?: string;
    slug?: string;
    perfil_paciente?: {
        dentista_id?: string | null;
    };
    access_token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly SESSION_KEY = 'viras_session';

    constructor(private http: HttpClient) { }

    /**
     * Inicia sesión con Brain Routing.
     * Captura el perfil del servidor y lo persiste localmente tras normalizar el rol.
     */
    login(email: string, password: string): Observable<{ success: boolean; access_token?: string; user?: Omit<Usuario, 'password'> }> {
        this.logout();

        return this.http.post<{ success: boolean; access_token: string; user: Omit<Usuario, 'password'> }>(
            apiUrl('/usuarios/login'),
            { email, password }
        ).pipe(
            map(response => {
                if (response.success && response.user) {
                    const rawRole = (response.user.rol as string).toUpperCase();
                    response.user.rol = (rawRole === 'TECSOFT' ? 'TECHSOFT' : rawRole) as any;

                    // Aplanar campos del negocio para facilitar acceso en todo el portal
                    const business = (response.user as any).business;
                    if (business) {
                        response.user.slug = business.slug;
                        response.user.nombre_empresa = business.nombre_empresa;
                    }

                    localStorage.setItem(this.SESSION_KEY, JSON.stringify({
                        ...response.user,
                        access_token: response.access_token
                    }));
                }
                return response;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Retorna el ID del negocio (Tenant ID).
     */
    getBusinessId(): string | null {
        const user = this.getCurrentUser();
        return user ? user.business_id || null : null;
    }

    getAccessToken(): string | null {
        return this.getCurrentUser()?.access_token || null;
    }

    /**
     * Retorna el doctor asignado al paciente.
     */
    getAssignedDoctorId(): string | null {
        const user = this.getCurrentUser();

        if (!user) return null;

        return (
            user.doctor_id ||
            user.doctorId ||
            user.profesional_id ||
            user.professional_id ||
            user.perfil_paciente?.dentista_id ||
            null
        );
    }

    /**
     * Retorna el rol del usuario actual normalizado.
     */
    getUserRole(): string {
        const user = this.getCurrentUser();
        return user ? user.rol : '';
    }

    /**
     * Registro Polimórfico.
     */
    register(data: any): Observable<{ success: boolean; message: string }> {
        return this.http.post<any>(apiUrl('/usuarios'), data).pipe(
            map(() => ({ success: true, message: 'Cuenta creada exitosamente.' })),
            catchError(this.handleError)
        );
    }

    logout(): void {
        localStorage.removeItem(this.SESSION_KEY);
    }

    isLoggedIn(): boolean {
        return localStorage.getItem(this.SESSION_KEY) !== null;
    }

    /**
     * Retorna el objeto de usuario completo de la sesión actual.
     */
    getCurrentUser(): Usuario | null {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return null;

        try {
            const user = JSON.parse(session) as Usuario;
            const rawRole = (user.rol as string).toUpperCase();
            user.rol = (rawRole === 'TECSOFT' ? 'TECHSOFT' : rawRole) as any;
            return user;
        } catch {
            return null;
        }
    }

    /**
     * Manejador de errores centralizado.
     */
    private handleError(error: HttpErrorResponse) {
        console.error('AuthService Error:', error);
        let errorMsg = 'Error de conexión. Verifique su servicio.';

        if (error.status === 401) {
            errorMsg = 'Acceso no autorizado. Credenciales incorrectas.';
        } else if (error.error && error.error.message) {
            errorMsg = Array.isArray(error.error.message)
                ? error.error.message[0]
                : error.error.message;
        }

        return throwError(() => new Error(errorMsg));
    }
}
