import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessConfigVisual } from '../../../../core/models/business.model';
import { SafeUrlPipe } from '../../../../core/pipes/safe-url-pipe';

interface DiaHorario {
    nombre: string;
    horas: string;
    isClosed: boolean;
}

@Component({
    selector: 'app-placeholder-info-grid',
    standalone: true,
    imports: [CommonModule, SafeUrlPipe],
    templateUrl: './placeholder-info-grid.html'
})
export class PlaceholderInfoGridComponent implements OnInit, OnChanges {
    @Input() direccion: string | undefined = '';
    @Input() telefono: string | undefined = '';
    @Input() email: string | undefined = 'contacto@clinica.com';
    @Input() horarioTexto: string | undefined = '';
    @Input() googleMapsLink: string | undefined = '';
    @Input() configVisual: BusinessConfigVisual | undefined;

    public diasSemana: DiaHorario[] = [];

    constructor() { }

    ngOnInit(): void {
        this.generarHorarios();
        this.procesarMapa();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['horarioTexto']) {
            this.generarHorarios();
        }
        if (changes['googleMapsLink']) {
            this.procesarMapa();
        }
    }

    private procesarMapa(): void {
        if (!this.googleMapsLink) return;
        let link = this.googleMapsLink.trim();
        if (link.includes('<iframe')) {
            const match = link.match(/src=["']([^"']+)["']/);
            if (match) link = match[1];
        } else if (link.includes('"')) {
            link = link.split('"')[0];
        }
        this.googleMapsLink = link;
    }

    /**
     * Convierte de 24h a 12h solo si es necesario, evitando errores NaN
     */
    private formatTo12h(timeRange: string): string {
        if (!timeRange || !timeRange.includes('-')) return timeRange;

        const convert = (time: string) => {
            time = time.trim().toUpperCase();

            // Si ya tiene AM o PM, lo devolvemos tal cual para no romperlo
            if (time.includes('AM') || time.includes('PM')) return time;

            // Si no tiene ":", es un formato incompleto, lo devolvemos tal cual
            if (!time.includes(':')) return time;

            const parts = time.split(':');
            let hours = parseInt(parts[0], 10);
            let minutes = parseInt(parts[1], 10);

            // Si el parseo falla, devolvemos el original
            if (isNaN(hours) || isNaN(minutes)) return time;

            const suffix = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const strMinutes = minutes.toString().padStart(2, '0');

            return `${hours}:${strMinutes} ${suffix}`;
        };

        const [start, end] = timeRange.split('-');
        if (!start || !end) return timeRange;

        return `${convert(start)} - ${convert(end)}`;
    }

    private generarHorarios(): void {
        const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        if (!this.horarioTexto || !this.horarioTexto.includes('|')) {
            let textoLimpio = this.horarioTexto || 'Consultar';
            if (textoLimpio.startsWith('A:') || textoLimpio.startsWith('C:')) {
                textoLimpio = textoLimpio.substring(2);
            }

            this.diasSemana = nombresDias.map((dia, index) => ({
                nombre: dia,
                horas: index > 4 ? 'Cerrado' : this.formatTo12h(textoLimpio),
                isClosed: index > 4
            }));
            return;
        }

        try {
            const parts = this.horarioTexto.split('|');
            this.diasSemana = nombresDias.map((dia, index) => {
                const part = parts[index];
                if (part) {
                    const firstColonIndex = part.indexOf(':');
                    if (firstColonIndex !== -1) {
                        const status = part.substring(0, firstColonIndex).trim();
                        const info = part.substring(firstColonIndex + 1).trim();
                        const isClosed = status === 'C';

                        return {
                            nombre: dia,
                            horas: isClosed ? 'Cerrado' : this.formatTo12h(info),
                            isClosed: isClosed
                        };
                    }
                }
                return { nombre: dia, horas: 'Cerrado', isClosed: true };
            });
        } catch (e) {
            console.error("Error al procesar horario:", e);
        }
    }
}
