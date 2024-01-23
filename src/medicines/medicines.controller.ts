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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MedicineEntity } from './entities/medicine.entity';

@Controller('api/v1/medicines')
@ApiTags('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @ApiOkResponse({ type: MedicineEntity })
  create(
    @GetJwtPayload() jwt: JwtEnity,
    @Body() createMedicineDto: CreateMedicineDto,
  ) {
    return this.medicinesService.create(jwt.id, createMedicineDto);
  }

  @Get()
  @ApiOkResponse({ type: MedicineEntity, isArray: true })
  findAll(@GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findAll(jwt.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: MedicineEntity })
  findOne(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findOne(id, jwt.id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MedicineEntity })
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: MedicineEntity })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }

  @Get('/decrement/:id/:quantity')
  @ApiOkResponse({ type: MedicineEntity })
  decrement(@Param('id') id: string, @Param('quantity') quantity: string) {
    return this.medicinesService.decrement(id, +quantity);
  }
}
