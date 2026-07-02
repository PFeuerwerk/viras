import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas como *ngIf
import { FormsModule } from '@angular/forms';   // Para el manejo del formulario [(ngModel)]
import { Subscription } from 'rxjs';
import { PlaceholderService } from '../../services/placeholder.service';
import { Business } from '../../../../core/models/business.model';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule], // Importamos ambos módulos necesarios
    templateUrl: './contact.html'
})
export class ContactComponent implements OnInit, OnDestroy {
    businessData: Business | undefined;
    private sub: Subscription = new Subscription();

    // Modelo para el formulario de solicitud de información
    contactForm = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };

    constructor(private placeholderService: PlaceholderService) { }

    ngOnInit(): void {
        this.sub = this.placeholderService.businessData$.subscribe({
            next: (data: Business | undefined) => {
                if (data) {
                    this.businessData = data;
                }
            },
            error: (err) => console.error('Error cargando datos de contacto:', err)
        });
    }

    onSubmit(): void {
        // Lógica para procesar la información enviada
        console.log('Formulario de contacto enviado:', this.contactForm);
        alert('Mensaje enviado con éxito. El equipo de ' + (this.businessData?.nombre_empresa || 'el negocio') + ' te contactará pronto.');
        this.resetForm();
    }

    getGoogleMapsUrl(): string {
        if (!this.businessData) return '#';
        
        const link = this.businessData.google_maps_link;
        
        // Si el link es de embed o no existe, generamos uno basado en la dirección
        if (!link || link.includes('/embed')) {
            const query = encodeURIComponent(this.businessData.direccion || this.businessData.nombre_empresa);
            return `https://www.google.com/maps/search/?api=1&query=${query}`;
        }
        
        return link;
    }

    private resetForm(): void {
        this.contactForm = { name: '', email: '', subject: '', message: '' };
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
