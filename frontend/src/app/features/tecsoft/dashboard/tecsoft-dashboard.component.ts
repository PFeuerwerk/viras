import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importado para navegación
import { BusinessService } from '../../../core/services/business/business';
import { Business } from '../../../core/models/business.model';

@Component({
    selector: 'app-tecsoft-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tecsoft-dashboard.component.html',
    styleUrl: './tecsoft-dashboard.component.css'
})
export class TecsoftDashboardComponent implements OnInit {
    businesses: Business[] = [];
    isLoading = false;
    errorMessage = '';

    // Propiedad requerida por el HTML para las tarjetas de resumen
    stats = {
        total: 0,
        dentistas: 0,
        otros: 0
    };

    constructor(
        private businessService: BusinessService,
        private router: Router // Inyectado para permitir la gestión de negocios
    ) { }

    ngOnInit(): void {
        this.loadAllBusinesses();
    }

    /**
     * Carga todos los negocios de la plataforma y calcula estadísticas
     */
    loadAllBusinesses(): void {
        this.isLoading = true;
        this.businessService.getAllBusinesses().subscribe({
            next: (data) => {
                this.businesses = data;
                this.calculateStats();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar negocios:', err);
                this.errorMessage = 'No se pudieron cargar los negocios.';
                this.isLoading = false;
            }
        });
    }

    /**
     * Calcula las estadísticas para los widgets del dashboard
     */
    private calculateStats(): void {
        this.stats.total = this.businesses.length;
        this.stats.dentistas = this.businesses.filter(b => b.tipo_negocio === 'DENTAL').length;
        this.stats.otros = this.stats.total - this.stats.dentistas;
    }

    /**
     * Formatea fechas para la tabla (Requerido por el HTML)
     */
    formatDate(date: any): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    }

    /**
     * Abre la página pública del negocio (Requerido por el HTML)
     */
    viewSite(slug: string): void {
        if (slug) {
            window.open(`/${slug}`, '_blank');
        }
    }

    /**
     * Acción de edición desde la consola global:
     * Redirige al TechSoft al panel de configuración del negocio seleccionado.
     */
    editBusiness(id: string): void {
        if (!id) return;
        // Navegamos a la ruta de administración enviando el ID por parámetro de consulta
        // Esto permitirá que el TechSoft manipule cualquier negocio.
        this.router.navigate(['/admin/business-config'], { queryParams: { bId: id } });
    }
}
