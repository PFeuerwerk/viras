export class Business {
    id: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    logo?: string;
    hero_image?: string;
    horario?: string;
    google_maps_link?: string; // Nuevo campo para el mapa
    created_at: Date;
    updated_at: Date;
}
