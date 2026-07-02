import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService as IService, BusinessConfigVisual, TipoNegocio } from '../../../../core/models/business.model';

@Component({
    selector: 'app-placeholder-services',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-services.html'
})
export class PlaceholderServicesComponent {
    // Recibe la lista de servicios configurados por el Admin (Rosita)
    @Input() servicios: IService[] | undefined = [];
    @Input() tipoNegocio: TipoNegocio | undefined = 'OTROS';
    @Input() configVisual: BusinessConfigVisual | undefined;

    @Output() onReserve = new EventEmitter<void>();

    // Gestión de estado para descripciones largas (Set para IDs o Índices únicos)
    public expandedServices = new Set<number>();
    public readonly CHAR_LIMIT = 120; // Límite para mostrar el extracto

    constructor() { }

    /**
     * Alterna el estado de expansión de una descripción específica.
     */
    toggleExpand(index: number): void {
        if (this.expandedServices.has(index)) {
            this.expandedServices.delete(index);
        } else {
            this.expandedServices.add(index);
        }
    }

    /**
     * Verifica si una descripción debe ser truncada.
     */
    isLongDescription(text: string | undefined): boolean {
        return (text?.length || 0) > this.CHAR_LIMIT;
    }

    /**
     * Determina si el nombre del icono es una imagen local o Material Icon.
     */
    isLocalIcon(iconName: string | undefined): boolean {
        if (!iconName) return false;
        const name = iconName.toLowerCase();
        return name.endsWith('.png') || name.endsWith('.svg') || name.includes('/') || name.includes('diente');
    }

    /**
     * Retorna la ruta absoluta del icono normalizada.
     */
    getIconPath(iconName: string | undefined): string {
        if (!iconName) return 'assets/icons/services/default.png';

        if (iconName.startsWith('assets/') || iconName.startsWith('data:')) {
            return iconName;
        }

        let folder = 'dental';
        if (this.tipoNegocio) {
            const tipo = this.tipoNegocio.toUpperCase();
            if (tipo === 'DENTAL') folder = 'dental';
            else if (tipo === 'PELUQUERIA') folder = 'peluqueria';
            else folder = tipo.toLowerCase();
        }

        let finalIconName = iconName;
        if (!finalIconName.includes('.')) {
            finalIconName = `${finalIconName}.png`;
        } else if (finalIconName.toLowerCase().endsWith('.svg')) {
            finalIconName = finalIconName.replace(/\.svg$/i, '.png');
        }

        return `assets/icons/services/${folder}/${finalIconName}`;
    }

    /**
     * Emite el evento para agendar cita.
     */
    handleReserve(): void {
        this.onReserve.emit();
    }
}
