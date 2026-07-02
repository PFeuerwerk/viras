import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';
import { Cita } from '../../models/cita.model';
import { apiUrl } from '../../api.config';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private readonly API_URL = apiUrl('/citas');
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  public citas$ = this.citasSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Obtiene citas filtradas por Negocio (SaaS)
   */
  getCitasByBusiness(businessId: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.API_URL}/business/${businessId}`).pipe(
      tap(citas => this.citasSubject.next(citas)),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza solo el estado de una cita (Confirmar/Cancelar)
   */
  updateCitaEstado(id: string, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.API_URL}/${id}/estado`, { estado }).pipe(
      tap(() => this.refreshCitas()),
      catchError(this.handleError)
    );
  }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.API_URL).pipe(
      tap(citas => this.citasSubject.next(citas)),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  getCitasByPaciente(pacienteId: string): Observable<Cita[]> {
    return this.getCitas().pipe(
      map(citas => citas.filter(c => c.paciente_id === pacienteId))
    );
  }

  createCita(cita: any): Observable<Cita> {
    if (cita.id) {
      const idParaUrl = cita.id;
      const payloadLimpio = {
        estado: cita.estado,
        motivoConsulta: cita.motivoConsulta,
        duracionEstimada: cita.duracionEstimada,
        fecha: cita.fecha,
      };

      return this.http.patch<Cita>(`${this.API_URL}/${idParaUrl}`, payloadLimpio).pipe(
        tap(() => this.refreshCitas()),
        catchError(this.handleError)
      );
    }

    return this.http.post<Cita>(this.API_URL, cita).pipe(
      tap(() => this.refreshCitas()),
      catchError(this.handleError)
    );
  }

  deleteCita(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => this.refreshCitas()),
      catchError(this.handleError)
    );
  }

  private refreshCitas(): void {
    this.getCitas().subscribe();
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error del servidor:', error);
    const errorMsg = error.error?.message || error.message || 'Error en la operación';
    return throwError(() => new Error(errorMsg));
  }
}
