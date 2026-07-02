import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando Seed: Configuración Multi-tenant de Calidad Mundial ---');

    // Datos de Booking por defecto para inyectar en los negocios
    const defaultBookingServices = [
        {
            titulo: 'Examen y Limpieza',
            descripcion: 'Un examen completo y limpieza incluyendo rayos-X, detección precoz del cáncer oral y escáner intraoral.',
            duracion_minutos: 60,
            es_emergencia: false,
            icono: 'medical_services'
        },
        {
            titulo: 'Emergencia Dental',
            descripcion: '¿Presenta enrojecimiento, hinchazón o dolor intenso? Nuestro equipo especializado está aquí para ayudarle.',
            duracion_minutos: 30,
            es_emergencia: true,
            icono: 'report_problem'
        },
        {
            titulo: 'Consulta General',
            descripcion: 'Consulte hoy mismo a nuestro experimentado equipo dental para obtener ayuda con sus necesidades de salud bucal.',
            duracion_minutos: 30,
            es_emergencia: false,
            icono: 'calendar_today'
        }
    ];

    // 1. CREACIÓN DEL NEGOCIO DEMO (Para TechSoft)
    const negocioDemo = await prisma.business.upsert({
        where: { slug: 'clinica-dental-pro' },
        update: {
            booking_services: defaultBookingServices
        },
        create: {
            nombre_empresa: 'Clínica Dental Pro (Demo)',
            slug: 'clinica-dental-pro',
            tipo_negocio: 'DENTAL',
            titulo_hero: 'Entorno de Pruebas TechSoft',
            slogan_hero: 'Componentes y diseño de clase mundial',
            direccion: 'Sede Global TechSoft',
            telefono: '+00 000 000 000',
            booking_services: defaultBookingServices
        },
    });

    // 2. CREACIÓN DEL NEGOCIO DE ROSITA (Su negocio real)
    const negocioRosita = await prisma.business.upsert({
        where: { slug: 'rosita-risitas' },
        update: {
            booking_services: defaultBookingServices
        },
        create: {
            nombre_empresa: 'Rosita Risitas',
            slug: 'rosita-risitas',
            tipo_negocio: 'DENTAL',
            titulo_hero: 'Tu mejor sonrisa con Rosita',
            slogan_hero: 'Cuidado dental con amor y profesionalismo',
            direccion: 'Calle de las Sonrisas 456',
            telefono: '+34 600 000 000',
            seccion_que_hacemos: {
                titulo: 'Nuestra Metodología en Rosita Risitas',
                introduccion: 'Procesos diseñados para tu comodidad.',
                items: [
                    { nombre: 'Revisión Inicial', descripcion: 'Evaluamos tu salud bucal.', icono: 'visibility' },
                    { nombre: 'Tratamiento', descripcion: 'Aplicamos soluciones modernas.', icono: 'build' }
                ]
            },
            booking_services: defaultBookingServices
        },
    });

    console.log('✔ Negocios creados: Demo y Rosita Risitas');

    // 3. CREACIÓN DEL SUPERUSUARIO (TECHSOFT)
    const superAdmin = await prisma.usuarios.upsert({
        where: { email: 'admin@techsoft.com' },
        update: { business_id: negocioDemo.id },
        create: {
            email: 'admin@techsoft.com',
            password_hash: '123456',
            rol: 'TECHSOFT',
            nombres: 'Soporte',
            apellidos: 'TechSoft',
            esta_activo: true,
            business_id: negocioDemo.id,
        },
    });

    console.log('✔ Usuario TechSoft creado y vinculado a Demo:', superAdmin.email);

    // 4. CREACIÓN DE ROSITA (ADMIN)
    const adminRosita = await prisma.usuarios.upsert({
        where: { email: 'rosita@correo.com' },
        update: { business_id: negocioRosita.id },
        create: {
            email: 'rosita@correo.com',
            password_hash: '123456',
            rol: 'ADMIN',
            nombres: 'Rosita',
            apellidos: 'Risitas',
            esta_activo: true,
            business_id: negocioRosita.id,
        },
    });

    console.log('✔ Usuario Rosita vinculado a Rosita Risitas:', adminRosita.email);

    console.log('--- Seed finalizado con éxito ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
