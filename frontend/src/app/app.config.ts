import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimiza el rendimiento agrupando eventos de detección de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configura las rutas y permite inyectar parámetros de URL como @Input()
    provideRouter(routes, withComponentInputBinding()),

    // Habilita el cliente HTTP para futuras peticiones a tu Backend (NestJS)
    provideHttpClient(withInterceptors([authInterceptor])),

    // CAMBIO PROFESIONAL: Se invoca explícitamente con 'animations' 
    // para cumplir con la nueva firma de la función y eliminar el aviso ts(6387)
    provideAnimations()
  ]
};
