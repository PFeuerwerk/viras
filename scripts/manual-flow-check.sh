#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3000/api}"
TS="$(date +%s)"
SLUG="viras-e2e-$TS"
ADMIN_EMAIL="admin-$TS@viras.test"
DOCTOR_EMAIL="doctor-$TS@viras.test"
PATIENT_EMAIL="patient-$TS@viras.test"
PASS="Test1234"
WORK="/tmp/viras-e2e-$TS"

mkdir -p "$WORK"

post_json() {
  local url=$1 file=$2 out=$3
  curl -s -o "$out" -w "%{http_code}" -H "Content-Type: application/json" -X POST "$url" --data-binary "@$file"
}

post_json_auth() {
  local url=$1 file=$2 out=$3 token=$4
  curl -s -o "$out" -w "%{http_code}" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -X POST "$url" --data-binary "@$file"
}

patch_json() {
  local url=$1 file=$2 out=$3
  curl -s -o "$out" -w "%{http_code}" -H "Content-Type: application/json" -X PATCH "$url" --data-binary "@$file"
}

patch_json_auth() {
  local url=$1 file=$2 out=$3 token=$4
  curl -s -o "$out" -w "%{http_code}" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -X PATCH "$url" --data-binary "@$file"
}

get_json() {
  local url=$1 out=$2
  curl -s -o "$out" -w "%{http_code}" "$url"
}

get_json_auth() {
  local url=$1 out=$2 token=$3
  curl -s -o "$out" -w "%{http_code}" -H "Authorization: Bearer $token" "$url"
}

cat > "$WORK/admin.json" <<JSON
{
  "email": "$ADMIN_EMAIL",
  "password_hash": "$PASS",
  "rol": "ADMIN",
  "nombres": "Admin",
  "apellidos": "E2E",
  "nombre_empresa": "Clinica E2E $TS",
  "slug": "$SLUG",
  "movil1": "+34111000000"
}
JSON

ADMIN_CODE="$(post_json "$BASE/usuarios" "$WORK/admin.json" "$WORK/admin.out")"
ADMIN_ID="$(jq -r ".id" "$WORK/admin.out")"
BUSINESS_ID="$(jq -r ".business_id" "$WORK/admin.out")"

cat > "$WORK/admin-login.json" <<JSON
{"email":"$ADMIN_EMAIL","password":"$PASS"}
JSON

LOGIN_CODE="$(post_json "$BASE/usuarios/login" "$WORK/admin-login.json" "$WORK/admin-login.out")"
LOGIN_OK="$(jq -r ".success" "$WORK/admin-login.out")"
ADMIN_TOKEN="$(jq -r ".access_token" "$WORK/admin-login.out")"
PASSWORD_EXPOSED="$(jq "has(\"password_hash\") or (.user | has(\"password_hash\"))" "$WORK/admin-login.out")"

cat > "$WORK/business-patch.json" <<JSON
{
  "nombre_empresa": "Clinica E2E $TS Actualizada",
  "tipo_negocio": "DENTAL",
  "slug": "$SLUG",
  "titulo_hero": "Sonrisas E2E",
  "slogan_hero": "Pruebas estables",
  "descripcion_hero": "Negocio creado para prueba funcional manual automatizada.",
  "telefono": "+34111000000",
  "direccion": "Calle E2E 123",
  "booking_services": [
    {"titulo":"Consulta E2E","descripcion":"Revision de prueba","duracion_minutos":30,"es_emergencia":false,"icono":"diente1.png"}
  ],
  "servicios": [
    {"titulo":"Limpieza E2E","descripcion":"Servicio de prueba","icono":"tooth-clean.png","precio_estimado":"50"}
  ],
  "reviews": [
    {"nombre_cliente":"Paciente Demo","comentario":"Todo correcto","puntuacion":5}
  ],
  "config_visual": {"primary_color":"#2563eb","secondary_color":"#0f172a","accent_color":"#14b8a6"},
  "seccion_que_hacemos": {"titulo":"Que hacemos E2E","introduccion":"Validacion","items":[{"nombre":"Diagnostico","descripcion":"Completo","icono":"check_circle"}]}
}
JSON

BUSINESS_PATCH_CODE="$(patch_json_auth "$BASE/business/$BUSINESS_ID" "$WORK/business-patch.json" "$WORK/business-patch.out" "$ADMIN_TOKEN")"
BUSINESS_GET_CODE="$(get_json "$BASE/business/slug/$SLUG" "$WORK/business-get.out")"
BOOKING_TITLE="$(jq -r ".booking_services[0].titulo" "$WORK/business-get.out")"

cat > "$WORK/doctor.json" <<JSON
{
  "business_id":"$BUSINESS_ID",
  "nombre":"Doctor E2E",
  "cargo":"Odontologo",
  "formacion":"Universidad E2E",
  "descripcion":"Doctor creado en prueba funcional",
  "email":"$DOCTOR_EMAIL",
  "password_hash":"$PASS",
  "telefono":"+34111222333",
  "movil1":"+34111222333",
  "numero_colegiado":"COL-$TS",
  "especialidad_primaria":"Odontologia general",
  "anos_experiencia":7
}
JSON

DOCTOR_CODE="$(post_json_auth "$BASE/professionals" "$WORK/doctor.json" "$WORK/doctor.out" "$ADMIN_TOKEN")"
PROFESSIONAL_ID="$(jq -r ".id" "$WORK/doctor.out")"
DOCTOR_USER_ID="$(jq -r ".usuario_id" "$WORK/doctor.out")"

cat > "$WORK/doctor-login.json" <<JSON
{"email":"$DOCTOR_EMAIL","password":"$PASS"}
JSON

DOCTOR_LOGIN_CODE="$(post_json "$BASE/usuarios/login" "$WORK/doctor-login.json" "$WORK/doctor-login.out")"
DOCTOR_LOGIN_OK="$(jq -r ".success" "$WORK/doctor-login.out")"
DOCTOR_TOKEN="$(jq -r ".access_token" "$WORK/doctor-login.out")"
DOCTOR_ROLE="$(jq -r ".user.rol" "$WORK/doctor-login.out")"

cat > "$WORK/patient.json" <<JSON
{
  "email": "$PATIENT_EMAIL",
  "password_hash": "$PASS",
  "rol": "PACIENTE",
  "nombres": "Paciente",
  "apellidos": "E2E",
  "slug": "$SLUG",
  "dentista_id": "$DOCTOR_USER_ID",
  "movil1": "+34111333444",
  "fecha_nacimiento": "1990-01-15",
  "genero": "FEMENINO",
  "seguridad_social": "SS-E2E",
  "direccion": "Calle Paciente 1",
  "ciudad": "Madrid",
  "consentimiento_email": true,
  "consentimiento_sms": true
}
JSON

PATIENT_CODE="$(post_json "$BASE/usuarios" "$WORK/patient.json" "$WORK/patient.out")"
PATIENT_ID="$(jq -r ".id" "$WORK/patient.out")"
PATIENT_DOCTOR_ID="$(jq -r ".doctor_id" "$WORK/patient.out")"

cat > "$WORK/patient-login.json" <<JSON
{"email":"$PATIENT_EMAIL","password":"$PASS"}
JSON

PATIENT_LOGIN_CODE="$(post_json "$BASE/usuarios/login" "$WORK/patient-login.json" "$WORK/patient-login.out")"
PATIENT_LOGIN_OK="$(jq -r ".success" "$WORK/patient-login.out")"
PATIENT_TOKEN="$(jq -r ".access_token" "$WORK/patient-login.out")"
PATIENT_LOGIN_DOCTOR_ID="$(jq -r ".user.doctor_id" "$WORK/patient-login.out")"

APPOINTMENT_DATE="$(date -u -d '+7 days' '+%Y-%m-%dT10:30:00.000Z')"
cat > "$WORK/cita.json" <<JSON
{
  "usuario_id": "$PATIENT_ID",
  "doctor_id": "$DOCTOR_USER_ID",
  "fecha": "$APPOINTMENT_DATE",
  "duracionEstimada": 30,
  "motivoConsulta": "Consulta E2E",
  "servicio_cita": "Consulta E2E",
  "antecedentes_clinicos": ["Alergias"],
  "observaciones_paciente": "Prueba funcional",
  "tipo_paciente": "NUEVO",
  "estado": "PENDIENTE"
}
JSON

CITA_CODE="$(post_json_auth "$BASE/citas" "$WORK/cita.json" "$WORK/cita.out" "$PATIENT_TOKEN")"
CITA_ID="$(jq -r ".id" "$WORK/cita.out")"
CITA_BUSINESS_ID="$(jq -r ".business_id" "$WORK/cita.out")"
CITAS_BUSINESS_CODE="$(get_json_auth "$BASE/citas/business/$BUSINESS_ID" "$WORK/citas-business.out" "$ADMIN_TOKEN")"
CITA_IN_BUSINESS="$(jq --arg id "$CITA_ID" "any(.[]; .id == \$id)" "$WORK/citas-business.out")"

cat > "$WORK/anamnesis.json" <<JSON
{
  "paciente_id": "$PATIENT_ID",
  "motivo_consulta": "Revision general E2E",
  "medicamentos_actuales": "Ninguno",
  "embarazo_lactancia": false,
  "historial_medico_json": {"diabetes": false},
  "observaciones_adicionales": "Datos de prueba"
}
JSON
ANAMNESIS_CODE="$(post_json_auth "$BASE/anamnesis" "$WORK/anamnesis.json" "$WORK/anamnesis.out" "$PATIENT_TOKEN")"
ANAMNESIS_GET_CODE="$(get_json_auth "$BASE/anamnesis/$PATIENT_ID" "$WORK/anamnesis-get.out" "$PATIENT_TOKEN")"

cat > "$WORK/consentimiento.json" <<JSON
{
  "paciente_id": "$PATIENT_ID",
  "general_odontologico": true,
  "general_fecha": "2026-07-02",
  "proteccion_datos": true,
  "lopd_uso_asistencial": true,
  "representante_legal": true,
  "representante_nombre": "Tutor E2E",
  "representante_dni": "TUTOR-$TS",
  "representante_relacion": "Tutor",
  "representante_fecha": "2026-07-02",
  "politicas_privacidad": true,
  "politicas_fecha": "2026-07-02"
}
JSON
CONSENT_CODE="$(post_json_auth "$BASE/consentimientos" "$WORK/consentimiento.json" "$WORK/consentimiento.out" "$PATIENT_TOKEN")"
CONSENT_GET_CODE="$(get_json_auth "$BASE/consentimientos/$PATIENT_ID" "$WORK/consentimiento-get.out" "$PATIENT_TOKEN")"
CONSENT_RELACION="$(jq -r ".representante_relacion" "$WORK/consentimiento-get.out")"

cat > "$WORK/presupuesto.json" <<JSON
{
  "paciente_id": "$PATIENT_ID",
  "aseguradora_compania": "Seguro E2E",
  "diagnostico_general": "Diagnostico de prueba",
  "plan_tratamiento": [{"fase":"1","tratamiento":"Limpieza","importe":50}],
  "importe_total": 50,
  "aceptacion_economica": true,
  "modalidad_pago": "pago_unico",
  "detalle_pagos": [{"concepto":"Limpieza","importe":50}],
  "validez_dias": 30
}
JSON
PRESUPUESTO_CODE="$(post_json_auth "$BASE/presupuestos" "$WORK/presupuesto.json" "$WORK/presupuesto.out" "$ADMIN_TOKEN")"
PRESUPUESTO_ID="$(jq -r ".id" "$WORK/presupuesto.out")"
PRESUPUESTOS_GET_CODE="$(get_json_auth "$BASE/presupuestos/paciente/$PATIENT_ID" "$WORK/presupuestos-get.out" "$PATIENT_TOKEN")"
PRESUPUESTO_IN_LIST="$(jq --arg id "$PRESUPUESTO_ID" "any(.[]; .id == \$id)" "$WORK/presupuestos-get.out")"

ADMIN_DASHBOARD_CODE="$(get_json_auth "$BASE/admin-owner/dashboard" "$WORK/admin-dashboard.out" "$ADMIN_TOKEN")"
ADMIN_DASHBOARD_BUSINESS="$(jq -r ".business.nombre_empresa" "$WORK/admin-dashboard.out")"
ADMIN_DASHBOARD_PATIENTS="$(jq -r ".patients.total" "$WORK/admin-dashboard.out")"
ADMIN_DASHBOARD_ACCEPTANCE="$(jq -r ".financial.acceptanceRate" "$WORK/admin-dashboard.out")"

FRONT_ROOT="$(curl -s -o "$WORK/frontend-root.html" -w "%{http_code}" http://localhost:4200/)"
FRONT_SLUG="$(curl -s -o "$WORK/frontend-slug.html" -w "%{http_code}" "http://localhost:4200/$SLUG")"
FRONT_REGISTER="$(curl -s -o "$WORK/frontend-register.html" -w "%{http_code}" "http://localhost:4200/$SLUG/registro")"
FRONT_BOOKING="$(curl -s -o "$WORK/frontend-booking.html" -w "%{http_code}" "http://localhost:4200/$SLUG/agendar")"

jq -n \
  --arg work "$WORK" \
  --arg slug "$SLUG" \
  --arg adminEmail "$ADMIN_EMAIL" \
  --arg doctorEmail "$DOCTOR_EMAIL" \
  --arg patientEmail "$PATIENT_EMAIL" \
  --arg businessId "$BUSINESS_ID" \
  --arg doctorUserId "$DOCTOR_USER_ID" \
  --arg patientId "$PATIENT_ID" \
  --arg citaId "$CITA_ID" \
  --arg adminCode "$ADMIN_CODE" \
  --arg loginCode "$LOGIN_CODE" \
  --arg loginOk "$LOGIN_OK" \
  --arg passwordExposed "$PASSWORD_EXPOSED" \
  --arg businessPatchCode "$BUSINESS_PATCH_CODE" \
  --arg businessGetCode "$BUSINESS_GET_CODE" \
  --arg bookingTitle "$BOOKING_TITLE" \
  --arg doctorCode "$DOCTOR_CODE" \
  --arg doctorLoginCode "$DOCTOR_LOGIN_CODE" \
  --arg doctorLoginOk "$DOCTOR_LOGIN_OK" \
  --arg doctorRole "$DOCTOR_ROLE" \
  --arg patientCode "$PATIENT_CODE" \
  --arg patientDoctorId "$PATIENT_DOCTOR_ID" \
  --arg patientLoginCode "$PATIENT_LOGIN_CODE" \
  --arg patientLoginOk "$PATIENT_LOGIN_OK" \
  --arg patientLoginDoctorId "$PATIENT_LOGIN_DOCTOR_ID" \
  --arg citaCode "$CITA_CODE" \
  --arg citaBusinessId "$CITA_BUSINESS_ID" \
  --arg citasBusinessCode "$CITAS_BUSINESS_CODE" \
  --arg citaInBusiness "$CITA_IN_BUSINESS" \
  --arg anamnesisCode "$ANAMNESIS_CODE" \
  --arg anamnesisGetCode "$ANAMNESIS_GET_CODE" \
  --arg consentCode "$CONSENT_CODE" \
  --arg consentGetCode "$CONSENT_GET_CODE" \
  --arg consentRelacion "$CONSENT_RELACION" \
  --arg presupuestoCode "$PRESUPUESTO_CODE" \
  --arg presupuestosGetCode "$PRESUPUESTOS_GET_CODE" \
  --arg presupuestoInList "$PRESUPUESTO_IN_LIST" \
  --arg adminDashboardCode "$ADMIN_DASHBOARD_CODE" \
  --arg adminDashboardBusiness "$ADMIN_DASHBOARD_BUSINESS" \
  --arg adminDashboardPatients "$ADMIN_DASHBOARD_PATIENTS" \
  --arg adminDashboardAcceptance "$ADMIN_DASHBOARD_ACCEPTANCE" \
  --arg frontRoot "$FRONT_ROOT" \
  --arg frontSlug "$FRONT_SLUG" \
  --arg frontRegister "$FRONT_REGISTER" \
  --arg frontBooking "$FRONT_BOOKING" \
  '{
    work:$work,
    testData:{slug:$slug, adminEmail:$adminEmail, doctorEmail:$doctorEmail, patientEmail:$patientEmail, businessId:$businessId, doctorUserId:$doctorUserId, patientId:$patientId, citaId:$citaId},
    checks:{
      adminCreated:$adminCode,
      adminLogin:{code:$loginCode, success:$loginOk, passwordExposed:$passwordExposed},
      businessConfig:{patchCode:$businessPatchCode, getCode:$businessGetCode, bookingTitle:$bookingTitle},
      doctorStaff:{createCode:$doctorCode, loginCode:$doctorLoginCode, loginSuccess:$doctorLoginOk, role:$doctorRole},
      patient:{createCode:$patientCode, doctorId:$patientDoctorId, loginCode:$patientLoginCode, loginSuccess:$patientLoginOk, loginDoctorId:$patientLoginDoctorId},
      appointment:{createCode:$citaCode, businessId:$citaBusinessId, listByBusinessCode:$citasBusinessCode, appearsInBusinessAgenda:$citaInBusiness},
      clinical:{anamnesisCode:$anamnesisCode, anamnesisGetCode:$anamnesisGetCode, consentCode:$consentCode, consentGetCode:$consentGetCode, consentRelacion:$consentRelacion, presupuestoCode:$presupuestoCode, presupuestosGetCode:$presupuestosGetCode, presupuestoInList:$presupuestoInList},
      adminOwnerDashboard:{code:$adminDashboardCode, business:$adminDashboardBusiness, patients:$adminDashboardPatients, acceptanceRate:$adminDashboardAcceptance},
      frontendRoutes:{root:$frontRoot, slug:$frontSlug, register:$frontRegister, booking:$frontBooking}
    }
  }'
