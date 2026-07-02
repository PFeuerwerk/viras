import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfessionalsService, Professional } from '../../../core/services/professionals/professionals';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-staff-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-mgmt.html',
  styleUrl: './staff-mgmt.css',
})
export class StaffMgmt implements OnInit {
  staffList: Professional[] = [];
  isLoading = false;
  isSaving = false;

  professionalModel: Professional = this.getEmptyProfessionalModel();

  isEditing = false;
  editingId: string | null = null;
  showForm = false;
  imagePreview: string | null = null;

  constructor(
    private profService: ProfessionalsService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.detectBusinessContext();
  }

  private detectBusinessContext(): void {
    const urlBusinessId = this.route.snapshot.queryParamMap.get('bId');
    const authBusinessId = this.authService.getBusinessId();
    const bId = urlBusinessId || authBusinessId;

    if (bId) {
      console.log('Contexto de negocio detectado:', bId);
      this.professionalModel.business_id = bId;
      this.loadStaff(bId);
    } else {
      console.error('No se pudo determinar el ID del negocio.');
    }
  }

  loadStaff(businessId: string): void {
    this.isLoading = true;

    this.profService.getProfessionalsByBusiness(businessId).subscribe({
      next: (data: Professional[]) => {
        this.staffList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar staff:', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Reducimos el tamaño máximo para asegurar que el payload sea ligero (Calidad Mundial)
        const MAX_WIDTH = 400; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Aseguramos fondo blanco para JPEGs si hay transparencias
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Calidad 0.6 para optimizar espacio sin perder nitidez visual
        const base64 = canvas.toDataURL('image/jpeg', 0.6); 
        this.imagePreview = base64;
        this.professionalModel.foto_url = base64;

        console.log('Imagen optimizada (Base64) asignada al perfil.');
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  onAddDoctor(): void {
    this.resetForm();
    this.isEditing = false;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveProfessional(): void {
    if (!this.professionalModel.nombre || !this.professionalModel.cargo) {
      alert('Debe completar el nombre y el cargo del profesional.');
      return;
    }

    if (!this.isEditing) {
      if (!this.professionalModel.email || !this.professionalModel.password_hash) {
        alert('Para crear un doctor debe completar email y contraseña.');
        return;
      }

      if ((this.professionalModel.password_hash || '').length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    const currentBId = this.route.snapshot.queryParamMap.get('bId') || this.authService.getBusinessId();

    if (!currentBId) {
      alert('Error: No se detectó ID de negocio. Re-inicie sesión.');
      return;
    }

    this.professionalModel.business_id = currentBId;
    this.professionalModel.especialidad_primaria =
      this.professionalModel.especialidad_primaria || this.professionalModel.cargo || 'GENERAL';

    this.isSaving = true;

    console.log('Iniciando persistencia para:', this.isEditing ? 'Edición' : 'Creación');

    // Optimizamos el payload:
    const payload = { ...this.professionalModel };
    
    // 1. Si es edición y la foto no ha cambiado (sigue siendo una URL), no la re-enviamos
    if (this.isEditing && payload.foto_url && payload.foto_url.startsWith('http')) {
      delete payload.foto_url;
    }

    // 2. IMPORTANTE: Si la contraseña está vacía, la eliminamos para evitar errores de validación 
    // en el servidor (el DTO requiere min 6 caracteres si el campo está presente).
    if (!payload.password_hash || payload.password_hash.trim() === '') {
      delete payload.password_hash;
    }

    if (this.isEditing && this.editingId) {
      this.profService.updateProfessional(this.editingId, payload).subscribe({
        next: (updated) => {
          console.log('Profesional actualizado con éxito en el servidor.');
          const index = this.staffList.findIndex(s => s.id === this.editingId);
          if (index !== -1) this.staffList[index] = { ...updated };
          this.resetForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error crítico al actualizar profesional:', err);
          // Mostramos el mensaje real del servidor para diagnosticar
          alert('Error al guardar: ' + (err.message || 'Posiblemente la foto es muy grande o hay un problema de red.'));
          this.isSaving = false;
        }
      });
    } else {
      this.profService.createProfessional(payload).subscribe({
        next: (created: Professional) => {
          console.log('Nuevo profesional creado con éxito.');
          this.staffList.push(created);
          this.resetForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error crítico al crear profesional:', err);
          alert(err.message || 'Error al crear el perfil. Revise la consola para más detalles.');
          this.isSaving = false;
        }
      });
    }
  }

  editStaff(member: Professional): void {
    this.isEditing = true;
    this.editingId = member.id || null;
    this.professionalModel = {
      ...this.getEmptyProfessionalModel(),
      ...JSON.parse(JSON.stringify(member)),
      password_hash: ''
    };
    this.imagePreview = member.foto_url || null;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteStaff(id: string): void {
    if (confirm('¿Estás seguro de eliminar a este miembro del equipo?')) {
      this.profService.deleteProfessional(id).subscribe({
        next: () => {
          this.staffList = this.staffList.filter(s => s.id !== id);
          console.log('Miembro eliminado.');
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.imagePreview = null;
    this.professionalModel = this.getEmptyProfessionalModel();
  }

  private getEmptyProfessionalModel(): Professional {
    const bId = this.route?.snapshot?.queryParamMap?.get('bId') || this.authService?.getBusinessId?.();

    return {
      business_id: bId || '',
      nombre: '',
      cargo: '',
      formacion: '',
      descripcion: '',
      foto_url: '',
      orden: 0,
      linkedin_url: '',
      instagram_url: '',
      email: '',
      password_hash: '',
      telefono: '',
      movil1: '',
      direccion: '',
      numero_colegiado: '',
      especialidad_primaria: '',
      universidad_egreso: '',
      anos_experiencia: 0
    };
  }
}