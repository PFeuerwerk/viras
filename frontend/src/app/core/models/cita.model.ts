import { Business } from './business.model';

export interface Cita {
    id?: string;
    // 'paciente_id' es el campo real en la base de datos (Prisma)
    paciente_id: string;
    doctor_id: string;
    fecha: Date | string;
    motivoConsulta?: string;
    duracionEstimada?: number;
    notasInternas?: string;
    precioEstimado?: number;
    servicio_cita?: string;
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'AUSENTE' | 'FINALIZADA';
    googleEventId?: string;
    creado_en?: Date;
    actualizado_en?: Date;

    // Relaciones inyectadas por el Backend (Prisma includes)
    business?: Business;
    paciente?: {
        nombres: string;
        apellidos: string;
        email: string;
    };
    doctor?: {
        id?: string;
        nombres: string;
        apellidos: string;
    };
    // Campo auxiliar por si el DTO del backend aún requiere 'usuario_id' en ciertas operaciones
    usuario_id?: string;
}
