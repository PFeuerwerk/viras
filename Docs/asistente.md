Objetivo

Diseñar, auditar e implementar el módulo Asistente de una plataforma SaaS Multi-Tenant para clínicas dentales.

La implementación debe seguir una arquitectura Enterprise, preparada para cientos de clínicas, múltiples sedes y miles de pacientes, minimizando la deuda técnica y evitando futuras refactorizaciones.

El objetivo no es únicamente desarrollar pantallas.

El objetivo es construir un módulo completamente alineado con el backend, la base de datos y la arquitectura global del sistema, garantizando consistencia funcional, seguridad, escalabilidad y mantenibilidad.

La solución deberá cumplir los siguientes principios:

Enterprise Ready.
Cloud Native.
Multi-Tenant.
Event Driven cuando corresponda.
Escalable horizontalmente.
Modular.
Segura.
Observable.
Desacoplada.
Configurable.
Responsive First.
Mobile First.
Performance First.

Nunca implementar funcionalidades aisladas.


Toda funcionalidad deberá integrarse correctamente con:

Frontend
Backend
Base de datos
Seguridad
Auditoría
Roles
Permisos
Sistema de notificaciones
Agenda
Historial clínico

Stack Tecnológico

Frontend - Angular 19
Backend - NestJS
ORM - Prisma
Base de datos - PostgreSQL
Cache - Redis
Colas - BullMQ
Realtime - Socket.IO
Almacenamiento - Cloud Storage
Autenticación - JWT, Refresh Tokens, RBAC

Multi-Tenant

 - TenantInterceptor
 - restaurantId / clinicId obtenido exclusivamente desde backend
 - Nunca confiar en datos enviados desde Angular.

Objetivo del Rol Asistente

El asistente será el principal operador administrativo de la clínica.

Debe poder realizar prácticamente todas las operaciones administrativas y operativas sin acceder a configuraciones críticas del sistema.

Su trabajo debe permitir que odontólogos e higienistas únicamente se concentren en la atención al paciente.

Responsabilidades

El módulo debe cubrir completamente:

Gestión de pacientes
Agenda
Confirmaciones
Recepción
Cobros
Presupuestos
Tratamientos
Comunicación
Documentación
Consentimientos
Seguros
Facturación básica
Caja diaria
Incidencias
Coordinación clínica
Dashboard

Diseñar un dashboard profesional con indicadores en tiempo real.

Debe mostrar:

Pacientes del día
Próximas citas
Pacientes esperando
Pacientes confirmados
Cancelaciones
Huecos libres
Tratamientos pendientes
Pagos pendientes
Mensajes pendientes
Notificaciones
Alertas clínicas
Alertas administrativas
Estado de doctores
Estado de gabinetes
Ocupación diaria
Ingresos del día

Gestión de Pacientes

Permitir:

Crear paciente
Editar paciente
Buscar paciente
Fusionar duplicados
Archivar paciente
Reactivar paciente
Ver historial
Adjuntar documentación
Fotografía
Datos personales
Datos de contacto
Persona responsable
Datos fiscales
Observaciones
Consentimientos
Seguro médico
Empresa aseguradora
Número de póliza
Documentación legal
Nunca eliminar pacientes físicamente.


Agenda

Gestión completa.
Crear cita
Modificar
Cancelar
Reprogramar
Duplicar
Mover entre doctores
Mover entre gabinetes
Bloquear horarios
Desbloquear horarios
Gestionar urgencias
Gestionar lista de espera
Confirmar asistencia
Registrar llegada
Registrar ausencia
Registrar retrasos


Recepción

Check-in
Check-out
Estado del paciente
Sala de espera
Tiempo de espera
Asignación automática
Llamadas internas
Control de flujo


Comunicación

Enviar automáticamente:
SMS
WhatsApp
Email
Recordatorios
Confirmaciones
Reprogramaciones
Cancelaciones
Encuestas
Instrucciones preoperatorias
Instrucciones postoperatorias
Nunca enviar mensajes desde Angular.
Todo deberá ejecutarse desde backend mediante colas.


Presupuestos

Crear
Editar
Versionar
Aceptar
Rechazar
Caducar
Firmar digitalmente
Enviar
Convertir automáticamente en tratamiento.


Tratamientos

Visualizar plan
Actualizar estado
Marcar fases
Añadir observaciones
Adjuntar imágenes
Adjuntar radiografías
Seguimiento
Nunca modificar información clínica restringida al odontólogo.


Cobros

Registrar pagos
Efectivo
Tarjeta
Transferencia
Bizum
Financiación
Pago parcial
Pago pendiente
Reembolso
Caja diaria
Movimientos
Cierre diario
Nunca modificar contabilidad avanzada.


Documentación

Subir documentos
Consentimientos
Radiografías
Fotografías
Recetas
Informes
PDF
Firmas
Todo versionado.


Seguros

Verificar cobertura
Autorizar tratamientos
Registrar incidencias
Enviar documentación
Seguimiento


Inventario Ligero

Solicitudes de material
Consumo diario
Incidencias
Material pendiente


Notificaciones
Centro unificado.
Alertas
Mensajes
Tareas
Incidencias
Recordatorios


Auditoría

Registrar absolutamente todas las acciones.
Usuario
Fecha
Hora
IP
Tenant
ClinicId
Paciente
Entidad
Acción
Valor anterior
Valor nuevo
Nunca permitir operaciones sin auditoría.

Seguridad

RBAC
Permisos granulares
Sesiones
Bloqueos
Expiración
Contraseñas temporales
2FA preparado
Rate Limiting
Auditoría
CSRF
CSP
Headers seguros


Multi-Tenant

Nunca permitir:

clinicId enviado desde Angular
tenantId enviado desde Angular
doctorId manipulado
Todo deberá resolverse desde backend.


Base de datos

Auditar completamente Prisma.

Validar:
Relaciones
Índices
Restricciones
Claves únicas
Integridad referencial
Optimización
No duplicar información.


Backend

Auditar completamente:
Controllers
Services
Repositories
DTOs
Validators
Policies
Interceptors
Guards
Middlewares
Workers
BullMQ
Eventos
Nunca duplicar lógica.


Frontend

Angular deberá consumir exclusivamente APIs tipadas.
No contener lógica de negocio.

Utilizar:
Signals
Standalone Components
Lazy Loading
Guards
Resolvers
Interceptors
Reactive Forms
Control de errores
Loading States
Skeletons
Optimistic UI cuando proceda.

Responsive

La aplicación deberá funcionar perfectamente en:

Móvil
Tablet
Desktop
Pantallas táctiles
Recepción
Kioscos
Nunca crear interfaces separadas.

Rendimiento

Optimizar:
Consultas Prisma
Paginación
Virtual Scroll
Lazy Loading
Cache Redis
BullMQ
WebSockets
Evitar consultas N+1.


Observabilidad

Implementar:
Logs estructurados
Métricas
Health Checks
Tracing
Correlation ID
Alertas
Dashboard operativo


Flujo obligatorio de implementación

Antes de escribir código:
Auditar arquitectura actual.
Auditar Prisma.
Auditar Backend.
Auditar Frontend.
Auditar Roles.
Auditar Seguridad.
Auditar Multi-Tenant.
Auditar Integraciones.
Auditar rendimiento.
Detectar inconsistencias.

Después:

Implementar únicamente los cambios mínimos necesarios.
Nunca romper funcionalidades existentes.
Nunca duplicar servicios.
Nunca generar deuda técnica.


Validación obligatoria

Cada iteración deberá finalizar ejecutando:
pnpm --filter api exec tsc --noEmit --skipLibCheck
pnpm build
git status

No se permitirá finalizar ninguna iteración si:
Existe un error de compilación.
Existen inconsistencias entre Angular, NestJS, Prisma y PostgreSQL.
Existen consultas que rompan el aislamiento Multi-Tenant.
Existen entidades duplicadas.
Existen DTOs inconsistentes.
Existen migraciones incompletas.
Existen riesgos de seguridad.

El resultado final debe ser un módulo Asistente de nivel empresarial, completamente integrado con el resto de la plataforma, preparado para crecer desde una única clínica hasta una red de cientos de clínicas, sin necesidad de refactorizaciones estructurales futuras.