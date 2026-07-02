import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // <--- IMPORTAR ESTO
import { FormsModule } from '@angular/forms';   // <--- IMPORTAR ESTO para el formulario de contacto
import { PlaceholderService } from '../../services/placeholder.service';
import { Business } from '../../../../core/models/business.model';

@Component({
    selector: 'app-history',
    standalone: true, // <--- ASEGURAR QUE SEA STANDALONE
    imports: [CommonModule], // <--- AGREGAR AQUÍ
    templateUrl: './history.html'
})
export class HistoryComponent implements OnInit, OnDestroy {
    businessData: Business | undefined;
    private sub: Subscription = new Subscription();

    // Hitos históricos ficticios de alta calidad para el diseño
    milestones = [
        {
            year: '2010',
            title: 'El Comienzo',
            description: 'Fundamos nuestra primera clínica con un solo objetivo: humanizar la atención dental profesional.'
        },
        {
            year: '2015',
            title: 'Expansión Tecnológica',
            description: 'Incorporamos tecnología de escaneo 3D y radiología digital, siendo pioneros en la región.'
        },
        {
            year: '2018',
            title: 'Reconocimiento Internacional',
            description: 'Recibimos la certificación de excelencia en calidad médica por organismos internacionales.'
        },
        {
            year: '2023',
            title: 'Nueva Sede Central',
            description: 'Inauguramos nuestras instalaciones actuales con capacidad para 10 especialidades diferentes.'
        }
    ];

    constructor(private placeholderService: PlaceholderService) { }

    ngOnInit(): void {
        this.sub = this.placeholderService.businessData$.subscribe({
            next: (data: Business | undefined) => {
                if (data) {
                    this.businessData = data;
                }
            },
            error: (err) => console.error('Error cargando historia:', err)
        });
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
