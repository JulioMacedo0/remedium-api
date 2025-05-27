import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MedicineEntity } from './entities/medicine.entity';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { medicineValidationSchema } from 'src/shared/validation-schema/medicine';

@Controller('api/v1/medicines')
@ApiTags('medicines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @UsePipes(new ZodValidationPipe(medicineValidationSchema))
  @Post()
  @ApiOperation({
    summary: 'Create a new medicine',
    description:
      'Creates a new medicine entry for the currently authenticated user',
  })
  @ApiCreatedResponse({
    description: 'Medicine successfully created',
    type: MedicineEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  create(
    @GetJwtPayload() jwt: JwtEnity,
    @Body() createMedicineDto: CreateMedicineDto,
  ) {
    return this.medicinesService.create(jwt.id, createMedicineDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all medicines',
    description:
      'Retrieves all medicines belonging to the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Medicines successfully retrieved',
    type: MedicineEntity,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  findAll(@GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findAll(jwt.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific medicine',
    description:
      'Retrieves a specific medicine by ID if it belongs to the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Medicine ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Medicine successfully retrieved',
    type: MedicineEntity,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - medicine does not belong to this user or invalid JWT',
  })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  findOne(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.medicinesService.findOne(id, jwt.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update medicine',
    description: 'Updates a specific medicine with provided new data',
  })
  @ApiParam({
    name: 'id',
    description: 'Medicine ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Medicine successfully updated',
    type: MedicineEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete medicine',
    description: 'Permanently deletes a specific medicine',
  })
  @ApiParam({
    name: 'id',
    description: 'Medicine ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Medicine successfully deleted',
    type: MedicineEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }

  @Get('/decrement/:id/:quantity')
  @ApiOperation({
    summary: 'Decrement medicine quantity',
    description:
      'Decreases the quantity of a specific medicine by the specified amount',
  })
  @ApiParam({
    name: 'id',
    description: 'Medicine ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'quantity',
    description: 'Amount to decrease',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Medicine quantity successfully decreased',
    type: MedicineEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  decrement(@Param('id') id: string, @Param('quantity') quantity: string) {
    return this.medicinesService.decrement(id, +quantity);
  }
}
