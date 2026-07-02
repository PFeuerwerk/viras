export interface Business {
    id?: string;
    slug: string;
    tipo_negocio: TipoNegocio; // Campo fundamental para la lógica polimórfica SaaS
    nombre_empresa: string;
    email?: string;            // Añadido para el Footer y contacto directo
    logo_url?: string;
    titulo_hero?: string;
    slogan_hero?: string;      // El gancho comercial bajo el título
    descripcion_hero?: string;
    horario_texto?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    cif?: string;
    delegado_datos?: string;
    google_maps_link?: string;

    // --- Redes Sociales (Sincronizado con Prisma) ---
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;

    config_visual?: BusinessConfigVisual;
    servicios?: BusinessService[];    // Para el grid de servicios profesionales (Sección Home)

    // --- Nueva Sección: Gestión de Citas (Booking) ---
    booking_services?: BookingService[]; // Tipos de cita con duración para la página de booking

    reviews?: BusinessReview[];       // Para la sección de confianza (Social Proof)

    // --- Nueva Sección Dinámica: Qué Hacemos ---
    seccion_que_hacemos?: BusinessQueHacemos;

    creado_en?: Date;
    actualizado_en?: Date;
}

// Definición de tipos de negocio para coherencia con el Backend
export type TipoNegocio =

    | 'DENTAL'
    | 'PELUQUERIA'
    | 'RESTAURANTE'

    | 'ESTETICA'
    | 'MEDICINA_GENERAL'
    | 'CONSULTORIA'

    | 'GIMNASIO'
    | 'VETERINARIA'
    | 'PODOLOGIA'

    | 'MANICURE'
    | 'PEDICURE'
    | 'MASAJE'

    | 'TALLER_MECANICO'
    | 'ABOGACIA'
    | 'ADUANAS'

    | 'OTROS';

export interface BusinessConfigVisual {
    // --- Identidad Visual (Colores) ---
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    bg_color?: string;

    // --- Tipografía ---
    font_family?: 'Manrope' | 'Inter' | 'Poppins' | 'Montserrat' | 'Playfair Display';

    // --- Imágenes Nítidas ---
    hero_image?: string;
    gallery?: string[];

    // --- Control de Secciones (Feature Flags) ---
    show_chatbot?: boolean;
    show_staff?: boolean;
    show_reviews?: boolean;
    show_services?: boolean;

    // --- Estética de Componentes ---
    button_style?: 'rounded' | 'square' | 'pill';
}

// Interfaces de apoyo para la escalabilidad del Placeholder
export interface BusinessService {
    titulo: string;
    descripcion: string;
    icono?: string; // Nombre del icono (ej: 'medical_services' o 'content_cut')
    precio_estimado?: string;
}

// Nueva interfaz para los tipos de cita en la página de reserva
export interface BookingService {
    titulo: string;
    descripcion: string;
    duracion_minutos: number; // 15, 30, 45, 60, etc.
    es_emergencia: boolean;   // Activa el flujo de escala de dolor
    icono?: string;
}

export interface BusinessReview {
    id?: string;
    nombre_cliente: string;
    comentario: string;
    puntuacion: number; // 1 a 5
    foto_url?: string;
    verificado?: boolean;
    activo?: boolean;
}

// Nueva interfaz para la gestión administrativa de la página "Qué Hacemos"
export interface BusinessQueHacemos {
    titulo: string;
    introduccion: string;
    items: {
        nombre: string;
        descripcion: string;
        icono?: string;
    }[];
    // --- Nueva sección: Diferenciales (Por qué elegirnos) ---
    diferenciales_titulo?: string;
    diferenciales_introduccion?: string;
    diferenciales_items?: {
        titulo: string;
        descripcion: string;
        icono?: string;
    }[];
    diferenciales_imagen_url?: string;
}
