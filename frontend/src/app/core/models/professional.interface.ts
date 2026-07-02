export interface Professional {
    id?: string;
    business_id: string;
    nombre: string;
    cargo: string;
    formacion?: string;    // "Dónde se graduó"
    descripcion?: string;  // Bio profesional
    foto_url?: string;     // URL o Base64
    orden?: number;
    linkedin_url?: string;
    instagram_url?: string;
    creado_en?: Date;
    actualizado_en?: Date;
}
