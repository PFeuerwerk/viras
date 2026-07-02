import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrl } from '../../api.config';

export interface Professional {
    id?: string;
    business_id: string;
    usuario_id?: string;

    nombre: string;
    cargo: string;
    formacion?: string;
    descripcion?: string;
    foto_url?: string;
    orden?: number;
    linkedin_url?: string;
    instagram_url?: string;

    email?: string;
    password_hash?: string;
    telefono?: string;
    movil1?: string;
    direccion?: string;

    numero_colegiado?: string;
    especialidad_primaria?: string;
    universidad_egreso?: string;
    anos_experiencia?: number;

    creado_en?: Date;
    actualizado_en?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ProfessionalsService {
    private readonly apiUrl = apiUrl('/professionals');

    constructor(private http: HttpClient) { }

    getProfessionalsByBusiness(businessId: string): Observable<Professional[]> {
        return this.http.get<Professional[]>(`${this.apiUrl}/business/${businessId}`);
    }

    createProfessional(professional: Professional): Observable<Professional> {
        return this.http.post<Professional>(this.apiUrl, professional).pipe(
            catchError(this.handleError)
        );
    }

    updateProfessional(id: string, professional: Partial<Professional>): Observable<Professional> {
        const {
            nombre,
            cargo,
            formacion,
            descripcion,
            foto_url,
            orden,
            linkedin_url,
            instagram_url,
            telefono,
            movil1,
            direccion,
            numero_colegiado,
            especialidad_primaria,
            universidad_egreso,
            anos_experiencia
        } = professional;

        const cleanData = {
            nombre,
            cargo,
            formacion,
            descripcion,
            foto_url,
            orden,
            linkedin_url,
            instagram_url,
            telefono,
            movil1,
            direccion,
            numero_colegiado,
            especialidad_primaria,
            universidad_egreso,
            anos_experiencia
        };

        return this.http.patch<Professional>(`${this.apiUrl}/${id}`, cleanData).pipe(
            catchError(this.handleError)
        );
    }

    deleteProfessional(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    getProfessionalById(id: string): Observable<Professional> {
        return this.http.get<Professional>(`${this.apiUrl}/${id}`);
    }

    private handleError(error: any) {
        console.error('Error en ProfessionalsService:', error);
        return throwError(() => new Error(error.error?.message || 'Error en la comunicación con el servidor.'));
    }
}
