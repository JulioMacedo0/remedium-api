import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  create(id: string, createMedicineDto: CreateMedicineDto) {
    return this.prisma.medicine.create({
      data: {
        name: createMedicineDto.name,
        quantity: createMedicineDto.quantity,
        user: {
          connect: { id },
        },
      },
    });
  }

  async findAll(id: string) {
    return await this.prisma.medicine.findMany({
      where: { userId: id },
    });
  }

  async findOne(id: string, userId: string) {
    const medicine = await this.prisma.medicine.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (medicine.userId != userId) throw new UnauthorizedException();

    return medicine;
  }

  async update(
    id: string,
    updateMedicineDto: UpdateMedicineDto,
    userId: string,
  ) {
    const medicine = await this.prisma.medicine.update({
      where: { id },
      data: updateMedicineDto,
    });

    return medicine;
  }

  async remove(id: string, userId: string) {
    const medicine = await this.prisma.medicine.delete({
      where: { id },
    });

    return medicine;
  }

  decrement(id: string, quantity: number) {
    return this.prisma.medicine.update({
      where: { id },
      data: { quantity: { decrement: quantity } },
    });
  }
}
