import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, estado_cita } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import type { AuthUser } from '../auth/auth.types';

type AppointmentStatusCount = {
  estado: estado_cita;
  _count: { _all: number };
};

@Injectable()
export class AdminOwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(actor: AuthUser) {
    if (!actor.business_id) {
      throw new UnauthorizedException('El usuario administrador no tiene negocio asociado.');
    }

    const businessId = actor.business_id;
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    const startWeek = new Date(startToday);
    const day = startWeek.getDay() || 7;
    startWeek.setDate(startWeek.getDate() - day + 1);

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const appointmentValueFilter: Prisma.citasWhereInput = {
      business_id: businessId,
      estado: { in: [estado_cita.CONFIRMADA, estado_cita.COMPLETADA, estado_cita.FINALIZADA] },
    };

    const [
      business,
      todayStatusCounts,
      weeklyProduction,
      monthlyProduction,
      patientTotals,
      newPatientsToday,
      newPatientsMonth,
      staffTotals,
      budgetTotals,
      acceptedBudgetTotals,
      pendingBudgetTotals,
      professionalOccupancy,
      upcomingAppointments,
      recentPatients,
    ] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          nombre_empresa: true,
          slug: true,
          email: true,
          telefono: true,
          direccion: true,
          tipo_negocio: true,
        },
      }),
      this.prisma.citas.groupBy({
        by: ['estado'],
        where: {
          business_id: businessId,
          fecha: { gte: startToday, lt: endToday },
        },
        _count: { _all: true },
      }),
      this.prisma.citas.aggregate({
        where: {
          ...appointmentValueFilter,
          fecha: { gte: startWeek },
        },
        _sum: { precioEstimado: true },
      }),
      this.prisma.citas.aggregate({
        where: {
          ...appointmentValueFilter,
          fecha: { gte: startMonth, lt: nextMonth },
        },
        _sum: { precioEstimado: true },
      }),
      this.prisma.usuarios.count({
        where: { business_id: businessId, rol: 'PACIENTE', esta_activo: true },
      }),
      this.prisma.usuarios.count({
        where: {
          business_id: businessId,
          rol: 'PACIENTE',
          esta_activo: true,
          creado_en: { gte: startToday },
        },
      }),
      this.prisma.usuarios.count({
        where: {
          business_id: businessId,
          rol: 'PACIENTE',
          esta_activo: true,
          creado_en: { gte: startMonth, lt: nextMonth },
        },
      }),
      this.prisma.usuarios.groupBy({
        by: ['rol'],
        where: {
          business_id: businessId,
          rol: { in: ['ADMIN', 'DOCTOR', 'ASISTENTE'] },
          esta_activo: true,
        },
        _count: { _all: true },
      }),
      this.prisma.presupuestos_seguros.aggregate({
        where: {
          usuario: { business_id: businessId },
          creado_en: { gte: startMonth, lt: nextMonth },
        },
        _count: { _all: true },
        _sum: { importe_total: true },
      }),
      this.prisma.presupuestos_seguros.aggregate({
        where: {
          usuario: { business_id: businessId },
          aceptacion_economica: true,
          creado_en: { gte: startMonth, lt: nextMonth },
        },
        _count: { _all: true },
        _sum: { importe_total: true },
      }),
      this.prisma.presupuestos_seguros.aggregate({
        where: {
          usuario: { business_id: businessId },
          aceptacion_economica: false,
          creado_en: { gte: startMonth, lt: nextMonth },
        },
        _count: { _all: true },
        _sum: { importe_total: true },
      }),
      this.prisma.citas.groupBy({
        by: ['doctor_id'],
        where: {
          business_id: businessId,
          fecha: { gte: startWeek },
          estado: { not: estado_cita.CANCELADA },
        },
        _count: { _all: true },
        orderBy: { _count: { doctor_id: 'desc' } },
        take: 8,
      }),
      this.prisma.citas.findMany({
        where: {
          business_id: businessId,
          fecha: { gte: now },
          estado: { not: estado_cita.CANCELADA },
        },
        orderBy: { fecha: 'asc' },
        take: 6,
        select: {
          id: true,
          fecha: true,
          estado: true,
          servicio_cita: true,
          motivoConsulta: true,
          paciente: { select: { nombres: true, apellidos: true } },
          doctor: { select: { nombres: true, apellidos: true } },
        },
      }),
      this.prisma.usuarios.findMany({
        where: {
          business_id: businessId,
          rol: 'PACIENTE',
          esta_activo: true,
        },
        orderBy: { creado_en: 'desc' },
        take: 5,
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          email: true,
          movil1: true,
          creado_en: true,
        },
      }),
    ]);

    const statusMap = this.toStatusMap(todayStatusCounts);
    const doctorIds = professionalOccupancy.map((item) => item.doctor_id);
    const doctors = doctorIds.length
      ? await this.prisma.usuarios.findMany({
          where: { id: { in: doctorIds } },
          select: { id: true, nombres: true, apellidos: true },
        })
      : [];
    const doctorById = new Map(doctors.map((doctor) => [doctor.id, doctor]));
    const staffMap = new Map(staffTotals.map((item) => [item.rol, item._count._all]));
    const budgetsCount = budgetTotals._count._all;
    const acceptedBudgetsCount = acceptedBudgetTotals._count._all;

    return {
      business,
      period: {
        generatedAt: now.toISOString(),
        today: startToday.toISOString(),
        weekStart: startWeek.toISOString(),
        monthStart: startMonth.toISOString(),
      },
      operations: {
        appointmentsToday: this.sumStatusCounts(statusMap),
        confirmedToday: statusMap.CONFIRMADA ?? 0,
        pendingToday: statusMap.PENDIENTE ?? 0,
        cancelledToday: statusMap.CANCELADA ?? 0,
        completedToday: (statusMap.COMPLETADA ?? 0) + (statusMap.FINALIZADA ?? 0),
        noShowsToday: statusMap.AUSENTE ?? 0,
        upcomingAppointments,
      },
      patients: {
        total: patientTotals,
        newToday: newPatientsToday,
        newThisMonth: newPatientsMonth,
        recent: recentPatients,
      },
      staff: {
        admins: staffMap.get('ADMIN') ?? 0,
        doctors: staffMap.get('DOCTOR') ?? 0,
        assistants: staffMap.get('ASISTENTE') ?? 0,
      },
      financial: {
        estimatedWeeklyProduction: this.decimalToNumber(weeklyProduction._sum.precioEstimado),
        estimatedMonthlyProduction: this.decimalToNumber(monthlyProduction._sum.precioEstimado),
        budgetsThisMonth: budgetsCount,
        acceptedBudgetsThisMonth: acceptedBudgetsCount,
        pendingBudgetsThisMonth: pendingBudgetTotals._count._all,
        acceptedBudgetAmount: this.decimalToNumber(acceptedBudgetTotals._sum.importe_total),
        pendingBudgetAmount: this.decimalToNumber(pendingBudgetTotals._sum.importe_total),
        acceptanceRate: budgetsCount > 0 ? Math.round((acceptedBudgetsCount / budgetsCount) * 100) : 0,
      },
      occupancy: {
        byProfessional: professionalOccupancy.map((item) => {
          const doctor = doctorById.get(item.doctor_id);
          return {
            doctorId: item.doctor_id,
            doctorName: doctor ? `${doctor.nombres} ${doctor.apellidos}` : 'Profesional no disponible',
            appointmentsThisWeek: item._count._all,
          };
        }),
      },
      alerts: this.buildAlerts({
        business,
        doctors: staffMap.get('DOCTOR') ?? 0,
        appointmentsToday: this.sumStatusCounts(statusMap),
        pendingBudgets: pendingBudgetTotals._count._all,
      }),
    };
  }

  private toStatusMap(counts: AppointmentStatusCount[]) {
    return counts.reduce<Record<string, number>>((acc, item) => {
      acc[item.estado] = item._count._all;
      return acc;
    }, {});
  }

  private sumStatusCounts(statusMap: Record<string, number>) {
    return Object.values(statusMap).reduce((total, value) => total + value, 0);
  }

  private decimalToNumber(value: Prisma.Decimal | null | undefined) {
    return value ? Number(value) : 0;
  }

  private buildAlerts(input: {
    business: { email: string | null; telefono: string | null; direccion: string | null } | null;
    doctors: number;
    appointmentsToday: number;
    pendingBudgets: number;
  }) {
    const alerts: Array<{ type: 'info' | 'warning' | 'success'; title: string; detail: string }> = [];

    if (!input.business?.email || !input.business?.telefono || !input.business?.direccion) {
      alerts.push({
        type: 'warning',
        title: 'Configuracion de clinica incompleta',
        detail: 'Completa email, telefono y direccion para mejorar la experiencia publica y operativa.',
      });
    }

    if (input.doctors === 0) {
      alerts.push({
        type: 'warning',
        title: 'Sin doctores activos',
        detail: 'Agrega al menos un doctor para permitir agenda, registro de pacientes y asignacion clinica.',
      });
    }

    if (input.pendingBudgets > 0) {
      alerts.push({
        type: 'info',
        title: 'Presupuestos pendientes',
        detail: `Hay ${input.pendingBudgets} presupuesto(s) del mes sin aceptacion economica.`,
      });
    }

    if (input.appointmentsToday === 0) {
      alerts.push({
        type: 'info',
        title: 'Agenda del dia libre',
        detail: 'No hay citas programadas para hoy. Revisa proximas citas o acciones comerciales.',
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: 'Operacion estable',
        detail: 'No se detectan alertas administrativas criticas con los datos actuales.',
      });
    }

    return alerts;
  }
}
