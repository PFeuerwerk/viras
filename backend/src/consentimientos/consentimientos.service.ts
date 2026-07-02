import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateConsentimientosDto } from './dto/update-consentimientos.dto';

@Injectable()
export class ConsentimientosService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: UpdateConsentimientosDto) {
    const { paciente_id, ...data } = dto as any;
    
    const mappedData: any = { ...data };

    // Convertir fechas si existen
    const dateFields = ['general_fecha', 'anestesia_fecha', 'lopd_fecha', 'representante_fecha', 'politicas_fecha'];
    dateFields.forEach(field => {
      if (mappedData[field]) {
        mappedData[field] = new Date(mappedData[field]);
      }
    });

    return this.prisma.consentimientos.upsert({
      where: { paciente_id },
      update: {
        ...mappedData,
        actualizado_en: new Date(),
      },
      create: {
        paciente_id,
        ...mappedData,
      },
    });
  }

  async findOne(pacienteId: string) {
    return this.prisma.consentimientos.findUnique({
      where: { paciente_id: pacienteId },
    });
  }
}
