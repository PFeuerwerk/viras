import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PlaceholderService } from '../../services/placeholder.service';
import { Business, BusinessQueHacemos } from '../../../../core/models/business.model';

@Component({
    selector: 'app-what-we-do',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './what-we-do.html'
})
export class WhatWeDoComponent implements OnInit, OnDestroy {
    businessData: Business | undefined;
    private sub: Subscription = new Subscription();

    // Contenido dinámico procesado
    displayContent: BusinessQueHacemos | undefined;

    @Output() agendarCita = new EventEmitter<void>();

    // Datos por defecto de alta calidad (Fallback si el Admin no ha llenado su sección)
    private defaultMethodology: BusinessQueHacemos = {
        titulo: 'Nuestra Metodología',
        introduccion: 'En VIRAS aplicamos procesos estandarizados de calidad mundial para garantizar la excelencia en cada tratamiento.',
        items: [
            {
                nombre: 'Diagnóstico Integral',
                descripcion: 'Analizamos profundamente cada caso utilizando tecnología de punta para entender tus necesidades reales.',
                icono: 'biotech'
            },
            {
                nombre: 'Plan Personalizado',
                descripcion: 'Diseñamos una hoja de ruta exclusiva, optimizando tiempos y recursos para garantizar el mejor resultado.',
                icono: 'architecture'
            },
            {
                nombre: 'Ejecución de Excelencia',
                descripcion: 'Nuestro equipo de especialistas aplica los tratamientos con los más altos estándares internacionales.',
                icono: 'verified'
            }
        ],
        diferenciales_titulo: 'Compromiso inquebrantable con la calidad',
        diferenciales_introduccion: 'Entendemos que cada detalle cuenta. Por eso, hemos optimizado cada etapa de nuestro servicio para que te sientas en las mejores manos.',
        diferenciales_items: [
            { icono: 'verified_user', titulo: 'Tecnología Digital Avanzada', descripcion: 'Equipos de última generación para diagnósticos precisos.' },
            { icono: 'workspace_premium', titulo: 'Especialistas Certificados', descripcion: 'Profesionales con formación internacional constante.' },
            { icono: 'favorite', titulo: 'Atención Humana y Ética', descripcion: 'Priorizamos tu comodidad y tranquilidad en todo momento.' }
        ]
    };

    constructor(private placeholderService: PlaceholderService) { }

    ngOnInit(): void {
        this.sub = this.placeholderService.businessData$.subscribe({
            next: (data: Business | undefined) => {
                if (data) {
                    this.businessData = data;

                    // Fusión robusta: Siempre partimos de los valores por defecto y sobrescribimos con lo que el Admin defina
                    const custom = data.seccion_que_hacemos;
                    
                    this.displayContent = {
                        ...this.defaultMethodology,
                        ...(custom || {})
                    };

                    // Refuerzo específico para asegurar que los diferenciales no desaparezcan si el objeto custom existe pero está incompleto
                    if (custom) {
                        if (custom.items && custom.items.length > 0) {
                            this.displayContent.items = custom.items;
                        }
                        if (custom.diferenciales_items && custom.diferenciales_items.length > 0) {
                            this.displayContent.diferenciales_items = custom.diferenciales_items;
                        }
                        this.displayContent.diferenciales_titulo = custom.diferenciales_titulo || this.defaultMethodology.diferenciales_titulo;
                        this.displayContent.diferenciales_introduccion = custom.diferenciales_introduccion || this.defaultMethodology.diferenciales_introduccion;
                    }
                }
            },
            error: (err) => console.error('Error en What-We-Do:', err)
        });
    }

    onAgendar(): void {
        this.agendarCita.emit();
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
