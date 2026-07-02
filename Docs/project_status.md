# VIRAS Project Status

Fecha de actualización: 2026-07-02

## Estado general

El proyecto VIRAS está reconstruido en este directorio y funcionando como una aplicación full stack local con:

- Backend NestJS en `backend`.
- Frontend Angular en `frontend`.
- Base de datos PostgreSQL restaurada desde `db_bckp-15-05-2026.dump`.
- Prisma Client generado desde el esquema en `backend/prisma/schema`.
- Contratos principales entre frontend, backend y base de datos revisados y alineados.

El proyecto compila correctamente, las suites actuales de test pasan y los flujos principales quedaron alineados con JWT/RBAC en backend y token en frontend.

## Verificación estable

Comandos ejecutados y verificados:

```bash
npm --prefix backend run build
npm --prefix backend test -- --runInBand
npm --prefix frontend run build
npm --prefix frontend test -- --watch=false
bash scripts/manual-flow-check.sh
```

Resultado actual:

- Backend build: estable.
- Backend tests: 6 suites / 6 tests pasando.
- Frontend build: estable.
- Frontend tests: 10 archivos / 11 tests pasando.
- Warning CommonJS de `google-libphonenumber`: corregido mediante `allowedCommonJsDependencies`.
- Base de datos local sincronizada con Prisma mediante `prisma db push`.
- Flujo funcional completo admin/staff/paciente/citas/formularios clinicos: verificado con `scripts/manual-flow-check.sh`.
- Flujo protegido con JWT: verificado; `/api/citas` sin token responde 401 y las rutas publicas necesarias siguen respondiendo 200.
- Arranque backend: mejorado el manejo de puerto ocupado (`EADDRINUSE`) para mostrar un mensaje claro si `localhost:3000` ya esta en uso.
- Dashboard Admin/Owner: implementado y verificado con endpoint agregado protegido por JWT/RBAC.
- QA visual completo en navegador real/headless: verificado con `scripts/visual-flow-check.mjs` y capturas en `Docs/qa-visual-1782986019751`.
- Layout administrativo responsive corregido para que admin/doctor/asistente/techsoft sean usables en movil con sidebar compacto.
- Registro admin corregido: el telefono ya no bloquea el formulario cuando el campo no se muestra en modo negocio.

## Prueba funcional completa

Se añadió el script `scripts/manual-flow-check.sh` para ejecutar una prueba de punta a punta contra la app local corriendo en `localhost`.

El script fue actualizado para trabajar con autenticacion JWT real: hace login, captura tokens y usa `Authorization: Bearer` en endpoints privados.

El script crea datos de prueba únicos y valida:

- Creación de admin y negocio.
- Login de admin.
- Configuración de negocio.
- Consulta pública del negocio por slug.
- Creación de doctor/staff.
- Login de doctor con contraseña bcrypt.
- Creación de paciente asociado a negocio y doctor.
- Login de paciente.
- Creación de cita.
- Aparición de la cita en la agenda del negocio.
- Guardado y lectura de anamnesis.
- Guardado y lectura de consentimientos, incluyendo `representante_relacion`.
- Guardado y listado de presupuestos/seguros.
- Respuesta HTTP 200 de rutas frontend principales:
  - `/`
  - `/:slug`
  - `/:slug/registro`
  - `/:slug/agendar`

Resultado de la última ejecución:

- Admin creado: 201.
- Admin login: OK.
- `password_hash` no expuesto: OK.
- Configuración de negocio: OK.
- Doctor creado y login doctor: OK.
- Paciente creado y login paciente: OK.
- Doctor asignado consistente en creación y login de paciente: OK.
- Cita creada con `business_id` correcto: OK.
- Cita visible por agenda de negocio: OK.
- Anamnesis: OK.
- Consentimientos: OK.
- Presupuestos: OK.
- Rutas frontend principales: OK.
- Rutas privadas protegidas sin token: OK, responden 401.
- Dashboard Admin/Owner: OK, `/api/admin-owner/dashboard` responde 200 con token ADMIN y devuelve metricas del negocio autenticado.
- Prueba visual completa: OK, `scripts/visual-flow-check.mjs` genero 14 capturas y valido los flujos de alta prioridad.

## Scripts y backups

El folder `scripts` queda documentado por `scripts/que-cual.txt`, que resume para que sirve cada script.

Scripts principales actuales:

- `manual-flow-check.sh`: valida flujos E2E principales contra backend/frontend locales.
- `visual-flow-check.mjs`: ejecuta QA visual con Chrome headless, datos de prueba y capturas responsive.
- `backup-project.sh`: crea un TAR limpio del proyecto y genera un dump fresco de PostgreSQL antes de empaquetar.
- `restore-latest-backup.sh`: restaura el proyecto desde el ultimo TAR valido en `backups`, reinstala dependencias, restaura BD y prepara el entorno en un nuevo PC.

Backup TAR recomendado actual:

- `backups/viras_project_backup_20260702_094409.tar`

Estado respaldado en ese TAR:

- Proyecto reconstruido.
- Frontend/backend alineados.
- Scripts actuales incluidos.
- Dump fresco de PostgreSQL incluido.
- Builds, tests y flujo funcional verificados hasta ese punto.

## Base de datos

La base `viras_db` fue restaurada y contiene las tablas principales:

- `Business`
- `Professional`
- `usuarios`
- `perfil_paciente`
- `perfil_doctor`
- `perfil_asistente`
- `perfil_techsoft`
- `citas`
- `anamnesis`
- `consentimientos`
- `presupuestos_seguros`
- `_prisma_migrations`

También se añadió y sincronizó el campo:

- `consentimientos.representante_relacion`

Esto alinea la BD con el formulario legal de menores del frontend.

## Backend implementado

El backend NestJS tiene módulos funcionales para:

- Usuarios y autenticación.
- Negocios multi-tenant.
- Profesionales / staff.
- Citas.
- Anamnesis.
- Consentimientos.
- Presupuestos y seguros.
- Dashboard ejecutivo Admin/Owner.
- Documentación Swagger en `/api/docs`.

Mejoras recientes:

- Login ahora soporta bcrypt para contraseñas nuevas.
- Login mantiene compatibilidad con contraseñas antiguas en texto plano del backup.
- Login ahora devuelve `access_token` JWT y usuario sanitizado.
- Las respuestas de usuario ya no exponen `password_hash`.
- El backend normaliza datos de sesión útiles para frontend: `doctor_id`, `slug`, `nombre_empresa`.
- Las citas ya no dependen de `business_id` sensible enviado por Angular para usuarios normales; el backend resuelve el tenant desde el usuario autenticado.
- DTO de consentimientos alineado con los campos reales usados por frontend y BD.
- Guardas globales JWT/RBAC aplicadas en NestJS mediante `APP_GUARD`.
- Decoradores `@Public`, `@Roles` y `@CurrentUser` implementados para separar rutas publicas, roles y contexto autenticado.
- Endpoints de `usuarios`, `citas`, `business`, `professionals`, `anamnesis`, `consentimientos` y `presupuestos` alineados con roles y alcance multi-tenant.
- Endpoint `/admin-owner/dashboard` agregado para metricas ejecutivas agregadas del owner sin cargar grandes listados en Angular.
- Presupuestos ahora usan `PrismaService` compartido y validan acceso por paciente/tenant antes de crear o consultar documentos.
- Borrado fisico de usuarios reemplazado por baja logica (`esta_activo=false`) para conservar historial.
- Creacion de usuarios `ASISTENTE` ahora genera su perfil `perfil_asistente`.
- Rutas publicas necesarias mantenidas para landing, registro publico y seleccion de doctores por negocio.
- `main.ts` ahora captura `EADDRINUSE` y explica como resolver el puerto ocupado sin cambiar silenciosamente el contrato frontend/backend.

## Frontend implementado

El frontend Angular tiene implementadas áreas para:

- Landing pública dinámica por slug de negocio.
- Login.
- Registro de negocio/admin.
- Registro de paciente por negocio.
- Dashboard de paciente.
- Perfil de paciente.
- Calendario de citas.
- Mis citas.
- Anamnesis clínica.
- Consentimientos legales.
- Presupuestos / seguros.
- Dashboard administrativo.
- Dashboard ejecutivo Admin/Owner.
- Configuración de negocio.
- Gestión de staff.
- Gestión maestra de citas.
- Dashboard de asistente.
- Dashboard TechSoft.

Mejoras recientes:

- URL base del API centralizada en `frontend/src/app/core/api.config.ts`.
- Eliminadas llamadas hardcodeadas dispersas a `http://localhost:3000/api`.
- Guard de roles reforzado con `canActivateChild`.
- Lectura de doctor asignado corregida con `perfil_paciente.dentista_id`.
- Modal de citas recibe `business_id` desde la sesión.
- Specs antiguas corregidas para que la suite sea ejecutable.
- Warning CommonJS de Angular corregido en `frontend/angular.json`.
- Interceptor HTTP agregado para adjuntar `Authorization: Bearer <token>` automaticamente.
- `AuthService` guarda y expone el JWT desde la sesion local.
- Registro publico de paciente envia `slug` del negocio en vez de confiar en `business_id` sensible.
- Selector publico de doctores consume `/usuarios/public/business/:businessId/doctors`.
- Ruta `/asistente/dashboard` implementada para rol `ASISTENTE`.
- Dashboard de asistente permite visualizar citas por dia/doctor, cambiar estados de citas, reprogramar y registrar pacientes para el negocio autenticado.
- Login de rol `ADMIN` redirige a `/admin/dashboard`.
- Servicio `AdminOwnerDashboardService` consume metricas agregadas desde backend.
- Panel Admin/Owner responsive con KPIs, alertas, proximas citas, ocupacion por profesional, finanzas administrativas y pacientes recientes.
- Layout administrativo corregido para movil: sidebar compacto, textos ocultos hasta desktop, header y padding adaptables.
- API base frontend mantiene `http://localhost:3000/api` por defecto y permite override de QA con `localStorage.viras_api_base_url`.

## Contratos alineados

Quedaron alineados los contratos principales:

- `usuarios` y sesión frontend.
- `perfil_paciente.dentista_id` y doctor asignado.
- `citas.usuario_id` de entrada y `citas.paciente_id` en BD.
- `citas.business_id` para agenda multi-tenant.
- `consentimientos` entre formulario, DTO, Prisma y PostgreSQL.
- Rutas protegidas por roles en áreas paciente/admin/techsoft.
- Aislamiento multi-tenant en backend usando `business_id` del usuario autenticado.
- Token JWT en login backend y consumo automatico desde Angular.
- Dashboard Admin/Owner consume un endpoint agregado filtrado por `business_id` del JWT.
- Servicios Angular principales usando una base API común.

## Cómo iniciar el proyecto

Abrir dos terminales WSL.

Terminal 1:

```bash
cd /home/rene/viras/backend
npm run start:dev
```

Terminal 2:

```bash
cd /home/rene/viras/frontend
npm run start -- --host 0.0.0.0
```

URLs:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Pendientes y riesgos

### Alta prioridad

- QA visual de flujos completos en navegador: completado.
  - Registro admin: OK.
  - Login admin: OK.
  - Configuración de negocio: OK.
  - Creación de doctor/staff: OK.
  - Registro de paciente: OK.
  - Login paciente: OK.
  - Reserva de cita: OK.
  - Visualización de cita en agenda admin: OK.
  - Dashboard ejecutivo Admin/Owner: OK.
  - Consentimientos, anamnesis y presupuesto: OK.
  - Dashboard de asistente en desktop, tablet y movil: OK.
  - Evidencia previa: `Docs/qa-visual-1782986019751/visual-flow-report.json` y capturas PNG en el mismo folder.
  - Evidencia actualizada: `Docs/qa-visual-1782986827274/visual-flow-report.json` y capturas PNG en el mismo folder.

- Panel ejecutivo Admin/Owner: implementado y validado con backend actualizado.
  - Login ADMIN redirige correctamente a `/admin/dashboard`.
  - Endpoint `/api/admin-owner/dashboard` validado durante QA visual en backend actualizado.
  - Riesgo operativo pendiente: el proceso local actual en `localhost:3000` responde `404` para `/api/admin-owner/dashboard`, por lo que debe reiniciarse el backend desde el código actualizado para que el navegador normal cargue el panel.

- Configurar Sitio responsive: corregido y validado.
  - Tabs compactas y desplazables en móvil.
  - Cards, formularios, grids internos y gestor de horarios ajustados a una columna en pantallas pequeñas.
  - Evidencia móvil: `Docs/qa-visual-1782986827274/03b-configuracion-negocio-mobile.png`.

- Revisar estrategia definitiva de contraseñas:
  - Actualmente hay compatibilidad con backup antiguo en texto plano.
  - Recomendado: migrar todas las contraseñas antiguas a bcrypt tras primer login o con script controlado.

- Endurecer configuracion de seguridad para produccion:
  - Definir `JWT_SECRET` obligatorio y fuerte en variables de entorno.
  - Revisar expiracion/refresh token segun necesidad operativa.
  - Revisar politicas CORS por dominio real en vez de `origin: true`.
  - Evaluar cookies httpOnly si se decide reducir exposicion del token en frontend.

- Resolver/reiniciar el proceso que ocupa el puerto 3000 cuando se levante el backend:
  - Actualmente se detecto un proceso `node` escuchando en `localhost:3000`.
  - Ese proceso responde `404` para `/api/admin-owner/dashboard`, por lo que no parece ser el backend actualizado.
  - El frontend apunta por defecto a `http://localhost:3000/api`, por lo que conviene detenerlo y levantar nuevamente `backend` desde esta carpeta.

### Media prioridad

- Crear migraciones Prisma formales.
  - Ahora el proyecto usa `prisma db push`.
  - Para producción conviene `prisma migrate dev/deploy`.

- Mejorar tests de integración:
  - Tests actuales validan compilación y creación básica.
  - Faltan tests de flujos críticos con mocks realistas o BD de test.
  - Agregar tests especificos para JWT/RBAC, aislamiento por `business_id` y dashboard de asistente.
  - Agregar tests especificos para `/admin-owner/dashboard` y scoping de presupuestos.

- Centralizar modelos compartidos.
  - Hay interfaces frontend alineadas manualmente con DTOs backend.
  - A futuro conviene generar tipos o mantener contratos OpenAPI.

- Evitar uso directo de `HttpClient` dentro de componentes.
  - Ya existe API base centralizada.
  - Siguiente paso: mover llamadas clínicas restantes a servicios dedicados.

### Baja prioridad

- Revisar bundle size de módulos lazy grandes.
- Limpiar archivos de backup antiguos si ya no son necesarios.
- Documentar variables de entorno en `.env.example`.
- Preparar Docker Compose o script único para levantar PostgreSQL, backend y frontend.
- Modelar formalmente sedes, gabinetes, servicios/tratamientos, tarifas, facturacion, pagos, caja, auditoria e integraciones antes de crear pantallas definitivas de esas areas.
- Revisar compatibilidad futura de Prisma 7, ya que Prisma muestra avisos de deprecación para `package.json#prisma` y `prismaSchemaFolder`.

## Siguiente paso recomendado

El siguiente bloque de trabajo de alta prioridad deberia enfocarse en endurecer seguridad de produccion: `JWT_SECRET` obligatorio, CORS por dominios reales, expiracion/refresh token, rate limiting y una estrategia definitiva para migrar contrasenas antiguas a bcrypt.
