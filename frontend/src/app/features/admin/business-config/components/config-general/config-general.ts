import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../../../../core/models/business.model';

@Component({
  selector: 'app-config-general',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-general.html'
})
export class ConfigGeneralComponent {
  @Input() business!: Business;
  @Input() logoPreview: string | null = null;
  @Output() changed = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<any>();

  onFileSelect(event: any) {
    this.fileSelected.emit(event);
  }

  /**
   * Método para notificar al componente padre que un link
   * de red social ha cambiado y debe habilitar el botón de guardar.
   */
  onSocialLinkChange() {
    this.changed.emit();
  }
}
