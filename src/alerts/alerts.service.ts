import { Injectable } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}
  create(id: string, createAlertDto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: {
        title: createAlertDto.title,
        body: createAlertDto.body,
        subtitle: createAlertDto.subtitle,
        unit_of_measurement: createAlertDto.unit_of_measurement,
        user: {
          connect: { id },
        },
      },
    });
  }

  findAll() {
    return `This action returns all alerts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} alert`;
  }

  update(id: number, updateAlertDto: UpdateAlertDto) {
    return `This action updates a #${id} alert`;
  }

  remove(id: number) {
    return `This action removes a #${id} alert`;
  }
}
