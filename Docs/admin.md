# Estado de implementación - Módulo Admin/Dueño

Fecha de actualización: 2026-07-02

## Implementado en esta iteración

- Dashboard ejecutivo Admin/Owner en Angular: `/admin/dashboard`.
- Endpoint backend protegido: `GET /api/admin-owner/dashboard`.
- Resolución de tenant exclusivamente en backend usando `business_id` del JWT.
- Login de rol `ADMIN` redirige al dashboard ejecutivo.
- Navegación admin actualizada con acceso a Panel Ejecutivo, Configurar Sitio, Gestión de Staff y Agenda.
- Métricas agregadas sin cargar grandes listados en frontend:
  - Citas del día por estado.
  - Pacientes totales y nuevos.
  - Staff activo por rol.
  - Producción estimada semanal/mensual basada en citas valoradas.
  - Presupuestos del mes, aceptados, pendientes y tasa de aceptación.
  - Ocupación semanal por profesional.
  - Próximas citas.
  - Pacientes recientes.
  - Alertas administrativas.
- Presupuestos alineados con seguridad multi-tenant:
  - Uso de `PrismaService` compartido.
  - Validación de paciente/tenant antes de crear o consultar.
  - Paciente solo puede leer sus propios presupuestos.
- Usuarios alineados con prácticas administrativas:
  - Baja lógica con `esta_activo=false` en vez de borrado físico.
  - Listados de negocio y doctores públicos filtran usuarios activos.
  - Creación de `ASISTENTE` genera `perfil_asistente`.
- Script `scripts/manual-flow-check.sh` actualizado para validar el dashboard Admin/Owner.

## Verificación

Comandos ejecutados:

```bash
cd backend && npm run build
cd frontend && npm run build
cd backend && npm test -- --runInBand
cd frontend && npm test -- --watch=false
BASE=http://localhost:3100/api bash scripts/manual-flow-check.sh
```

Resultado:

- Backend build: OK.
- Frontend build: OK.
- Backend tests: 6 suites / 6 tests pasando.
- Frontend tests: 10 archivos / 11 tests pasando.
- Flujo E2E: OK.
- Dashboard Admin/Owner: 200 con token ADMIN, metricas coherentes por tenant.

## Pendientes reales del módulo Admin/Owner

- Prueba visual manual completa en navegador para desktop, tablet y móvil.
- Crear modelos formales antes de implementar pantallas definitivas para:
  - Sedes.
  - Gabinetes.
  - Servicios/tratamientos estructurados.
  - Tarifas.
  - Facturación.
  - Pagos.
  - Caja diaria.
  - Auditoría inmutable.
  - Integraciones y notificaciones con colas.
- Añadir migraciones Prisma formales en vez de depender de `db push`.
- Añadir tests de integración específicos para:
  - `/api/admin-owner/dashboard`.
  - Scoping multi-tenant en presupuestos.
  - Baja lógica de usuarios.
  - Acceso cruzado entre negocios.
- Endurecer producción:
  - `JWT_SECRET` obligatorio.
  - CORS por dominios reales.
  - Refresh tokens o política de expiración.
  - Rate limiting.
  - Auditoría administrativa.

---

# Prompt original para Agente IA – Módulo Admin/Dueño de Clínica Dental

## Objetivo

Diseñar, auditar e implementar el módulo **Admin/Dueño** de una plataforma SaaS Multi-Tenant para clínicas dentales.

Este módulo representa al propietario, gerente general o administrador principal de una clínica dental. Su objetivo es permitir la gestión estratégica, operativa, financiera, organizativa y administrativa de una o varias clínicas, manteniendo una separación clara respecto a las funciones clínicas reservadas a odontólogos, higienistas u otros profesionales sanitarios.

La implementación debe seguir una arquitectura **Enterprise**, preparada para cientos de clínicas, múltiples sedes, múltiples profesionales y miles de pacientes, minimizando la deuda técnica y evitando futuras refactorizaciones estructurales.

El objetivo no es únicamente crear pantallas de administración.

El objetivo es construir un módulo completamente alineado con:

- Frontend.
- Backend.
- Base de datos.
- Seguridad.
- Auditoría.
- Roles.
- Permisos.
- Sistema de notificaciones.
- Agenda.
- Historial clínico.
- Facturación.
- Operaciones.
- Multi-Tenancy.
- Observabilidad.

Toda funcionalidad deberá integrarse correctamente con la arquitectura global del sistema.

---

# Principios obligatorios

La solución deberá cumplir estrictamente los siguientes principios:

- Enterprise Ready.
- Cloud Native.
- Multi-Tenant.
- Event Driven cuando corresponda.
- Escalable horizontalmente.
- Modular.
- Segura.
- Observable.
- Desacoplada.
- Configurable.
- Responsive First.
- Mobile First.
- Performance First.
- Security by Design.
- Privacy by Design.
- Auditability by Design.
- Clean Architecture.
- SOLID.
- Bajo acoplamiento.
- Alta cohesión.
- Separación clara de responsabilidades.

Nunca implementar funcionalidades aisladas.

Nunca crear pantallas frontend sin backend correspondiente.

Nunca crear endpoints backend sin revisar Prisma, DTOs, permisos, auditoría y frontend.

Nunca duplicar entidades, servicios, lógica de negocio o modelos.

Nunca confiar en datos sensibles enviados desde Angular.

---

# Stack tecnológico esperado

## Frontend

- Angular 19.
- Standalone Components.
- Signals.
- Lazy Loading.
- Reactive Forms.
- Guards.
- Interceptors.
- Responsive UI.
- Mobile First.

## Backend

- NestJS.
- Controllers.
- Services.
- Repositories.
- DTOs.
- Guards.
- Interceptors.
- Policies.
- Workers cuando corresponda.

## ORM

- Prisma.

## Base de datos

- PostgreSQL.

## Cache y colas

- Redis.
- BullMQ.

## Tiempo real

- Socket.IO o sistema equivalente ya existente.

## Seguridad

- JWT.
- Refresh Tokens.
- RBAC.
- Rate Limiting.
- Auditoría.
- Tenant Isolation.

## Multi-Tenant

- TenantInterceptor.
- Resolución de clinicId/tenantId exclusivamente en backend.
- Prohibido confiar en `clinicId`, `tenantId` o identificadores sensibles enviados por frontend.

---

# Definición del rol Admin/Dueño

El Admin/Dueño es el usuario con mayor autoridad dentro del tenant de una clínica dental.

Puede gestionar:

- Clínica.
- Sedes.
- Usuarios.
- Profesionales.
- Asistentes.
- Agenda.
- Gabinetes.
- Servicios.
- Tratamientos.
- Tarifas.
- Configuración operativa.
- Configuración financiera.
- Reportes.
- Permisos.
- Auditoría.
- Integraciones.
- Notificaciones.
- Configuración del paciente.
- Configuración de comunicación.

No debe tener acceso irrestricto a modificar información clínica sensible salvo que también tenga un rol clínico explícito.

La arquitectura deberá separar:

- Administración de negocio.
- Gestión operativa.
- Gestión clínica.
- Gestión financiera.
- Configuración técnica.
- Auditoría.
- Seguridad.

---

# Objetivos funcionales del módulo

El módulo Admin/Dueño deberá permitir administrar la clínica dental de forma completa, segura y escalable.

Debe cubrir como mínimo:

- Dashboard ejecutivo.
- Configuración de la clínica.
- Gestión de sedes.
- Gestión de usuarios.
- Gestión de roles y permisos.
- Gestión de profesionales.
- Gestión de asistentes.
- Gestión de gabinetes.
- Gestión de servicios.
- Gestión de tratamientos.
- Gestión de tarifas.
- Gestión de agenda.
- Gestión de horarios.
- Gestión de disponibilidad.
- Gestión de pacientes a nivel administrativo.
- Gestión de presupuestos.
- Gestión de facturación.
- Gestión de pagos.
- Gestión de caja.
- Gestión de seguros.
- Gestión de comunicaciones.
- Gestión de notificaciones.
- Gestión de integraciones.
- Gestión de auditoría.
- Gestión de seguridad.
- Gestión de reportes.
- Configuración multi-sede.
- Configuración multi-profesional.
- Configuración de branding.
- Configuración legal.
- Configuración documental.

---

# Dashboard ejecutivo

El Admin/Dueño deberá disponer de un dashboard ejecutivo con información operativa, financiera y administrativa.

Debe mostrar:

- Citas del día.
- Citas confirmadas.
- Citas canceladas.
- Citas reprogramadas.
- No-shows.
- Pacientes nuevos.
- Pacientes recurrentes.
- Producción diaria.
- Producción semanal.
- Producción mensual.
- Ingresos cobrados.
- Pagos pendientes.
- Presupuestos enviados.
- Presupuestos aceptados.
- Presupuestos rechazados.
- Tasa de aceptación de presupuestos.
- Ocupación por gabinete.
- Ocupación por profesional.
- Rentabilidad por tratamiento.
- Alertas administrativas.
- Alertas operativas.
- Alertas de seguridad.
- Estado de integraciones.
- Actividad reciente.
- Tareas pendientes.

El dashboard deberá ser completamente responsive y usable desde móvil, tablet y escritorio.

No cargar grandes volúmenes de datos en una sola petición.

Implementar paginación, agregaciones backend y cache cuando corresponda.

---

# Configuración general de la clínica

El Admin/Dueño deberá poder configurar los datos generales de la clínica:

- Nombre comercial.
- Razón social.
- Identificador fiscal.
- Dirección.
- País.
- Ciudad.
- Código postal.
- Teléfono.
- Email.
- Página web.
- Zona horaria.
- Idioma principal.
- Moneda.
- Logo.
- Imagen principal.
- Colores corporativos.
- Redes sociales.
- Información legal.
- Política de privacidad.
- Términos y condiciones.
- Consentimientos base.
- Estado de la clínica.

Toda configuración deberá guardarse en backend y persistirse en PostgreSQL mediante modelos Prisma consistentes.

Angular nunca deberá contener valores hardcodeados de configuración de la clínica.

---

# Gestión de sedes

El sistema deberá soportar clínicas con una o múltiples sedes.

Cada sede podrá tener:

- Nombre.
- Dirección.
- Teléfono.
- Email.
- Horario propio.
- Zona horaria.
- Responsable.
- Gabinetes.
- Profesionales asignados.
- Servicios disponibles.
- Estado.
- Configuración de agenda.
- Configuración de notificaciones.

Toda cita, paciente, gabinete, profesional y operación deberá poder relacionarse correctamente con la sede correspondiente cuando el modelo de negocio lo requiera.

---

# Gestión de usuarios

El Admin/Dueño deberá poder gestionar usuarios del tenant:

- Crear usuarios.
- Editar usuarios.
- Activar usuarios.
- Desactivar usuarios.
- Invitar usuarios.
- Reenviar invitación.
- Resetear contraseña.
- Asignar roles.
- Asignar permisos.
- Asignar sede.
- Asignar horario.
- Ver actividad.
- Bloquear usuario.
- Desbloquear usuario.

Nunca eliminar usuarios físicamente si existen registros históricos asociados.

Usar soft delete o estado lógico.

Toda acción deberá quedar auditada.

---

# Roles y permisos

Implementar RBAC granular.

Roles típicos:

- Admin/Dueño.
- Gerente.
- Odontólogo.
- Higienista.
- Asistente.
- Recepción.
- Contabilidad.
- Marketing.
- Auditor.
- Solo lectura.

Los permisos deberán controlar:

- Acceso a pacientes.
- Acceso a agenda.
- Acceso a presupuestos.
- Acceso a facturación.
- Acceso a reportes.
- Acceso a configuración.
- Acceso a auditoría.
- Acceso a integraciones.
- Acceso a documentos.
- Acceso a datos clínicos.

No hardcodear permisos en Angular.

El backend será la fuente de verdad.

---

# Gestión de profesionales

El Admin/Dueño deberá poder gestionar profesionales sanitarios:

- Alta.
- Edición.
- Baja lógica.
- Especialidad.
- Número colegiado.
- Sedes asignadas.
- Gabinetes disponibles.
- Horarios.
- Servicios que realiza.
- Duración por tratamiento.
- Color en agenda.
- Estado.
- Disponibilidad.
- Permisos.

Los datos clínicos sensibles deberán mantenerse protegidos por permisos específicos.

---

# Gestión de asistentes y personal administrativo

El Admin/Dueño deberá gestionar personal no clínico:

- Asistentes.
- Recepcionistas.
- Coordinadores.
- Personal de caja.
- Personal de administración.
- Marketing.
- Soporte.

Cada usuario tendrá:

- Rol.
- Permisos.
- Sede.
- Horario.
- Estado.
- Nivel de acceso.
- Restricciones.
- Auditoría.

---

# Gestión de gabinetes

El sistema deberá permitir configurar gabinetes o boxes clínicos.

Cada gabinete tendrá:

- Nombre.
- Código.
- Sede.
- Capacidad.
- Equipamiento.
- Estado.
- Servicios permitidos.
- Profesionales asignados.
- Horario de uso.
- Bloqueos.
- Observaciones.

La agenda deberá respetar la disponibilidad real de gabinetes.

---

# Gestión de servicios y tratamientos

El Admin/Dueño deberá poder configurar el catálogo de servicios:

- Revisión.
- Limpieza.
- Ortodoncia.
- Implantes.
- Blanqueamiento.
- Endodoncia.
- Cirugía.
- Periodoncia.
- Estética dental.
- Urgencias.
- Otros.

Cada servicio/tratamiento deberá incluir:

- Nombre.
- Código.
- Categoría.
- Descripción.
- Duración estimada.
- Precio base.
- Impuestos.
- Profesionales habilitados.
- Requiere gabinete específico.
- Requiere consentimiento.
- Requiere documentación.
- Estado.
- Orden de visualización.

No duplicar servicios si ya existen en el modelo de datos.

---

# Tarifas y precios

El Admin/Dueño deberá gestionar tarifas:

- Tarifa estándar.
- Tarifa por sede.
- Tarifa por profesional.
- Tarifa por aseguradora.
- Tarifa promocional.
- Tarifa de financiación.
- Descuentos autorizados.

Toda modificación de precio deberá auditarse.

No permitir cambios retroactivos que alteren facturas históricas.

---

# Agenda y disponibilidad

El Admin/Dueño podrá configurar reglas globales de agenda:

- Horarios.
- Duración de citas.
- Intervalos.
- Bloqueos.
- Feriados.
- Vacaciones.
- Descansos.
- Urgencias.
- Lista de espera.
- Confirmaciones.
- Reprogramaciones.
- No-shows.
- Capacidad por profesional.
- Capacidad por gabinete.
- Capacidad por sede.

La disponibilidad deberá calcularse en backend.

Angular únicamente mostrará resultados.

---

# Pacientes

El Admin/Dueño podrá ver información administrativa de pacientes:

- Datos personales.
- Datos de contacto.
- Historial de citas.
- Presupuestos.
- Pagos.
- Documentación administrativa.
- Consentimientos.
- Notas administrativas.
- Estado.

El acceso a información clínica deberá estar regulado por permisos específicos.

Nunca exponer más información de la necesaria.

---

# Presupuestos

El Admin/Dueño deberá poder:

- Crear presupuestos.
- Revisar presupuestos.
- Aprobar presupuestos.
- Enviar presupuestos.
- Versionar presupuestos.
- Marcar aceptación.
- Marcar rechazo.
- Configurar caducidad.
- Asociar financiación.
- Convertir en plan de tratamiento.

Todo presupuesto deberá tener trazabilidad completa.

---

# Facturación y pagos

El sistema deberá permitir la gestión administrativa de:

- Facturas.
- Recibos.
- Pagos.
- Pagos parciales.
- Pagos pendientes.
- Reembolsos.
- Caja diaria.
- Métodos de pago.
- Estado de cobro.
- Exportaciones.
- Informes.

No modificar documentos fiscales históricos sin generar trazabilidad.

---

# Caja diaria

El Admin/Dueño podrá supervisar:

- Apertura de caja.
- Cierre de caja.
- Movimientos.
- Ingresos.
- Salidas.
- Ajustes.
- Diferencias.
- Responsable.
- Reportes por día.
- Reportes por sede.

Toda operación de caja deberá estar auditada.

---

# Seguros y aseguradoras

El sistema deberá permitir gestionar:

- Aseguradoras.
- Planes.
- Pólizas.
- Coberturas.
- Autorizaciones.
- Reclamaciones.
- Documentación.
- Estados.
- Incidencias.

---

# Comunicaciones y notificaciones

El Admin/Dueño podrá configurar reglas de comunicación:

- Email.
- SMS.
- WhatsApp.
- Push.
- Recordatorios.
- Confirmaciones.
- Cancelaciones.
- Reprogramaciones.
- Instrucciones preoperatorias.
- Instrucciones postoperatorias.
- Encuestas.
- Campañas.

Todo envío deberá ejecutarse desde backend mediante colas.

Angular nunca enviará mensajes directamente.

---

# Integraciones

El módulo deberá estar preparado para futuras integraciones:

- WhatsApp Business.
- Email SMTP.
- Calendarios.
- Pasarelas de pago.
- Facturación externa.
- CRM.
- ERP.
- Herramientas de marketing.
- Almacenamiento documental.
- Sistemas de firma digital.

Toda integración deberá implementarse mediante adaptadores desacoplados.

Nunca acoplar la lógica de negocio a un proveedor concreto.

---

# Auditoría administrativa

Toda acción del Admin/Dueño deberá registrarse.

Registrar:

- Usuario.
- Rol.
- Tenant.
- Clínica.
- Sede.
- Acción.
- Entidad.
- Identificador.
- Valor anterior.
- Valor nuevo.
- IP.
- User-Agent.
- Timestamp.
- Resultado.
- Duración.
- Correlation ID.

Los logs de auditoría deberán ser inmutables.

Nunca modificar ni eliminar auditorías históricas.

---

# Seguridad

Implementar:

- RBAC.
- Validación backend.
- Rate Limiting.
- Expiración de sesiones.
- Política de contraseñas.
- Contraseñas temporales.
- Bloqueo por intentos.
- Auditoría.
- Sanitización.
- CSP.
- Security Headers.
- CORS seguro.
- Protección contra XSS.
- Protección contra CSRF cuando aplique.
- Protección contra abuso de APIs.

Angular nunca deberá tomar decisiones críticas de seguridad.

---

# Multi-Tenant

Toda operación deberá ejecutarse dentro del tenant correspondiente.

No permitir:

- Acceso cruzado entre clínicas.
- Identificadores sensibles enviados desde frontend.
- Consultas sin clinicId/tenantId.
- Datos compartidos accidentalmente entre tenants.

Todas las queries deberán estar correctamente filtradas por tenant cuando corresponda.

---

# Base de datos

Antes de implementar, auditar Prisma.

Validar:

- Modelos existentes.
- Relaciones.
- Índices.
- Restricciones únicas.
- Soft deletes.
- Auditoría.
- Integridad referencial.
- Migraciones.
- Historial.
- Campos requeridos.
- Campos sensibles.

Nunca crear entidades duplicadas.

Nunca modificar modelos sin revisar impacto frontend/backend.

---

# Backend

Antes de implementar, auditar:

- Controllers.
- Services.
- Repositories.
- DTOs.
- Guards.
- Interceptors.
- Policies.
- Middlewares.
- Workers.
- Eventos.
- Módulos existentes.

Toda funcionalidad deberá tener:

- DTO de entrada.
- Validación.
- Service.
- Repository si aplica.
- Auditoría.
- Permisos.
- Tests cuando existan.
- Manejo de errores.
- Respuesta tipada.

---

# Frontend

El módulo Angular deberá incluir:

- Rutas lazy-loaded.
- Guards.
- Layout responsive.
- Componentes standalone.
- Servicios HTTP.
- Interfaces TypeScript.
- Formularios reactivos.
- Validaciones visuales.
- Estados loading.
- Estados error.
- Estados empty.
- Paginación.
- Tablas responsive.
- Filtros.
- Búsqueda.
- Confirmaciones.
- Accesibilidad básica.

No incluir lógica de negocio en Angular.

Angular debe reflejar el contrato del backend.

---

# Responsive

El panel deberá funcionar perfectamente en:

- Móvil.
- Tablet.
- Desktop.
- Pantallas táctiles.
- Recepción.
- Oficina administrativa.

Utilizar una única base responsive.

No crear interfaces separadas por dispositivo.

---

# Rendimiento

Implementar:

- Paginación backend.
- Filtros backend.
- Índices en PostgreSQL.
- Cache Redis cuando corresponda.
- Agregaciones eficientes.
- Evitar N+1.
- Lazy loading.
- Virtual scroll si aplica.
- Consultas optimizadas.
- Respuestas compactas.

---

# Observabilidad

Implementar:

- Logs estructurados.
- Correlation ID.
- Métricas.
- Eventos críticos.
- Health checks.
- Alertas.
- Auditoría.
- Trazabilidad por tenant.

---

# Criterios de aceptación

La implementación se considerará correcta únicamente si:

- Compila backend.
- Compila frontend.
- No rompe funcionalidades existentes.
- No introduce inconsistencias Prisma.
- No duplica modelos.
- No expone datos entre tenants.
- Respeta roles y permisos.
- Es responsive.
- Es auditable.
- Es escalable.
- Está alineada con la arquitectura global.

---

# Flujo obligatorio de implementación

Antes de escribir código:

1. Auditar Prisma.
2. Auditar backend.
3. Auditar frontend.
4. Auditar roles.
5. Auditar permisos.
6. Auditar seguridad.
7. Auditar agenda.
8. Auditar pacientes.
9. Auditar facturación.
10. Auditar notificaciones.
11. Auditar multi-tenancy.
12. Detectar inconsistencias.

Después:

1. Diseñar la mínima implementación correcta.
2. Implementar incrementalmente.
3. Validar compilación.
4. Corregir errores.
5. Confirmar alineación frontend/backend/db.
6. Crear commit estable.
7. Crear tag estable.

---

# Validación obligatoria

Cada iteración deberá finalizar con:

```bash
pnpm --filter api exec tsc --noEmit --skipLibCheck
pnpm build
git status
```

No se permitirá finalizar si existe:

- Error TypeScript.
- Error Angular.
- Error Prisma.
- Inconsistencia frontend/backend.
- Endpoint sin contrato.
- Pantalla sin backend.
- Query sin aislamiento tenant.
- DTO incompleto.
- Migración insegura.
- Deuda técnica innecesaria.

El resultado final deberá ser un módulo **Admin/Dueño de Clínica Dental** de nivel empresarial, completamente alineado con la arquitectura SaaS Multi-Tenant, preparado para crecer desde una clínica individual hasta una red de cientos de clínicas, sin requerir refactorizaciones estructurales futuras.
