import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de Autenticación de Clase Mundial
 * Gestiona el acceso estricto para los 5 roles del ecosistema SaaS.
 */
const validateAccess: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificación de Sesión Activa
  if (!authService.isLoggedIn()) {
    console.warn('[Guard] Sesión no detectada. Redirigiendo al Login.');
    router.navigate(['/auth/login']);
    return false;
  }

  // 2. Extracción de Contexto de Usuario
  const userRole = authService.getUserRole().toUpperCase();
  const businessId = authService.getBusinessId();
  const expectedRoles = route.data['roles'] as Array<string>;

  // 3. Validación de Autorización por Rol (RBAC)
  if (expectedRoles && expectedRoles.length > 0) {
    // Normalizamos roles esperados para evitar fallos por casing o naming antiguo
    const normalizedExpected = expectedRoles.map(r =>
      r.toUpperCase() === 'TECSOFT' ? 'TECHSOFT' : r.toUpperCase()
    );

    if (!normalizedExpected.includes(userRole)) {
      console.error(`[Guard] Acceso Prohibido. Rol ${userRole} no autorizado para esta zona.`);

      // Brain Routing: Redirección de seguridad al "Home" de cada rol
      if (userRole === 'TECHSOFT') {
        router.navigate(['/techsoft/dashboard']);
      } else if (userRole === 'ADMIN') {
        router.navigate(['/admin/dashboard']);
      } else if (userRole === 'DOCTOR') {
        router.navigate(['/admin/citas-master']);
      } else if (userRole === 'ASISTENTE') {
        router.navigate(['/asistente/dashboard']);
      } else if (userRole === 'PACIENTE') {
        router.navigate(['/paciente/dashboard']);
      } else {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return false;
    }

    // 4. Validación de Integridad de Datos (Tenant Context)
    // El SuperAdmin es global (sin business_id). 
    // ADMIN, DOCTOR y ASISTENTE requieren obligatoriamente un business_id para operar.
    const businessRoles = ['ADMIN', 'DOCTOR', 'ASISTENTE'];
    if (businessRoles.includes(userRole) && !businessId) {
      console.warn(`[Guard] El usuario ${userRole} no tiene un negocio vinculado.`);
      router.navigate(['/auth/login']);
      return false;
    }
  }

  return true; // Acceso concedido: El usuario cumple con todos los requisitos.
};

export const authGuard: CanActivateFn = validateAccess;
export const authChildGuard: CanActivateChildFn = validateAccess;
