import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../../../core/services/auth.service';
import { PlaceholderService } from '../../placeholder/services/placeholder.service';
import { Business } from '../../../core/models/business.model';
import { apiUrl } from '../../../core/api.config';

@Component({
  selector: 'app-consentimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './consentimientos.component.html'
})
export class ConsentimientosComponent implements OnInit {
  consentForm!: FormGroup;
  type: string = '';
  title: string = '';
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  currentUser: Usuario | null = null;
  businessData: Business | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private plService: PlaceholderService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBusinessData();
    
    this.route.params.subscribe(params => {
      this.type = params['type'];
      this.updateContent();
      this.initForm();
      this.loadExistingData();
    });
  }

  private loadBusinessData(): void {
    const slug = this.currentUser?.slug || 'clinica-dental-pro';
    
    this.plService.loadInitialData(slug).subscribe(data => {
        // Fallback para datos de la clínica si están vacíos en DB (Para asegurar profesionalidad inmediata)
        if (data && data.slug === 'clinica-dental-pro') {
          if (!data.cif) data.cif = 'B-12345678';
          if (!data.direccion || data.direccion.includes('TechSoft')) data.direccion = 'Calle de la Innovación, 12, 28001 Madrid';
          if (!data.telefono || data.telefono.includes('+00')) data.telefono = '+34 912 345 678';
          if (!data.email) data.email = 'contacto@clinicadentalpro.com';
          if (!data.delegado_datos) data.delegado_datos = 'D. Julián García (DPD Externo)';
        }
        this.businessData = data;
      });
    }

  private updateContent(): void {
    switch (this.type) {
      case 'general':
        this.title = 'Consentimiento General Odontológico';
        break;
      case 'anestesia':
        this.title = 'Consentimiento de Anestesia y Sedación';
        break;
      case 'lopd':
        this.title = 'Protección de Datos y Uso de Imágenes';
        break;
      case 'menores':
        this.title = 'Consentimiento para Menores / Representantes';
        break;
      case 'privacidad':
        this.title = 'Políticas de Privacidad';
        break;
      default:
        this.title = 'Consentimiento Legal';
    }
  }

  private initForm(): void {
    const controls: any = {
      acepto: [false, Validators.requiredTrue],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      firma: ['']
    };

    if (this.type === 'menores') {
      controls['representante_nombre'] = ['', Validators.required];
      controls['representante_dni'] = ['', Validators.required];
      controls['representante_relacion'] = ['', Validators.required];
    }

    if (this.type === 'lopd') {
      controls['lopd_uso_asistencial'] = [false];
      controls['lopd_uso_docente'] = [false];
      controls['lopd_uso_publicitario'] = [false];
      controls['lopd_uso_antes_despues'] = [false];
    }

    if (this.type === 'anestesia') {
      controls['anestesia_local_auth'] = [false];
      controls['anestesia_sedacion_auth'] = [false];
      controls['anestesia_salud_decl'] = [false];
    }

    this.consentForm = this.fb.group(controls);
  }

  private loadExistingData(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.http.get<any>(apiUrl(`/consentimientos/${this.currentUser.id}`)).subscribe({
      next: (data) => {
        if (data) {
          const patch: any = {};
          if (this.type === 'general') {
             patch.acepto = data.general_odontologico;
             patch.fecha = data.general_fecha?.split('T')[0];
          } else if (this.type === 'anestesia') {
             patch.acepto = data.anestesia_sedacion;
             patch.anestesia_local_auth = data.anestesia_local_auth;
             patch.anestesia_sedacion_auth = data.anestesia_sedacion_auth;
             patch.anestesia_salud_decl = data.anestesia_salud_decl;
             patch.fecha = data.anestesia_fecha?.split('T')[0];
          } else if (this.type === 'lopd') {
             patch.acepto = data.proteccion_datos;
             patch.lopd_uso_asistencial = data.lopd_uso_asistencial;
             patch.lopd_uso_docente = data.lopd_uso_docente;
             patch.lopd_uso_publicitario = data.lopd_uso_publicitario;
             patch.lopd_uso_antes_despues = data.lopd_uso_antes_despues;
             patch.fecha = data.lopd_fecha?.split('T')[0];
          } else if (this.type === 'menores') {
             patch.acepto = data.representante_legal;
             patch.representante_nombre = data.representante_nombre;
             patch.representante_dni = data.representante_dni;
             patch.representante_relacion = data.representante_relacion;
             patch.fecha = data.representante_fecha?.split('T')[0];
          } else if (this.type === 'privacidad') {
             patch.acepto = data.politicas_privacidad;
             patch.fecha = data.politicas_fecha?.split('T')[0];
          }
          this.consentForm.patchValue(patch);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit(): void {
    if (this.consentForm.invalid) return;

    this.isSaving = true;
    const formVal = this.consentForm.value;
    
    const payload: any = {
      paciente_id: this.currentUser?.id
    };

    if (this.type === 'general') {
      payload.general_odontologico = formVal.acepto;
      payload.general_fecha = formVal.fecha;
    } else if (this.type === 'anestesia') {
      payload.anestesia_sedacion = formVal.acepto;
      payload.anestesia_local_auth = formVal.anestesia_local_auth;
      payload.anestesia_sedacion_auth = formVal.anestesia_sedacion_auth;
      payload.anestesia_salud_decl = formVal.anestesia_salud_decl;
      payload.anestesia_fecha = formVal.fecha;
    } else if (this.type === 'lopd') {
      payload.proteccion_datos = formVal.acepto;
      payload.lopd_uso_asistencial = formVal.lopd_uso_asistencial;
      payload.lopd_uso_docente = formVal.lopd_uso_docente;
      payload.lopd_uso_publicitario = formVal.lopd_uso_publicitario;
      payload.lopd_uso_antes_despues = formVal.lopd_uso_antes_despues;
      payload.lopd_fecha = formVal.fecha;
    } else if (this.type === 'menores') {
      payload.representante_legal = formVal.acepto;
      payload.representante_nombre = formVal.representante_nombre;
      payload.representante_dni = formVal.representante_dni;
      payload.representante_relacion = formVal.representante_relacion;
      payload.representante_fecha = formVal.fecha;
    } else if (this.type === 'privacidad') {
      payload.politicas_privacidad = formVal.acepto;
      payload.politicas_fecha = formVal.fecha;
    }

    this.http.post(apiUrl('/consentimientos'), payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Documento guardado y firmado correctamente.';
        setTimeout(() => this.router.navigate(['/paciente/dashboard']), 2000);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Error al guardar el documento legal.';
      }
    });
  }

  printPage(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/paciente/dashboard']);
  }
}
