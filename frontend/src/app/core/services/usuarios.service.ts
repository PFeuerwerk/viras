import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../api.config';
import { Usuario } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private url = apiUrl('/usuarios');

  // Crear un nuevo usuario
  crear(usuario: any): Observable<any> {
    return this.http.post(this.url, usuario);
  }

  // Listar todos los usuarios
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  listarPorNegocio(businessId: string, rol?: Usuario['rol']): Observable<Usuario[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);

    return this.http.get<Usuario[]>(`${this.url}/business/${businessId}`, { params });
  }

  crearPacienteEnNegocio(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/business/current/pacientes`, usuario);
  }

  // Obtener un usuario por ID
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  // Actualizar un usuario existente
  actualizar(id: string, usuario: any): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, usuario);
  }

  // NUEVO: Eliminar usuario de forma definitiva (Borrado físico)
  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
