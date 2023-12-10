import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';

@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  create(
    @GetJwtPayload() jwt: JwtEnity,
    @Body() createMedicineDto: CreateMedicineDto,
  ) {
    return this.medicinesService.create(jwt.id, createMedicineDto);
  }

  @Get()
  findAll(@GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findAll(jwt.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findOne(id, jwt.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.medicinesService.update(id, updateMedicineDto, jwt.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.remove(id, jwt.id);
  }
}
