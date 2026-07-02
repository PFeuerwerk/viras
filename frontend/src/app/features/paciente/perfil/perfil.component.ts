import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../../core/api.config';

import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxIntlTelInputModule],
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  userId: string = '';
  loading: boolean = false;
  mensaje: string = '';
  isPatient: boolean = false;

  // Configuración de telefonía
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Spain, CountryISO.UnitedStates, CountryISO.Mexico, CountryISO.Colombia];

  // Propiedades para la carga de imagen
  selectedAvatarFile: File | null = null;
  avatarPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const session = localStorage.getItem('viras_session');
    if (session) {
      const user = JSON.parse(session);
      this.userId = user.id;
      this.isPatient = user.rol === 'PACIENTE';
      this.loadUserDataFromBackend();
    }
  }

  private initForm(): void {
    this.perfilForm = this.fb.group({
      // 1. Datos de Acceso y Básicos
      email: [{ value: '', disabled: true }], // Email no suele editarse por seguridad
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      seguridad_social: [''],
      
      // 2. Contacto
      movil1: [null, [Validators.required]],
      movil2: [null],
      direccion: ['', [Validators.maxLength(255)]],
      ciudad: [''],
      avatar: [''],

      // 3. Info Opcional (Paciente)
      grupo_sanguineo: [''],
      estado_civil: [''],
      nombre_conyuge: [''],
      movil_conyuge: [null],
      discapacidad: [false],
      detalles_discapacidad: [''],
      consentimiento_email: [false],
      consentimiento_sms: [false],

      // 4. Tutor
      tutor_nombre: [''],
      tutor_parentesco: [''],
      tutor_direccion: [''],
      tutor_email: ['', [Validators.email]],
      tutor_movil: [null],
      tutor_es_responsable: [true]
    });
  }

  private loadUserDataFromBackend(): void {
    this.loading = true;
    this.http.get<any>(apiUrl(`/usuarios/${this.userId}`)).subscribe({
      next: (user) => {
        const perfil = user.perfil_paciente || {};
        
        this.perfilForm.patchValue({
          email: user.email,
          nombres: user.nombres,
          apellidos: user.apellidos,
          fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString().split('T')[0] : '',
          genero: user.genero,
          seguridad_social: user.seguridad_social,
          movil1: user.movil1,
          movil2: user.movil2,
          direccion: user.direccion,
          avatar: user.avatar,
          
          // Info Paciente
          ciudad: perfil.ciudad,
          grupo_sanguineo: perfil.grupo_sanguineo,
          estado_civil: perfil.estado_civil,
          nombre_conyuge: perfil.nombre_conyuge,
          movil_conyuge: perfil.movil_conyuge,
          discapacidad: perfil.discapacidad,
          detalles_discapacidad: perfil.detalles_discapacidad,
          consentimiento_email: perfil.consentimiento_email,
          consentimiento_sms: perfil.consentimiento_sms,

          // Tutor
          tutor_nombre: perfil.tutor_nombre,
          tutor_parentesco: perfil.tutor_parentesco,
          tutor_direccion: perfil.tutor_direccion,
          tutor_email: perfil.tutor_email,
          tutor_movil: perfil.tutor_movil,
          tutor_es_responsable: perfil.tutor_es_responsable ?? true
        });

        if (user.avatar) {
          this.avatarPreview = user.avatar;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedAvatarFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
        this.perfilForm.patchValue({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.perfilForm.getRawValue();

    const updatedData = {
      ...formValue,
      movil1: formValue.movil1?.e164Number || formValue.movil1,
      movil2: formValue.movil2?.e164Number || formValue.movil2,
      movil_conyuge: formValue.movil_conyuge?.e164Number || formValue.movil_conyuge,
      tutor_movil: formValue.tutor_movil?.e164Number || formValue.tutor_movil
    };

    this.http.patch(apiUrl(`/usuarios/${this.userId}`), updatedData)
      .subscribe({
        next: (response: any) => {
          this.mensaje = 'Su expediente ha sido actualizado con éxito.';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/paciente/dashboard']), 2000);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.loading = false;
          alert('Error al guardar los cambios en el servidor.');
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/paciente/dashboard']);
  }
}
