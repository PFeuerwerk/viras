import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../../../../core/models/business.model'; // Korrigerad sökväg till 4 nivåer
import { IconPickerComponent } from '../icon-picker/icon-picker';

@Component({
    selector: 'app-config-services',
    standalone: true,
    imports: [CommonModule, FormsModule, IconPickerComponent],
    templateUrl: './config-services.html'
})
export class ConfigServicesComponent {
    /**
     * Tar emot affärsdata från huvudkomponenten.
     */
    @Input() business!: Business;

    /**
     * Event som meddelar ändringar, tillägg eller borttagning av tjänster.
     */
    @Output() changed = new EventEmitter<void>();
    @Output() addService = new EventEmitter<void>();
    @Output() removeService = new EventEmitter<number>();
    @Output() iconSelected = new EventEmitter<{ index: number, icon: string }>();

    /**
     * Hanterar val av ikon för en specifik tjänst via IconPicker.
     * @param index Indexet för tjänsten som ska uppdateras.
     * @param icon Namnet på den valda ikonen.
     */
    onIconPick(index: number, icon: string) {
        this.iconSelected.emit({ index, icon });
        this.changed.emit();
    }

    /**
     * Hjälpfunktion för att optimera rendering av listor i Angular.
     */
    trackByIndex(index: number) {
        return index;
    }
}
