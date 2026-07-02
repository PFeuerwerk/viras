import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // Importado para capturar parámetros de TechSoft
import { BusinessService } from '../../../core/services/business/business';
import { AuthService } from '../../../core/services/auth.service';
import { Business, BusinessConfigVisual } from '../../../core/models/business.model';

// Importación de constantes profesionales
import { DEFAULT_CONFIG_VISUAL } from './business-constants';

// SUB-COMPONENTES MODULARES (Arquitectura de Alta Calidad)
import { ScheduleManagerComponent } from './schedule-manager/schedule-manager';
import { ConfigGeneralComponent } from './components/config-general/config-general';
import { ConfigAboutComponent } from './components/config-about/config-about';
import { ConfigServicesComponent } from './components/config-services/config-services';
import { ConfigHistoryComponent } from './components/config-history/config-history';
import { ConfigTestimonialsComponent } from './components/config-testimonials/config-testimonials';
import { StaffMgmt } from '../staff-mgmt/staff-mgmt';

// Nuevo componente para la gestión de citas
import { ConfigBookingComponent } from './components/config-booking/config-booking';

@Component({
  selector: 'app-business-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScheduleManagerComponent,
    ConfigGeneralComponent,
    ConfigAboutComponent,
    ConfigServicesComponent,
    ConfigHistoryComponent,
    ConfigTestimonialsComponent,
    ConfigBookingComponent, // Registrado para su uso en el HTML
    StaffMgmt
  ],
  templateUrl: './business-config.html',
  styleUrl: './business-config.css'
})
export class BusinessConfigComponent implements OnInit {
  // Inicialización de objeto Business robusto para evitar errores de undefined en plantillas
  business: Business = {
    id: '',
    slug: '',
    tipo_negocio: 'OTROS',
    nombre_empresa: '',
    titulo_hero: '',
    slogan_hero: '',
    descripcion_hero: '',
    direccion: '',
    telefono: '',
    horario_texto: '',
    logo_url: '',
    google_maps_link: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    servicios: [],
    reviews: [],
    config_visual: { ...DEFAULT_CONFIG_VISUAL } as BusinessConfigVisual,
    seccion_que_hacemos: {
      titulo: '',
      introduccion: '',
      items: []
    },
    // Inicialización de la nueva propiedad para los tipos de cita
    booking_services: []
  };

  // Gestión de Pestañas
  activeTab:
    | 'general'
    | 'about'
    | 'services'
    | 'history'
    | 'design'
    | 'staff'
    | 'what-we-do'
    | 'booking-config'
    | 'testimonials' = 'general';

  isLoading = false;
  isSaving = false;
  message: { type: 'success' | 'error', text: string } | null = null;
  logoPreview: string | null = null;
  heroPreview: string | null = null;
  diffPreview: string | null = null;

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private route: ActivatedRoute // Inyectado para soporte multi-tenant global
  ) { }

  ngOnInit(): void {
    this.loadCurrentBusiness();
  }

  /**
   * Lógica de Carga Inteligente:
   * 1. Si hay un 'bId' en la URL, se carga ese negocio (Modo Soporte TechSoft).
   * 2. Si no, se carga el negocio del usuario logueado (Modo Admin estándar).
   */
  loadCurrentBusiness() {
    this.isLoading = true;

    // Capturamos el ID desde el parámetro de la URL o desde el token del usuario
    const urlBusinessId = this.route.snapshot.queryParamMap.get('bId');
    const authBusinessId = this.authService.getBusinessId();

    const businessId = urlBusinessId || authBusinessId;

    if (!businessId) {
      this.showNotification('error', 'No se encontró un negocio vinculado a su cuenta.');
      this.isLoading = false;
      return;
    }

    this.businessService.getBusinessById(businessId).subscribe({
      next: (data) => {
        // Mapeo exhaustivo para asegurar que no falten propiedades
        this.business = {
          ...data,
          id: data.id,
          servicios: Array.isArray(data.servicios) ? data.servicios : [],
          booking_services: Array.isArray(data.booking_services) ? data.booking_services : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          config_visual: data.config_visual || { ...DEFAULT_CONFIG_VISUAL },
          seccion_que_hacemos: data.seccion_que_hacemos || { titulo: '', introduccion: '', items: [] }
        };

        // Recuperación y Auto-Completado de la sección de Diferenciales (Why Choose Us)
        const wwd = this.business.seccion_que_hacemos;
        if (wwd) {
          if (!wwd.diferenciales_titulo) {
            wwd.diferenciales_titulo = 'Compromiso inquebrantable con la calidad';
          }
          if (!wwd.diferenciales_introduccion) {
            wwd.diferenciales_introduccion = `En ${this.business.nombre_empresa}, entendemos que cada detalle cuenta. Por eso, hemos optimizado cada etapa de nuestro servicio para que te sientas en las mejores manos.`;
          }
          if (!wwd.diferenciales_items || wwd.diferenciales_items.length === 0) {
            wwd.diferenciales_items = [
              { icono: 'verified_user', titulo: 'Tecnología Digital Avanzada', descripcion: 'Equipos de última generación para diagnósticos precisos.' },
              { icono: 'workspace_premium', titulo: 'Especialistas Certificados', descripcion: 'Profesionales con formación internacional constante.' },
              { icono: 'favorite', titulo: 'Atención Humana y Ética', descripcion: 'Priorizamos tu comodidad y tranquilidad en todo momento.' }
            ];
          }
        }

        // Sincronización de previsualizaciones
        this.logoPreview = data.logo_url || null;
        this.heroPreview = this.business.config_visual?.hero_image || null;
        this.diffPreview = this.business.seccion_que_hacemos?.diferenciales_imagen_url || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar negocio:', err);
        this.showNotification('error', 'Error al sincronizar con la base de datos.');
        this.isLoading = false;
      }
    });
  }

  setTab(tab:
    | 'general'
    | 'about'
    | 'services'
    | 'history'
    | 'design'
    | 'staff'
    | 'what-we-do'
    | 'booking-config'
    | 'testimonials'
  ) {
    this.activeTab = tab;
  }

  updateSchedule(newSchedule: string): void {
    this.business.horario_texto = newSchedule;
  }

  /**
   * Procesamiento de imágenes profesional con Redimensionamiento en el cliente
   */
  async onFileSelected(event: any, type: 'logo' | 'hero' | 'diff') {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const maxWidth = type === 'logo' ? 400 : 1920;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);

        if (type === 'logo') {
          this.logoPreview = base64;
          this.business.logo_url = base64;
        } else if (type === 'hero') {
          this.heroPreview = base64;
          if (this.business.config_visual) {
            this.business.config_visual.hero_image = base64;
          }
        } else if (type === 'diff') {
          this.diffPreview = base64;
          if (this.business.seccion_que_hacemos) {
            this.business.seccion_que_hacemos.diferenciales_imagen_url = base64;
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onAddService() {
    this.business.servicios = [...(this.business.servicios || []), {
      titulo: '', descripcion: '', icono: 'dentist-chair.png'
    }];
  }

  onRemoveService(index: number) {
    this.business.servicios = this.business.servicios?.filter((_, i) => i !== index);
  }

  onIconSelected(event: { index: number, icon: string }) {
    if (this.business.servicios) {
      this.business.servicios[event.index].icono = event.icon;
    }
  }

  // Métodos para la sección "Qué Hacemos"
  onAddWhatWeDoItem() {
    if (!this.business.seccion_que_hacemos) {
      this.business.seccion_que_hacemos = { titulo: '', introduccion: '', items: [] };
    }
    this.business.seccion_que_hacemos.items.push({
      nombre: '',
      descripcion: '',
      icono: 'check_circle'
    });
  }

  onRemoveWhatWeDoItem(index: number) {
    this.business.seccion_que_hacemos?.items.splice(index, 1);
  }

  // Métodos para la sección "Diferenciales"
  onAddDiferencialItem() {
    if (!this.business.seccion_que_hacemos) {
      this.business.seccion_que_hacemos = { titulo: '', introduccion: '', items: [] };
    }
    if (!this.business.seccion_que_hacemos.diferenciales_items) {
      this.business.seccion_que_hacemos.diferenciales_items = [];
    }
    this.business.seccion_que_hacemos.diferenciales_items.push({
      titulo: '',
      descripcion: '',
      icono: 'star'
    });
  }

  onRemoveDiferencialItem(index: number) {
    this.business.seccion_que_hacemos?.diferenciales_items?.splice(index, 1);
  }

  /**
   * Persistencia de Datos en el Backend (Multi-tenant)
   */
  saveConfig() {
    if (!this.business.id) {
      this.showNotification('error', 'ID de negocio no detectado.');
      return;
    }

    this.isSaving = true;

    // Construcción de Payload limpio incluyendo la nueva sección de booking_services
    const cleanPayload = {
      nombre_empresa: this.business.nombre_empresa,
      tipo_negocio: this.business.tipo_negocio,
      slug: this.business.slug,
      titulo_hero: this.business.titulo_hero,
      slogan_hero: this.business.slogan_hero,
      descripcion_hero: this.business.descripcion_hero,
      direccion: this.business.direccion,
      telefono: this.business.telefono,
      horario_texto: this.business.horario_texto,
      logo_url: this.business.logo_url,
      google_maps_link: this.business.google_maps_link,
      facebook_url: this.business.facebook_url,
      instagram_url: this.business.instagram_url,
      twitter_url: this.business.twitter_url,
      linkedin_url: this.business.linkedin_url,
      config_visual: this.business.config_visual,
      seccion_que_hacemos: this.business.seccion_que_hacemos,
      servicios: this.business.servicios?.map(s => ({
        titulo: s.titulo,
        descripcion: s.descripcion,
        icono: s.icono
      })),
      booking_services: this.business.booking_services?.map(b => ({
        titulo: b.titulo,
        descripcion: b.descripcion,
        duracion_minutos: b.duracion_minutos,
        es_emergencia: b.es_emergencia,
        icono: b.icono
      })),
      reviews: this.business.reviews?.map(r => ({
        id: r.id,
        nombre_cliente: r.nombre_cliente,
        comentario: r.comentario,
        puntuacion: r.puntuacion,
        foto_url: r.foto_url,
        verificado: r.verificado,
        activo: r.activo
      }))
    };

    this.businessService.updateBusiness(this.business.id, cleanPayload).subscribe({
      next: () => {
        this.showNotification('success', 'Configuración guardada correctamente.');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.showNotification('error', 'No se pudieron guardar los cambios.');
        this.isSaving = false;
      }
    });
  }

  private showNotification(type: 'success' | 'error', text: string) {
    this.message = { type, text };
    setTimeout(() => this.message = null, 3000);
  }

  // Método auxiliar para navegación
  viewPublicSite() {
    if (this.business.slug) {
      window.open(`/${this.business.slug}`, '_blank');
    }
  }
}