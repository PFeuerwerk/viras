# Rediseño del Menú de Navegación Principal

El objetivo es mejorar la estética y profesionalidad del menú de navegación principal, asegurando que esté centrado y contenido dentro de un ancho máximo razonable, siguiendo las mejores prácticas de diseño web moderno.

## User Review Required

> [!IMPORTANT]
> Proponemos reducir el ancho máximo del contenedor de la navegación de `1400px` a `1280px` (max-w-7xl) para evitar que los elementos queden demasiado dispersos en pantallas anchas.

> [!TIP]
> Añadiremos un botón de acción principal ("Agendar Cita") en el extremo derecho del menú para equilibrar el diseño (Logo a la izquierda, Menú al centro, Acción a la derecha).

## Proposed Changes

### [Component Name] Shared Layouts & Placeholder

Separaremos la lógica de la barra de navegación para que se sienta más "premium" y balanceada.

#### [MODIFY] [placeholder.html](file:///c:/viras/frontend/src/app/features/placeholder/placeholder.html)
- Cambiar `max-w-[1400px]` por `max-w-7xl` (1280px).
- Ajustar el flex para que el menú de navegación esté verdaderamente centrado entre el logo y un nuevo botón de acción.
- Mejorar los efectos de hover y la tipografía para un look más limpio.

#### [MODIFY] [patient-layout.html](file:///c:/viras/frontend/src/app/shared/layouts/patient-layout/patient-layout.html)
- Aplicar los mismos cambios de contención y centrado para mantener la coherencia en todo el portal.

## Verification Plan

### Manual Verification
- Verificar visualmente en diferentes resoluciones que el menú no toque los bordes laterales.
- Confirmar que los elementos del menú se mantienen alineados al centro del área de contenido.
- Probar que el botón de "Agendar Cita" (si se añade) sea funcional y visible.
