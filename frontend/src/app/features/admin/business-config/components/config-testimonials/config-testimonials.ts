import {
    Component,
    EventEmitter,
    Input,
    Output
}

    from '@angular/core';

import {
    CommonModule
}

    from '@angular/common';

import {
    FormsModule
}

    from '@angular/forms';

import {
    Business,
    BusinessReview
}

    from '../../../../../core/models/business.model';

@Component({
    selector: 'app-config-testimonials',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './config-testimonials.html'
}) export class ConfigTestimonialsComponent {
    @Input() business !: Business;
    @Output() changed = new EventEmitter<void>();

    addReview(): void {
        if (!this.business.reviews) {
            this.business.reviews = [];
        }

        const newReview: BusinessReview = {
            id: this.generateLocalId(),
            nombre_cliente: '',
            comentario: '',
            puntuacion: 5,
            foto_url: '',
            verificado: true,
            activo: true
        }

            ;

        this.business.reviews = [...this.business.reviews,
            newReview];
        this.changed.emit();
    }

    removeReview(index: number): void {
        if (!this.business.reviews) return;

        const confirmDelete = confirm('¿Seguro que deseas eliminar este testimonio?');

        if (!confirmDelete) return;

        this.business.reviews = this.business.reviews.filter((_, i) => i !== index);
        this.changed.emit();
    }

    updateRating(review: BusinessReview, rating: number): void {
        review.puntuacion = rating;
        this.changed.emit();
    }

    toggleActive(review: BusinessReview): void {
        review.activo = !review.activo;
        this.changed.emit();
    }

    onFieldChange(): void {
        this.changed.emit();
    }

    trackByIndex(index: number): number {
        return index;
    }

    private generateLocalId(): string {
        return `review-$ {
            Date.now()
        }

        -$ {
            Math.floor(Math.random() * 10000)
        }

        `;
    }
}