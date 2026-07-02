import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessConfigVisual } from '../../../../core/models/business.model';

@Component({
    selector: 'app-placeholder-cta-banner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-cta-banner.html'
})
export class PlaceholderCtaBannerComponent {
    /**
     * Recibe la configuración visual para controlar la visibilidad 
     * o estilos específicos si fuera necesario.
     */
    @Input() configVisual: BusinessConfigVisual | undefined;

    /**
     * Emite el evento para abrir el modal de reservas.
     */
    @Output() onReserve = new EventEmitter<void>();

    constructor() { }

    /**
     * Ejecuta la acción de reserva comunicándola al componente padre.
     */
    handleReserve(): void {
        this.onReserve.emit();
    }
}
