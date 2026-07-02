export const ICON_GALLERY: any = {
    'DENTAL': [
        // Actualizado a .png basado en tu estructura de árbol
        { name: 'tooth-clean.png', label: 'Limpieza' },
        { name: 'tooth-aesthetic.png', label: 'Estética' },
        { name: 'tooth-implant.png', label: 'Implante' },
        { name: 'diente-limpieza.png', label: 'Profilaxis' },
        { name: 'implante.png', label: 'Cirugía' },
        { name: 'ortodoncia.png', label: 'Ortodoncia' },
        { name: 'caries.png', label: 'Caries' },
        { name: 'corona.png', label: 'Corona' },
        { name: 'diente-sano.png', label: 'Diente Sano' },
        { name: 'tooth-extraction.png', label: 'Extracción' }
    ],
    'PELUQUERIA': [
        { name: 'hair-cut.svg', label: 'Corte Caballero' },
        { name: 'hair-style.svg', label: 'Peinado' },
        { name: 'beard-trim.svg', label: 'Barba' },
        { name: 'scissors.svg', label: 'Tijeras' }
    ],
    'ESTETICA': [
        { name: 'facial-mask.svg', label: 'Facial' },
        { name: 'spa-massage.svg', label: 'Masaje' },
        { name: 'nail-polish.svg', label: 'Manicura' },
        { name: 'skin-care.svg', label: 'Cuidado Piel' }
    ],
    'MEDICINA_GENERAL': [
        { name: 'stetho.svg', label: 'Consulta' },
        { name: 'heart-rate.svg', label: 'Chequeo' },
        { name: 'first-aid.svg', label: 'Urgencias' },
        { name: 'pills.svg', label: 'Receta' }
    ],
    'CONSULTORIA': [
        { name: 'strategy.svg', label: 'Estrategia' },
        { name: 'chart-growth.svg', label: 'Análisis' },
        { name: 'briefcase.svg', label: 'Negocios' },
        { name: 'meeting.svg', label: 'Asesoría' }
    ],
    'GIMNASIO': [
        { name: 'dumbbell.svg', label: 'Pesas' },
        { name: 'yoga-pose.svg', label: 'Yoga' },
        { name: 'cardio.svg', label: 'Cardio' },
        { name: 'personal-trainer.svg', label: 'Entrenador' }
    ],
    'OTROS': [
        { name: 'medical_services.svg', label: 'General' }
    ]
};

export const DEFAULT_CONFIG_VISUAL = {
    primary_color: '#4f46e5',
    font_family: 'Manrope',
    show_services: true,
    show_staff: true,
    show_reviews: true,
    show_chatbot: true,
    button_style: 'rounded'
} as const;
