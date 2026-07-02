import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/guards/auth-guard';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout';
import { PatientLayoutComponent } from './shared/layouts/patient-layout/patient-layout';

export const routes: Routes = [
    // --- 1. REDIRECCIÓN INICIAL ---
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'clinica-dental-pro'
    },

    // --- 2. SECCIÓN AUTH GLOBAL ---
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },

    // --- 3. DASHBOARD PACIENTE (Protegido con Layout Maestro) ---
    {
        path: 'paciente',
        component: PatientLayoutComponent,
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        data: { roles: ['PACIENTE'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/paciente/dashboard/paciente-dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'calendar',
                loadComponent: () => import('./features/paciente/dashboard/calendar/calendar').then(m => m.CalendarComponent)
            },
            {
                path: 'perfil',
                loadComponent: () => import('./features/paciente/perfil/perfil.component').then(m => m.PerfilComponent)
            },
            {
                path: 'mis-citas',
                loadComponent: () => import('./features/paciente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent)
            },
            {
                path: 'anamnesis',
                loadComponent: () => import('./features/paciente/anamnesis/anamnesis.component').then(m => m.AnamnesisComponent)
            },
            {
                path: 'consentimientos/:type',
                loadComponent: () => import('./features/paciente/consentimientos/consentimientos.component').then(m => m.ConsentimientosComponent)
            },
            {
                path: 'seguro',
                loadComponent: () => import('./features/paciente/seguros/informacion-seguro.component').then(m => m.InformacionSeguroComponent)
            }
        ]
    },

    // --- 4. ÁREA ADMINISTRATIVA UNIFICADA (Layout Maestro) ---
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        children: [
            {
                path: 'admin/dashboard',
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./features/admin/dashboard/admin-owner-dashboard.component').then(m => m.AdminOwnerDashboardComponent)
            },
            {
                path: 'admin/business-config',
                data: { roles: ['ADMIN', 'DOCTOR', 'TECHSOFT'] },
                loadComponent: () => import('./features/admin/business-config/business-config').then(m => m.BusinessConfigComponent)
            },
            {
                path: 'admin/citas-master',
                data: { roles: ['ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT'] },
                loadComponent: () => import('./features/admin/citas-master/citas-master').then(m => m.CitasMasterComponent)
            },
            {
                path: 'asistente/dashboard',
                data: { roles: ['ASISTENTE'] },
                loadComponent: () => import('./features/asistente/dashboard/asistente-dashboard.component').then(m => m.AsistenteDashboardComponent)
            },
            {
                path: 'admin/staff',
                data: { roles: ['ADMIN', 'DOCTOR', 'TECHSOFT'] },
                loadComponent: () => import('./features/admin/staff-mgmt/staff-mgmt').then(m => m.StaffMgmt)
            },
            {
                path: 'techsoft/dashboard',
                data: { roles: ['TECHSOFT'] },
                loadComponent: () => import('./features/tecsoft/dashboard/tecsoft-dashboard.component').then(m => m.TecsoftDashboardComponent)
            }
        ]
    },

    // --- 5. SECCIÓN PÚBLICA DINÁMICA (Slugs) ---
    {
        path: ':slug',
        children: [
            {
                path: '',
                loadComponent: () => import('./features/placeholder/placeholder').then(m => m.Placeholder),
            },
            {
                path: 'registro',
                loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'agendar',
                loadComponent: () => import('./features/placeholder/pages/booking/booking').then(m => m.BookingComponent)
            }
        ]
    },

    // --- 6. FALLBACK INTELIGENTE ---
    {
        path: '**',
        redirectTo: 'clinica-dental-pro'
    }
];
