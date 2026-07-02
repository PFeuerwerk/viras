import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business } from '../../models/business.model';
import { apiUrl } from '../../api.config';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  /**
   * URL base sincronizada con el prefijo global del backend NestJS.
   */
  private readonly apiUrl = apiUrl('/business');

  constructor(private http: HttpClient) { }

  /**
   * Cabeceras estandarizadas para asegurar que los objetos JSON complejos 
   * (como el array de servicios y config_visual) sean procesados correctamente.
   */
  private get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * Obtiene la configuración completa de un negocio por su slug.
   * Utilizado por el componente Placeholder para renderizar la web pública.
   */
  getBusinessBySlug(slug: string): Observable<Business> {
    return this.http.get<Business>(`${this.apiUrl}/slug/${slug}`);
  }

  /**
   * Obtiene un negocio por su ID único.
   * Vital para que Rosita cargue su configuración privada en el Admin Dashboard.
   */
  getBusinessById(id: string): Observable<Business> {
    return this.http.get<Business>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo negocio en la plataforma.
   */
  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(this.apiUrl, business, { headers: this.headers });
  }

  /**
   * Actualiza los datos del negocio. 
   * Utiliza PATCH para permitir actualizaciones parciales de campos premium.
   */
  updateBusiness(id: string, business: Partial<Business>): Observable<Business> {
    return this.http.patch<Business>(`${this.apiUrl}/${id}`, business, { headers: this.headers });
  }

  /**
   * Lista todos los negocios registrados.
   * Método exclusivo para el rol TECHSOFT en su consola de gestión global.
   */
  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(this.apiUrl);
  }
}
