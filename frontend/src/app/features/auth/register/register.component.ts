import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business/business';
import { apiUrl } from '../../../core/api.config';

import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat
} from 'ngx-intl-tel-input';

interface DoctorOption {
  id: string;
  nombres: string;
  apellidos: string;
  email?: string;
  especialidad?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxIntlTelInputModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  isLoadingDoctors = false;
  errorMessage = '';
  successMessage = '';

  // Configuración de modo: ¿Es registro de Admin global o de Paciente en un negocio?
  isPatientRegistration = false;
  currentBusinessId: string | null = null;
  currentBusinessSlug: string | null = null;
  businessName: string = '';

  doctors: DoctorOption[] = [];

  // Configuración de Teléfono Internacional
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Spain, CountryISO.UnitedStates, CountryISO.Mexico, CountryISO.Colombia];

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private businessService: BusinessService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkRegistrationMode();
  }

  /**
   * Detecta si venimos de una URL de negocio (slug) para activar el modo PACIENTE.
   */
  private checkRegistrationMode(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.isPatientRegistration = true;
      this.currentBusinessSlug = slug;

      this.businessService.getBusinessBySlug(slug).subscribe({
        next: (business) => {
          this.currentBusinessId = business.id || null;
          this.businessName = business.nombre_empresa;
          this.initForm();
          this.loadDoctors();
        },
        error: () => {
          this.initForm();
        }
      });
    } else {
      this.initForm();
    }
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      // 1. DATOS OBLIGATORIOS (Core)
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      movil1: [null, this.isPatientRegistration ? [Validators.required] : []],
      fecha_nacimiento: ['', this.isPatientRegistration ? [Validators.required] : []],
      genero: ['', this.isPatientRegistration ? [Validators.required] : []],
      seguridad_social: [''], // Se ha pasado a opcional para evitar bloqueos

      // 2. ASIGNACIÓN DE DOCTOR (Modo Paciente)
      dentista_id: ['', this.isPatientRegistration ? [Validators.required] : []],

      // 3. INFORMACIÓN OPCIONAL (Solo Paciente)
      grupo_sanguineo: [''],
      estado_civil: [''],
      direccion: [''],
      ciudad: [''],
      movil2: [null],
      nombre_conyuge: [''],
      movil_conyuge: [null],
      discapacidad: [false],
      detalles_discapacidad: [''],
      consentimiento_email: [false],
      consentimiento_sms: [false],

      // 4. TUTOR LEGAL / RESPONSABLE
      tutor_nombre: [''],
      tutor_parentesco: [''],
      tutor_direccion: [''],
      tutor_email: ['', [Validators.email]],
      tutor_movil: [null],
      tutor_es_responsable: [true],

      // 5. DATOS DE NEGOCIO (Solo Admin)
      nombre_empresa: [this.businessName, this.isPatientRegistration ? [] : [Validators.required, Validators.minLength(3)]],
      slug: ['', this.isPatientRegistration ? [] : [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],

      rol: [this.isPatientRegistration ? 'PACIENTE' : 'ADMIN']
    });

    // Generador de slug solo para modo ADMIN
    if (!this.isPatientRegistration) {
      this.registerForm.get('nombre_empresa')?.valueChanges.subscribe(value => {
        if (value) {
          const generatedSlug = value.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim()
            .replace(/[^a-z0-9 ]/g, '')
            .replace(/\s+/g, '-');

          this.registerForm.get('slug')?.patchValue(generatedSlug, { emitEvent: false });
        }
      });
    }
  }

  private loadDoctors(): void {
    if (!this.isPatientRegistration || !this.currentBusinessId) return;

    this.isLoadingDoctors = true;

    this.http.get<DoctorOption[]>(apiUrl(`/usuarios/public/business/${this.currentBusinessId}/doctors`)).subscribe({
      next: (doctores) => {
        this.doctors = doctores;

        if (this.doctors.length === 1) {
          this.registerForm.get('dentista_id')?.setValue(this.doctors[0].id);
        }

        this.isLoadingDoctors = false;
      },
      error: () => {
        this.doctors = [];
        this.isLoadingDoctors = false;
      }
    });
  }

  get f() { return this.registerForm.controls; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;

    const payload: any = {
      email: formValue.email,
      password_hash: formValue.password,
      rol: formValue.rol,
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      movil1: formValue.movil1?.e164Number || '',
      movil2: formValue.movil2?.e164Number || '',
      fecha_nacimiento: formValue.fecha_nacimiento,
      genero: formValue.genero,
      seguridad_social: formValue.seguridad_social,
      direccion: formValue.direccion,
      
      // Opcionales
      grupo_sanguineo: formValue.grupo_sanguineo,
      ciudad: formValue.ciudad,
      estado_civil: formValue.estado_civil,
      nombre_conyuge: formValue.nombre_conyuge,
      movil_conyuge: formValue.movil_conyuge?.e164Number || '',
      discapacidad: formValue.discapacidad,
      detalles_discapacidad: formValue.detalles_discapacidad,
      consentimiento_email: formValue.consentimiento_email,
      consentimiento_sms: formValue.consentimiento_sms,

      // Tutor
      tutor_nombre: formValue.tutor_nombre,
      tutor_parentesco: formValue.tutor_parentesco,
      tutor_direccion: formValue.tutor_direccion,
      tutor_email: formValue.tutor_email,
      tutor_movil: formValue.tutor_movil?.e164Number || '',
      tutor_es_responsable: formValue.tutor_es_responsable,
    };

    // Si es registro de negocio (ADMIN)
    if (!this.isPatientRegistration) {
      payload.nombre_empresa = formValue.nombre_empresa;
      payload.slug = formValue.slug;
    } else {
      payload.slug = this.currentBusinessSlug;
      payload.dentista_id = formValue.dentista_id;
    }

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = this.isPatientRegistration
          ? `¡Registro completado! Bienvenido a ${this.businessName}.`
          : '¡Negocio registrado con éxito!';

        setTimeout(() => {
          if (this.isPatientRegistration) {
            this.router.navigate(['/auth/login']);
          } else {
            this.router.navigate(['/admin/business-config']);
          }
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;

        if (err.status === 409) {
          this.errorMessage = 'El correo electrónico ya está registrado en el sistema.';
        } else {
          this.errorMessage = err.message || 'Error al completar el registro.';
        }
      }
    });
  }
}
