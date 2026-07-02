import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { Router } from '@angular/router';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CitasService } from '../../../../core/services/citas/citas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CitaModalComponent } from './cita-modal/cita-modal.component';
import { Cita } from '../../../../core/models/cita.model';
import { HttpClient } from '@angular/common/http';
import { ProfessionalsService, Professional } from '../../../../core/services/professionals/professionals';
import { apiUrl } from '../../../../core/api.config';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, CitaModalComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  userIdActual: string | null = null;
  pacienteIdActual: string | null = null;
  doctorAsignadoId: string | null = null;
  businessIdActual: string | null = null;

  isMobile = window.innerWidth < 768;
  currentTitle = '';

  isLoadingDoctor = false;
  isModalOpen = false;
  selectedDateForModal = '';

  pendingBookingData: any = null;

  userName: string = '';
  userRole: string = '';
  userAvatar: string = '';

  doctors: Professional[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    weekends: true,
    headerToolbar: window.innerWidth < 768 ? false : {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoy', month: 'Mes', week: 'Sem.', day: 'Día'
    },
    locale: 'es',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:15:00',
    slotLabelInterval: '01:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short'
    },
    expandRows: true,
    slotEventOverlap: false,
    allDaySlot: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    height: 'auto',
    handleWindowResize: true,
    aspectRatio: 1.35,

    datesSet: (arg) => {
      this.currentTitle = arg.view.title;
    },

    // Configuración responsiva dinámica
    windowResize: (arg) => {
      this.updateResponsiveOptions(arg.view.calendar);
    },

    selectAllow: (selectInfo) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const day = selectInfo.start.getDay();
      return selectInfo.start >= now && day !== 0 && day !== 6;
    },

    dayCellClassNames: (arg) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const day = arg.date.getDay();

      if (arg.date < now || day === 0 || day === 6) {
        return ['fc-day-disabled'];
      }

      return [];
    },

    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  constructor(
    private citasService: CitasService,
    private authService: AuthService,
    private http: HttpClient,
    private profService: ProfessionalsService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.fetchCitas();
    this.resolveDoctorAsignado();
    this.checkPendingBooking();
    this.loadDoctors();
    
    // Ajuste inicial de responsividad
    setTimeout(() => {
      const calendarApi = this.calendarComponent?.getApi();
      if (calendarApi) this.updateResponsiveOptions(calendarApi);
    }, 500);
  }

  private checkPendingBooking(): void {
    const saved = sessionStorage.getItem('pending_booking');

    if (saved) {
      try {
        this.pendingBookingData = JSON.parse(saved);
        console.log('Reserva pendiente detectada:', this.pendingBookingData);

        setTimeout(() => {
          this.calendarOptions = {
            ...this.calendarOptions,
            initialView: 'timeGridDay'
          };
        }, 100);
      } catch {
        sessionStorage.removeItem('pending_booking');
        this.pendingBookingData = null;
      }
    }
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userIdActual = user.id || null;
      this.userName = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
      this.userRole = user.rol || 'PACIENTE';
      this.userAvatar = (user as any).avatar || '';
      this.businessIdActual = user.business_id || null;

      if (this.userRole === 'PACIENTE') {
        this.pacienteIdActual = user.id || null;
      }
    } else {
      this.logout();
    }
  }

  private resolveDoctorAsignado(): void {
    this.isLoadingDoctor = true;

    const doctorFromSession = this.authService.getAssignedDoctorId();

    if (doctorFromSession) {
      this.doctorAsignadoId = doctorFromSession;
      this.isLoadingDoctor = false;
      return;
    }

    this.obtenerDoctorDesdePaciente();
  }

  private obtenerDoctorDesdePaciente(): void {
    if (!this.pacienteIdActual) {
      this.doctorAsignadoId = null;
      this.isLoadingDoctor = false;
      return;
    }

    this.http.get<any>(apiUrl(`/usuarios/${this.pacienteIdActual}`)).subscribe({
      next: (paciente) => {
        this.doctorAsignadoId =
          paciente?.doctor_id ||
          paciente?.doctorId ||
          paciente?.profesional_id ||
          paciente?.professional_id ||
          paciente?.perfil_paciente?.dentista_id ||
          null;

        this.isLoadingDoctor = false;
      },
      error: (err) => {
        console.error('Error obteniendo doctor asignado del paciente:', err);
        this.doctorAsignadoId = null;
        this.isLoadingDoctor = false;
      }
    });
  }

  private loadDoctors(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.business_id) return;

    this.profService.getProfessionalsByBusiness(user.business_id).subscribe({
      next: (docs) => this.doctors = docs,
      error: (err) => console.error('Error cargando doctores:', err)
    });
  }

  private updateResponsiveOptions(calendarApi: any): void {
    this.isMobile = window.innerWidth < 768;
    this.currentTitle = calendarApi.view.title;
    
    if (this.isMobile) {
      calendarApi.setOption('headerToolbar', false);
    } else {
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      });
    }

    calendarApi.setOption('buttonText', {
      today: 'Hoy', month: 'Mes', week: 'Sem.', day: 'Día'
    });
  }

  // Métodos para Toolbar Personalizado
  navPrev(): void { this.calendarComponent.getApi().prev(); this.currentTitle = this.calendarComponent.getApi().view.title; }
  navNext(): void { this.calendarComponent.getApi().next(); this.currentTitle = this.calendarComponent.getApi().view.title; }
  navToday(): void { this.calendarComponent.getApi().today(); this.currentTitle = this.calendarComponent.getApi().view.title; }
  changeView(view: string): void { this.calendarComponent.getApi().changeView(view); this.currentTitle = this.calendarComponent.getApi().view.title; }

  fetchCitas(): void {
    this.citasService.getCitas().subscribe({
      next: (citas) => {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: citas.map(cita => ({
            id: cita.id,
            title: cita.motivoConsulta || 'Ocupado',
            start: cita.fecha,
            end: this.addMinutes(cita.fecha, cita.duracionEstimada || 30),
            backgroundColor: cita.estado === 'PENDIENTE' ? '#f39c12' : '#2563eb',
            borderColor: 'transparent',
          }))
        };
      },
      error: (err: any) => console.error('Error cargando agenda:', err)
    });
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const calendarApi = selectInfo.view.calendar;

    if (selectInfo.view.type === 'dayGridMonth') {
      calendarApi.gotoDate(selectInfo.start);
      calendarApi.changeView('timeGridDay');
      calendarApi.unselect();
      return;
    }

    if (!this.pacienteIdActual) {
      alert('No se pudo identificar su sesión de paciente. Por favor, inicie sesión nuevamente.');
      calendarApi.unselect();
      return;
    }

    if (this.isLoadingDoctor) {
      alert('Estamos preparando la agenda médica. Intente nuevamente en unos segundos.');
      calendarApi.unselect();
      return;
    }

    if (!this.doctorAsignadoId) {
      alert('No se encontró un doctor asignado a su perfil. Contacte con la clínica.');
      calendarApi.unselect();
      return;
    }

    this.selectedDateForModal = selectInfo.startStr.slice(0, 16);
    this.isModalOpen = true;
    calendarApi.unselect();
  }

  handleEventClick(clickInfo: EventClickArg): void {
    // Implementar ver detalle si fuera necesario
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  handleSaveCita(citaCreada: Cita): void {
    this.isModalOpen = false;
    this.fetchCitas();
    sessionStorage.removeItem('pending_booking');

    alert('¡Cita agendada con éxito! Recibirá un correo de confirmación pronto.');
    this.router.navigate(['/paciente/mis-citas']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  volver(): void {
    this.router.navigate(['/paciente/dashboard']);
  }

  private addMinutes(date: Date | string, minutes: number): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + (minutes || 30));
    return d.toISOString();
  }
}
