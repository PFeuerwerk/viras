import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si el usuario ya tiene sesión activa, redirigir inmediatamente según su rol
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Credenciales incorrectas o cuenta no activa.';
      }
    });
  }

  /**
   * Lógica de Redirección Inteligente (Brain Routing)
   * Redirige a cada usuario a su área de trabajo específica tras el login.
   */
  private redirectByRole(): void {
    const rawRole = this.authService.getUserRole()?.toUpperCase();
    const role = rawRole === 'TECSOFT' ? 'TECHSOFT' : rawRole;

    if (role === 'TECHSOFT') {
      // 1. SuperAdmin: Consola de gestión global de negocios
      this.router.navigate(['/techsoft/dashboard']);

    } else if (role === 'ADMIN') {
      // 2. Dueño de Negocio: Dashboard ejecutivo del tenant
      this.router.navigate(['/admin/dashboard']);

    } else if (role === 'DOCTOR') {
      // 3. Doctores: Acceso directo a la Agenda/Gestión de Citas
      this.router.navigate(['/admin/citas-master']);

    } else if (role === 'ASISTENTE') {
      // 4. Asistentes: Consola operativa propia de recepción y coordinación clínica
      this.router.navigate(['/asistente/dashboard']);

    } else if (role === 'PACIENTE') {
      // 5. Pacientes: Gestión de su perfil y sus propias citas
      this.router.navigate(['/paciente/dashboard']);

    } else {
      // Fallback de seguridad para roles no identificados
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
