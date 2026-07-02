import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessConfigVisual } from '../../../../core/models/business.model';

interface Review {
    nombre_cliente: string;
    comentario: string;
    puntuacion: number;
    foto_url?: string;
}

@Component({
    selector: 'app-placeholder-testimonials',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-testimonials.html'
})
export class PlaceholderTestimonialsComponent {
    @Input() reviews: Review[] | any = [];
    @Input() configVisual: BusinessConfigVisual | undefined;

    constructor() { }

    /**
     * Erzeugt ein Array basierend auf der Punktzahl, um die Sterne im HTML zu iterieren
     */
    getStars(puntuacion: number): number[] {
        const stars = Math.round(puntuacion || 5);
        return Array(stars).fill(0);
    }
}
