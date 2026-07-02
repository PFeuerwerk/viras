import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business, BookingService } from '../../../../../core/models/business.model';
import { IconPickerComponent } from '../icon-picker/icon-picker';

@Component({
    selector: 'app-config-booking',
    standalone: true,
    imports: [CommonModule, FormsModule, IconPickerComponent],
    templateUrl: './config-booking.html'
})
export class ConfigBookingComponent {
    /**
     * Recibe los datos del negocio, incluyendo la colección booking_services.
     */
    @Input() business!: Business;

    /**
     * Notifica cambios al componente padre para habilitar el guardado.
     */
    @Output() changed = new EventEmitter<void>();

    /**
     * Opciones de tiempo estándar según requerimiento.
     */
    duracionesDisponibles = [
        { label: '15 min', value: 15 },
        { label: '30 min', value: 30 },
        { label: '45 min', value: 45 },
        { label: '1 hora', value: 60 }
    ];

    /**
     * Añade un nuevo tipo de cita (Card) con valores iniciales.
     */
    onAddBookingService() {
        if (!this.business.booking_services) {
            this.business.booking_services = [];
        }
        this.business.booking_services.push({
            titulo: '',
            descripcion: '',
            duracion_minutos: 30,
            es_emergencia: false,
            icono: 'calendar_today'
        });
        this.changed.emit();
    }

    /**
     * Elimina una tarjeta de cita específica.
     */
    onRemoveBookingService(index: number) {
        if (this.business.booking_services) {
            this.business.booking_services.splice(index, 1);
            this.changed.emit();
        }
    }

    /**
     * Gestiona la actualización del icono desde el selector.
     */
    onIconPick(index: number, icon: string) {
        if (this.business.booking_services) {
            this.business.booking_services[index].icono = icon;
            this.changed.emit();
        }
    }

    /**
     * Método para rastrear cambios en inputs manuales.
     */
    onModelChange() {
        this.changed.emit();
    }

    trackByIndex(index: number) {
        return index;
    }
}
