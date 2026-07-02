import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../../../../core/models/business.model';

@Component({
    selector: 'app-config-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './config-history.html'
})
export class ConfigHistoryComponent {
    @Input() business!: Business;

    // Hitos locales para la gestión de la Timeline
    // Nota: Estos datos se sincronizarán con el objeto business según tu implementación
    @Input() milestones: any[] = [];

    @Output() changed = new EventEmitter<void>();

    addMilestone() {
        this.milestones.push({ year: '', title: '', description: '' });
        this.changed.emit();
    }

    removeMilestone(index: number) {
        this.milestones.splice(index, 1);
        this.changed.emit();
    }

    trackByIndex(index: number) {
        return index;
    }
}
