import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Professional } from '../../../../core/services/professionals/professionals';
import { BusinessConfigVisual } from '../../../../core/models/business.model';

@Component({
    selector: 'app-placeholder-staff',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './placeholder-staff.html'
})
export class PlaceholderStaffComponent implements OnInit {
    // Tipado fuerte basado en el modelo del negocio
    @Input() staff: Professional[] | undefined = [];
    @Input() tipoNegocio: string | undefined = 'OTROS';
    @Input() configVisual: BusinessConfigVisual | undefined;

    public sectionTitle: string = 'Conoce a nuestro Equipo';

    ngOnInit(): void {
        this.setDynamicTitle();
    }

    /**
     * Ajusta el título de la sección según el sector (Multitenant Strategy).
     * Asegura una narrativa coherente para cada cliente de TECHSOFT.
     */
    private setDynamicTitle(): void {
        if (!this.tipoNegocio) return;

        const tipo = this.tipoNegocio.toUpperCase();

        if (tipo === 'DENTAL') {
            this.sectionTitle = 'Conoce a tu Dentista';
        } else if (tipo === 'PELUQUERIA' || tipo === 'ESTETICA') {
            this.sectionTitle = 'Expertos en Imagen';
        } else if (tipo === 'RESTAURANTE') {
            this.sectionTitle = 'Nuestros Chefs';
        } else if (tipo === 'MEDICINA_GENERAL') {
            this.sectionTitle = 'Cuerpo Médico';
        } else {
            this.sectionTitle = 'Nuestro Equipo Profesional';
        }
    }

    /**
     * Sincronización de datos de "Calidad Mundial":
     * Prioriza la descripción real guardada por Rosita en el Dashboard.
     */
    getProfessionalBio(member: Professional): string {
        // CORRECCIÓN: Sincronizado con el campo 'descripcion' definido en Prisma/Frontend
        if (member.descripcion && member.descripcion.trim() !== '') {
            return member.descripcion;
        }

        // Fallback profesional en caso de que el perfil esté incompleto
        return `${member.nombre} es un profesional altamente calificado comprometido con la excelencia y la atención personalizada en ${this.sectionTitle.toLowerCase()}.`;
    }

    /**
     * Helper para ordenar el staff según la preferencia del Admin
     */
    get sortedStaff(): Professional[] {
        if (!this.staff) return [];
        return [...this.staff].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    }
}
