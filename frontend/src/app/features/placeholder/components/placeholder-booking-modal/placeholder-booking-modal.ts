import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Professional } from '../../../../core/services/professionals/professionals';

@Component({
    selector: 'app-placeholder-booking-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './placeholder-booking-modal.html'
})
export class PlaceholderBookingModalComponent {
    @Input() show: boolean = false;
    @Input() businessName: string | undefined = '';
    @Input() staff: Professional[] = [];
    @Input() reserva: any;
    @Input() isBooking: boolean = false;
    @Input() bookingSuccess: boolean = false;

    @Output() onClose = new EventEmitter<void>();
    @Output() confirmar = new EventEmitter<void>();
}
