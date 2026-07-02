import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Business } from '../../core/models/business.model';
import { BusinessService } from '../../core/services/business/business';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  negocios: Business[] = [];
  busqueda: string = '';
  isLoading = true;

  constructor(
    private businessService: BusinessService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarNegocios();
  }

  /**
   * Carga todos los negocios registrados en la plataforma
   * para mostrarlos en el Marketplace inicial.
   */
  cargarNegocios(): void {
    this.isLoading = true;
    this.businessService.getAllBusinesses().subscribe({
      next: (data: Business[]) => { // Tipado explícito para evitar error de 'any'
        this.negocios = data;
        this.isLoading = false;
      },
      error: (err: any) => { // Tipado explícito para evitar error de 'any'
        console.error('Error al cargar marketplace:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Redirige al usuario directamente al placeholder del negocio buscado.
   * Limpia el texto para asegurar una navegación de URL válida.
   */
  buscarNegocio(): void {
    const query = this.busqueda.trim();
    if (!query) return;

    // Generamos un slug limpio para la búsqueda: minúsculas, sin acentos y guiones
    const slug = query.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    this.router.navigate(['/', slug]);
  }

  /**
   * Navegación directa al registro de nuevos socios (Admin)
   */
  irARegistro(): void {
    this.router.navigate(['/auth/register']);
  }
}
