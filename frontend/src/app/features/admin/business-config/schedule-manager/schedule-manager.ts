import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DaySchedule {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

@Component({
    selector: 'app-schedule-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './schedule-manager.html',
    styleUrl: './schedule-manager.css'
})
export class ScheduleManagerComponent implements OnInit, OnChanges {
    @Input() horarioTexto: string | undefined = '';
    @Output() onScheduleChange = new EventEmitter<string>();

    private isInternalChange = false;

    weekSchedule: DaySchedule[] = [
        { day: 'Lunes', open: '09:00', close: '18:00', isClosed: false },
        { day: 'Martes', open: '09:00', close: '18:00', isClosed: false },
        { day: 'Miércoles', open: '09:00', close: '18:00', isClosed: false },
        { day: 'Jueves', open: '09:00', close: '18:00', isClosed: false },
        { day: 'Viernes', open: '09:00', close: '18:00', isClosed: false },
        { day: 'Sábado', open: '09:00', close: '14:00', isClosed: true },
        { day: 'Domingo', open: '09:00', close: '14:00', isClosed: true }
    ];

    constructor() { }

    ngOnInit(): void {
        if (this.horarioTexto) {
            this.parseSchedule(this.horarioTexto);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['horarioTexto'] && !this.isInternalChange) {
            this.parseSchedule(changes['horarioTexto'].currentValue);
        }
        this.isInternalChange = false;
    }

    private parseSchedule(texto: string | undefined): void {
        if (!texto || !texto.includes('|')) return;

        try {
            const parts = texto.split('|');
            parts.forEach((part, index) => {
                if (this.weekSchedule[index]) {
                    const firstColon = part.indexOf(':');
                    if (firstColon === -1) return;

                    const status = part.substring(0, firstColon).trim();
                    let info = part.substring(firstColon + 1).trim();

                    // LIMPIEZA DINÁMICA: Eliminamos "MONDAY - FRIDAY:" o cualquier texto similar
                    // Buscamos el patrón de las horas (HH:mm - HH:mm) para rescatar solo eso
                    const timeMatch = info.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);

                    if (status === 'C' || info.toLowerCase().includes('cerrado')) {
                        this.weekSchedule[index].isClosed = true;
                    } else if (timeMatch) {
                        this.weekSchedule[index].isClosed = false;
                        this.weekSchedule[index].open = this.formatTo24h(timeMatch[1]);
                        this.weekSchedule[index].close = this.formatTo24h(timeMatch[2]);
                    }
                }
            });
        } catch (e) {
            console.warn("Error parseando horario:", e);
        }
    }

    /**
     * Asegura que el string sea HH:mm para el input type="time"
     * Si viene algo sucio o con AM/PM, intenta limpiarlo
     */
    private formatTo24h(timeStr: string): string {
        if (!timeStr) return '09:00';
        // Extrae solo los dígitos y los dos puntos (ej: 08:30)
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const hours = match[1].padStart(2, '0');
            const minutes = match[2];
            return `${hours}:${minutes}`;
        }
        return '09:00';
    }

    emitChange(): void {
        this.isInternalChange = true;
        const scheduleString = this.weekSchedule.map(d =>
            d.isClosed ? `C:Cerrado` : `A:${d.open}-${d.close}`
        ).join('|');
        this.onScheduleChange.emit(scheduleString);
    }

    toggleClosed(index: number): void {
        this.weekSchedule[index].isClosed = !this.weekSchedule[index].isClosed;
        this.emitChange();
    }
}
