import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto';

@Injectable()
export class AnamnesisService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: CreateAnamnesisDto) {
    const { paciente_id, ...data } = dto;

    // Convertir ultima_visita_dental de string a Date si existe
    const mappedData: any = { ...data };
    if (mappedData.ultima_visita_dental) {
      mappedData.ultima_visita_dental = new Date(mappedData.ultima_visita_dental);
    }

    return this.prisma.anamnesis.upsert({
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
    const anamnesis = await this.prisma.anamnesis.findUnique({
      where: { paciente_id: pacienteId },
    });

    if (!anamnesis) {
      return null;
    }

    return anamnesis;
  }
}
