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
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiTags('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(
    @Body() createAlertDto: CreateAlertDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.alertsService.create(jwt.id, createAlertDto);
  }

  @Get()
  findAll(@GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.findAll(jwt.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.findOne(id, jwt.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.alertsService.update(id, updateAlertDto, jwt.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.remove(id, jwt.id);
  }
}
