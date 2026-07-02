import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Business, BusinessConfigVisual } from '../../../../core/models/business.model';

@Component({
    selector: 'app-placeholder-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-footer.html'
})
export class PlaceholderFooterComponent {
    /**
     * Recibe la interfaz Business completa (ahora con el campo email incluido).
     */
    @Input() businessData: Business | undefined;
    @Input() configVisual: BusinessConfigVisual | undefined;

    // Emisión de navegación para el orquestador Placeholder
    @Output() navigate = new EventEmitter<string>();

    currentYear: number = new Date().getFullYear();

    constructor() { }

    /**
     * Gestiona la navegación interna y activa el scroll hacia arriba.
     */
    onNavigate(page: string): void {
        this.navigate.emit(page);
        this.scrollToTop();
    }

    /**
     * Retorna una lista limitada de servicios para el footer.
     */
    get servicesList(): any[] {
        const services = Array.isArray(this.businessData?.servicios) ? this.businessData.servicios : [];
        return services.slice(0, 5);
    }

    /**
     * Determina si el negocio tiene alguna red social configurada para mostrar el bloque.
     */
    hasSocialMedia(): boolean {
        return !!(
            this.businessData?.facebook_url ||
            this.businessData?.instagram_url ||
            this.businessData?.twitter_url ||
            this.businessData?.linkedin_url
        );
    }

    /**
     * CORRECCIÓN: Cambiado a public para permitir el acceso desde el HTML.
     * Realiza un desplazamiento suave al inicio de la página.
     */
    public scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
