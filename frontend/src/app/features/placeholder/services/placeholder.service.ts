import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BusinessService } from '../../../core/services/business/business';
import { ProfessionalsService, Professional } from '../../../core/services/professionals/professionals';
import { Business } from '../../../core/models/business.model';

@Injectable({
    providedIn: 'root'
})
export class PlaceholderService {
    private readonly fontStacks: Record<string, string> = {
        Manrope: "'Manrope', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        Inter: "'Manrope', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        Poppins: "'Poppins', 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        Montserrat: "'Montserrat', 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        'Playfair Display': "'Playfair Display', Georgia, serif"
    };

    // Subject principal que emite toda la data del negocio (incluyendo seccion_que_hacemos)
    public businessDataSubject = new BehaviorSubject<Business | undefined>(undefined);
    businessData$ = this.businessDataSubject.asObservable();

    public staffSubject = new BehaviorSubject<Professional[]>([]);
    staff$ = this.staffSubject.asObservable();

    private renderer: Renderer2;

    constructor(
        private businessService: BusinessService,
        private professionalsService: ProfessionalsService,
        private rendererFactory: RendererFactory2,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    /**
     * Carga la data inicial del negocio mediante el slug.
     * Al recibir la data, se disparan los procesos de personalización visual y carga de staff.
     */
    loadInitialData(slug: string): Observable<Business> {
        return this.businessService.getBusinessBySlug(slug).pipe(
            tap(data => {
                // Emitimos el objeto completo para que todos los componentes hijos lo reciban
                this.businessDataSubject.next(data);

                if (data && data.id) {
                    this.loadStaffData(data.id);
                    this.applyPremiumStyling(data);

                    // SEO y Título de pestaña dinámico de Calidad Mundial
                    this.document.title = `${data.nombre_empresa} | ${data.slogan_hero || 'Bienvenido'}`;
                }
            })
        );
    }

    private loadStaffData(businessId: string): void {
        this.professionalsService.getProfessionalsByBusiness(businessId).subscribe({
            next: (professionals) => this.staffSubject.next(professionals),
            error: (err) => console.error('Error cargando staff:', err)
        });
    }

    /**
     * Aplica la identidad visual del negocio al DOM.
     * Sincroniza colores y tipografías configuradas por el Admin (Rosita).
     */
    private applyPremiumStyling(business: Business): void {
        const config = business.config_visual;
        const root = this.document.documentElement;

        if (!config) {
            this.resetStyles();
            return;
        }

        // Aplicación de colores dinámicos
        if (config.primary_color) {
            root.style.setProperty('--business-primary', config.primary_color);
            root.style.setProperty('--business-primary-hover', this.adjustColor(config.primary_color, -20));
        }

        // Aplicación de tipografía premium
        if (config.font_family) {
            this.renderer.setStyle(this.document.body, 'font-family', this.resolveFontStack(config.font_family));
        }
    }

    private resolveFontStack(fontFamily: string): string {
        return this.fontStacks[fontFamily] ?? this.fontStacks['Manrope'];
    }

    /**
     * Utilidad para generar variaciones de color (Hovers/Active states)
     * Corregido para manejar correctamente el prefijo hexadecimal.
     */
    private adjustColor(col: string, amt: number): string {
        let usePound = false;
        if (col.startsWith('#')) {
            col = col.slice(1);
            usePound = true;
        }
        let num = parseInt(col, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    /**
     * Limpia el estado y los estilos personalizados
     */
    private resetStyles(): void {
        const root = this.document.documentElement;
        root.style.removeProperty('--business-primary');
        root.style.removeProperty('--business-primary-hover');
        this.renderer.removeStyle(this.document.body, 'font-family');
    }

    /**
     * Limpia el estado completo al cambiar de contexto
     */
    clearState(): void {
        this.businessDataSubject.next(undefined);
        this.staffSubject.next([]);
        this.resetStyles();
    }
}
