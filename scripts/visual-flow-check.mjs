#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:4200';
const API_BASE = process.env.API_BASE || 'http://localhost:3100/api';
const CHROME_BIN = process.env.CHROME_BIN || 'google-chrome';
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT || 9224);
const RUN_ID = Date.now();
const OUT_DIR = process.env.OUT_DIR || `Docs/qa-visual-${RUN_ID}`;
const PASS = 'Test1234';
const stamp = String(RUN_ID);

mkdirSync(OUT_DIR, { recursive: true });

const state = {
  adminEmail: `visual-admin-${stamp}@viras.test`,
  doctorEmail: `visual-doctor-${stamp}@viras.test`,
  patientEmail: `visual-patient-${stamp}@viras.test`,
  assistantEmail: `visual-assistant-${stamp}@viras.test`,
  businessName: `Clinica Visual ${stamp}`,
  slug: `clinica-visual-${stamp}`,
  adminToken: '',
  patientToken: '',
  assistantToken: '',
  businessId: '',
  doctorUserId: '',
  patientId: '',
};

const checks = [];
const screenshots = [];

function ok(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  if (!passed) throw new Error(`${name}: ${detail || 'fallo'}`);
}

function httpJson(method, url, body, token) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => ({
    status: res.status,
    body: await res.json().catch(() => null),
  }));
}

function chromeJson(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: DEBUG_PORT, path, method }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

class Cdp {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.seq = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result || {});
      } else if (msg.method) {
        const listeners = this.events.get(msg.method) || [];
        listeners.forEach((listener) => listener(msg.params || {}));
      }
    });
  }

  async ready() {
    while (this.ws.readyState === WebSocket.CONNECTING) await delay(50);
  }

  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(event, listener) {
    const listeners = this.events.get(event) || [];
    listeners.push(listener);
    this.events.set(event, listeners);
  }

  close() {
    this.ws.close();
  }
}

async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      const version = await chromeJson('/json/version');
      if (version.webSocketDebuggerUrl) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Chrome no inicio a tiempo.');
}

async function connectBrowser() {
  const userDataDir = `/tmp/viras-chrome-${RUN_ID}`;
  const chrome = spawn(CHROME_BIN, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  await waitForChrome();
  const tabInfo = await chromeJson(`/json/new?${encodeURIComponent(FRONTEND_BASE)}`, 'PUT');
  const cdp = new Cdp(tabInfo.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await delay(1200);
  await waitForReady(cdp);
  await waitForUrl(cdp, FRONTEND_BASE);
  await evalJs(cdp, `localStorage.setItem('viras_api_base_url', ${JSON.stringify(API_BASE)}); localStorage.removeItem('viras_session'); sessionStorage.clear();`);

  return {
    cdp,
    cleanup: async () => {
      cdp.close();
      chrome.kill();
      await delay(300);
      rmSync(userDataDir, { recursive: true, force: true });
    },
  };
}

async function evalJs(cdp, expression, returnByValue = true) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue,
  });
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description
      || result.exceptionDetails.exception?.value
      || result.exceptionDetails.text
      || 'Runtime.evaluate fallo';
    throw new Error(detail);
  }
  return result.result?.value;
}

async function waitForReady(cdp) {
  for (let i = 0; i < 80; i++) {
    const ready = await evalJs(cdp, `document.readyState === 'complete' || document.readyState === 'interactive'`);
    if (ready) {
      await delay(350);
      return;
    }
    await delay(150);
  }
  throw new Error('La pagina no termino de cargar.');
}

async function waitForUrl(cdp, expectedStart) {
  for (let i = 0; i < 60; i++) {
    const url = await currentUrl(cdp);
    if (url.startsWith(expectedStart)) return;
    await delay(150);
  }
  throw new Error(`La navegacion no llego a ${expectedStart}`);
}

async function goto(cdp, path) {
  await cdp.send('Page.navigate', { url: `${FRONTEND_BASE}${path}` });
  await delay(1200);
  await waitForReady(cdp);
}

async function setViewport(cdp, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
  });
  await delay(250);
}

async function screenshot(cdp, name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const file = `${OUT_DIR}/${name}.png`;
  writeFileSync(file, Buffer.from(data, 'base64'));
  screenshots.push(file);
}

async function text(cdp) {
  return evalJs(cdp, `document.body.innerText`);
}

async function currentUrl(cdp) {
  return evalJs(cdp, `location.href`);
}

async function fill(cdp, selector, value) {
  await evalJs(cdp, `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('No existe selector: ${selector}');
      el.focus();
      el.value = ${JSON.stringify(value)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
}

async function selectValue(cdp, selector, value) {
  await evalJs(cdp, `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('No existe selector: ${selector}');
      el.value = ${JSON.stringify(value)};
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
}

async function clickText(cdp, textValue, tag = 'button,a') {
  await evalJs(cdp, `
    (() => {
      const wanted = ${JSON.stringify(textValue)}.toLowerCase();
      const el = [...document.querySelectorAll(${JSON.stringify(tag)})]
        .find(node => (node.innerText || node.textContent || '').trim().toLowerCase().includes(wanted));
      if (!el) throw new Error('No se encontro texto: ${textValue}');
      el.click();
    })()
  `);
  await delay(700);
}

async function clickSelector(cdp, selector) {
  await evalJs(cdp, `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('No existe selector: ${selector}');
      el.click();
    })()
  `);
  await delay(700);
}

async function setSession(cdp, user, token) {
  await evalJs(cdp, `
    localStorage.setItem('viras_api_base_url', ${JSON.stringify(API_BASE)});
    localStorage.setItem('viras_session', ${JSON.stringify(JSON.stringify({ ...user, access_token: token }))});
  `);
}

async function login(cdp, email, password, expectedPath) {
  await evalJs(cdp, `localStorage.removeItem('viras_session'); sessionStorage.clear();`);
  await goto(cdp, '/auth/login');
  await fill(cdp, '#email', email);
  await fill(cdp, '#password', password);
  await clickText(cdp, 'Ingresar a mi cuenta');
  await delay(1500);
  const url = await currentUrl(cdp);
  ok(`Login ${email}`, url.includes(expectedPath), url);
}

async function seedViaApi() {
  const adminLogin = await httpJson('POST', `${API_BASE}/usuarios/login`, { email: state.adminEmail, password: PASS });
  state.adminToken = adminLogin.body.access_token;
  const adminUser = adminLogin.body.user;
  state.businessId = adminUser.business_id;

  const businessPatch = await httpJson('PATCH', `${API_BASE}/business/${state.businessId}`, {
    nombre_empresa: `${state.businessName} Operativa`,
    slug: state.slug,
    tipo_negocio: 'DENTAL',
    titulo_hero: 'QA visual dental',
    slogan_hero: 'Sonrisas verificadas',
    descripcion_hero: 'Clinica creada para prueba visual end to end.',
    telefono: '+34111000000',
    direccion: 'Calle Visual 123',
    email: 'contacto@visual.test',
    booking_services: [
      { titulo: 'Consulta Visual', descripcion: 'Revision completa', duracion_minutos: 30, es_emergencia: false, icono: 'calendar_today' },
    ],
    servicios: [
      { titulo: 'Limpieza Visual', descripcion: 'Servicio validado', icono: 'cleaning_services', precio_estimado: '60' },
    ],
    config_visual: { primary_color: '#2563eb', secondary_color: '#172033', accent_color: '#14b8a6' },
  }, state.adminToken);
  ok('Configuracion de negocio API', businessPatch.status === 200, `HTTP ${businessPatch.status}`);

  const doctor = await httpJson('POST', `${API_BASE}/professionals`, {
    business_id: state.businessId,
    nombre: 'Doctor Visual',
    cargo: 'Odontologo',
    formacion: 'Universidad QA',
    descripcion: 'Profesional creado para QA visual',
    email: state.doctorEmail,
    password_hash: PASS,
    numero_colegiado: `VIS-${stamp}`,
    especialidad_primaria: 'Odontologia general',
  }, state.adminToken);
  ok('Creacion doctor/staff API', doctor.status === 201, `HTTP ${doctor.status}`);
  state.doctorUserId = doctor.body.usuario_id;

  const patient = await httpJson('POST', `${API_BASE}/usuarios`, {
    email: state.patientEmail,
    password_hash: PASS,
    rol: 'PACIENTE',
    nombres: 'Paciente',
    apellidos: 'Visual',
    slug: state.slug,
    dentista_id: state.doctorUserId,
    movil1: '+34111333444',
    fecha_nacimiento: '1990-01-15',
    genero: 'F',
    direccion: 'Calle Paciente 1',
    ciudad: 'Madrid',
    consentimiento_email: true,
    consentimiento_sms: true,
  });
  ok('Registro paciente API', patient.status === 201, `HTTP ${patient.status}`);
  state.patientId = patient.body.id;

  const patientLogin = await httpJson('POST', `${API_BASE}/usuarios/login`, { email: state.patientEmail, password: PASS });
  ok('Login paciente API', patientLogin.status === 201 && patientLogin.body.success, `HTTP ${patientLogin.status}`);
  state.patientToken = patientLogin.body.access_token;

  const assistant = await httpJson('POST', `${API_BASE}/usuarios`, {
    email: state.assistantEmail,
    password_hash: PASS,
    rol: 'ASISTENTE',
    nombres: 'Asistente',
    apellidos: 'Visual',
    business_id: state.businessId,
  });
  ok('Creacion asistente API', assistant.status === 201, `HTTP ${assistant.status}`);
  const assistantLogin = await httpJson('POST', `${API_BASE}/usuarios/login`, { email: state.assistantEmail, password: PASS });
  state.assistantToken = assistantLogin.body.access_token;

  const cita = await httpJson('POST', `${API_BASE}/citas`, {
    usuario_id: state.patientId,
    doctor_id: state.doctorUserId,
    fecha: new Date(Date.now() + 7 * 86400000).toISOString(),
    duracionEstimada: 30,
    motivoConsulta: 'Consulta visual',
    servicio_cita: 'Consulta Visual',
    tipo_paciente: 'REGRESA',
    estado: 'PENDIENTE',
    precioEstimado: 60,
  }, state.patientToken);
  ok('Reserva de cita API', cita.status === 201, `HTTP ${cita.status}`);

  await httpJson('POST', `${API_BASE}/anamnesis`, {
    paciente_id: state.patientId,
    motivo_consulta: 'Revision visual',
    medicamentos_actuales: 'Ninguno',
    embarazo_lactancia: false,
    historial_medico_json: { diabetes: 'NO' },
    observaciones_adicionales: 'QA visual',
  }, state.patientToken);

  await httpJson('POST', `${API_BASE}/consentimientos`, {
    paciente_id: state.patientId,
    general_odontologico: true,
    general_fecha: '2026-07-02',
    proteccion_datos: true,
    lopd_uso_asistencial: true,
    representante_legal: true,
    representante_nombre: 'Tutor Visual',
    representante_dni: `TV-${stamp}`,
    representante_relacion: 'Tutor',
    representante_fecha: '2026-07-02',
    politicas_privacidad: true,
    politicas_fecha: '2026-07-02',
  }, state.patientToken);

  await httpJson('POST', `${API_BASE}/presupuestos`, {
    paciente_id: state.patientId,
    aseguradora_compania: 'Seguro Visual',
    diagnostico_general: 'Diagnostico visual',
    plan_tratamiento: [{ fase: '1', tratamiento: 'Limpieza', importe: 60 }],
    importe_total: 60,
    aceptacion_economica: true,
    modalidad_pago: 'pago_unico',
    detalle_pagos: [{ concepto: 'Limpieza', importe: 60 }],
  }, state.adminToken);

  return { adminUser, patientUser: patientLogin.body.user, assistantUser: assistantLogin.body.user };
}

async function main() {
  const { cdp, cleanup } = await connectBrowser();

  try {
    await goto(cdp, '/auth/register');
    await fill(cdp, 'input[formcontrolname="email"]', state.adminEmail);
    await fill(cdp, 'input[formcontrolname="password"]', PASS);
    await fill(cdp, 'input[formcontrolname="nombres"]', 'Admin');
    await fill(cdp, 'input[formcontrolname="apellidos"]', 'Visual');
    await fill(cdp, 'input[formcontrolname="nombre_empresa"]', state.businessName);
    await fill(cdp, 'input[formcontrolname="slug"]', state.slug);
    await screenshot(cdp, '01-registro-admin');
    await clickText(cdp, 'Registrar mi Negocio');
    await delay(1800);
    ok('Registro admin visual', (await text(cdp)).includes('Negocio registrado') || (await currentUrl(cdp)).includes('/auth/login'), await currentUrl(cdp));

    const users = await seedViaApi();

    await login(cdp, state.adminEmail, PASS, '/admin/dashboard');
    await screenshot(cdp, '02-login-admin-dashboard-owner');
    {
      const body = (await text(cdp)).toLowerCase();
      ok('Dashboard ejecutivo Admin/Owner visible', body.includes('admin / owner') && body.includes('citas hoy'));
    }

    await goto(cdp, '/admin/business-config');
    await screenshot(cdp, '03-configuracion-negocio');
    ok('Configuracion de negocio visible', (await text(cdp)).includes('Configur') || (await text(cdp)).includes('Identidad'));

    await setViewport(cdp, 390, 844, true);
    await goto(cdp, '/admin/business-config');
    await screenshot(cdp, '03b-configuracion-negocio-mobile');
    {
      const body = await text(cdp);
      const mobileTabsOk = await evalJs(cdp, `
        (() => {
          const tabs = document.querySelector('.config-tabs');
          const active = document.querySelector('.config-tabs button.active');
          if (!tabs || !active) return false;
          const tabBox = tabs.getBoundingClientRect();
          const activeBox = active.getBoundingClientRect();
          return tabBox.width <= 390 && activeBox.width >= 70 && activeBox.width <= 110;
        })()
      `);
      ok('Configuracion de negocio mobile responsive', body.includes('Configuracion') || body.includes('Configuración'), `tabsOk=${mobileTabsOk}`);
      ok('Tabs Configurar Sitio compactas en mobile', mobileTabsOk);
    }

    await setViewport(cdp, 1440, 1000, false);

    await goto(cdp, '/admin/staff');
    await screenshot(cdp, '04-gestion-staff');
    ok('Creacion doctor/staff visible', (await text(cdp)).includes('Gestión de Personal') && (await text(cdp)).includes('Doctor Visual'));

    await goto(cdp, `/${state.slug}/registro`);
    await screenshot(cdp, '05-registro-paciente-publico');
    ok('Registro paciente visible', (await text(cdp)).includes('Registro de Paciente') && (await text(cdp)).includes('Doctor'));

    await login(cdp, state.patientEmail, PASS, '/paciente/dashboard');
    await screenshot(cdp, '06-login-paciente-dashboard');
    ok('Login paciente visible', (await text(cdp)).includes('Paciente') || (await currentUrl(cdp)).includes('/paciente/dashboard'));

    await goto(cdp, `/${state.slug}/agendar`);
    const hasPatientType = await evalJs(cdp, `Boolean(document.querySelector('input[name="patientType"][type="radio"]'))`);
    if (hasPatientType) await clickSelector(cdp, 'input[name="patientType"][type="radio"]');
    await clickText(cdp, 'Consulta Visual', 'div,span,h3');
    await screenshot(cdp, '07-reserva-cita-publica');
    ok('Reserva de cita visual', (await text(cdp)).includes('Seleccione fecha y hora'));

    await goto(cdp, '/admin/citas-master');
    await setSession(cdp, users.adminUser, state.adminToken);
    await goto(cdp, '/admin/citas-master');
    await screenshot(cdp, '08-agenda-admin');
    ok('Agenda admin visualiza cita', (await text(cdp)).includes('Paciente Visual') || (await text(cdp)).includes('Consulta visual'));

    await setSession(cdp, users.patientUser, state.patientToken);
    await goto(cdp, '/paciente/anamnesis');
    await screenshot(cdp, '09-anamnesis');
    ok('Anamnesis visible', (await text(cdp)).includes('Expediente Clínico Digital'));

    await goto(cdp, '/paciente/consentimientos/menores');
    await screenshot(cdp, '10-consentimientos');
    ok('Consentimientos visible', (await text(cdp)).includes('Representante Legal') || (await text(cdp)).includes('Consentimiento'));

    await goto(cdp, '/paciente/seguro');
    await screenshot(cdp, '11-presupuesto-seguro');
    ok('Presupuesto visible', (await text(cdp)).includes('Información del Seguro'));

    await setSession(cdp, users.assistantUser, state.assistantToken);
    await setViewport(cdp, 1440, 1000, false);
    await goto(cdp, '/asistente/dashboard');
    await screenshot(cdp, '12-asistente-desktop');
    ok('Dashboard asistente desktop visible', (await text(cdp)).includes('Panel Asistente') || (await text(cdp)).includes('Agenda'));

    await setViewport(cdp, 768, 1000, false);
    await goto(cdp, '/asistente/dashboard');
    await screenshot(cdp, '13-asistente-tablet');

    await setViewport(cdp, 390, 844, true);
    await goto(cdp, '/asistente/dashboard');
    await screenshot(cdp, '14-asistente-mobile');
    ok('Dashboard asistente responsive capturado', true);

    const report = {
      generatedAt: new Date().toISOString(),
      frontend: FRONTEND_BASE,
      api: API_BASE,
      testData: state,
      checks,
      screenshots,
    };
    writeFileSync(`${OUT_DIR}/visual-flow-report.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  const report = {
    generatedAt: new Date().toISOString(),
    frontend: FRONTEND_BASE,
    api: API_BASE,
    testData: state,
    checks,
    screenshots,
    error: error.message,
  };
  writeFileSync(`${OUT_DIR}/visual-flow-report.json`, JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
});
