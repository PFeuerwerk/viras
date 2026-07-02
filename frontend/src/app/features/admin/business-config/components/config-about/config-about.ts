import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../../../../core/models/business.model';

@Component({
  selector: 'app-config-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-about.html'
})
export class ConfigAboutComponent {
  /**
   * Recibe los datos del negocio desde el componente padre (Orquestador).
   */
  @Input() business!: Business;

  /**
   * Recibe la previsualización de la imagen hero gestionada por el padre.
   */
  @Input() heroPreview: string | null = null;

  /**
   * Notifica al padre que un dato de texto ha cambiado para activar el guardado.
   */
  @Output() changed = new EventEmitter<void>();

  /**
   * Notifica al padre que se ha seleccionado un nuevo archivo de imagen.
   */
  @Output() fileSelected = new EventEmitter<any>();

  /**
   * Emisor para el manejo de archivos.
   */
  onFileSelect(event: any): void {
    this.fileSelected.emit(event);
  }

  /**
   * Helper para el conteo de caracteres en la UI.
   */
  getCharCount(text: string | undefined): number {
    return text ? text.length : 0;
  }
}
