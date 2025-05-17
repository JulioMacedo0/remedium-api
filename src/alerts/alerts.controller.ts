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
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

import { UpdateAlertDto } from './dto/update-alert.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';
import { createAlertValidationSchema } from 'src/shared/validation-schema/alert';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { DebugNotificationDto } from './dto/debug-notification.dto';

@Controller('api/v1/alerts')
@UseGuards(JwtAuthGuard)
@ApiTags('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAlertValidationSchema))
  create(
    @Body() createAlertDto: CreateAlertDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.alertsService.create(jwt.id, createAlertDto);
  }

  @Post('debug')
  @ApiOperation({
    summary: 'Send a test notification to a specific OneSignal device',
  })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Player ID not provided' })
  sendDebugNotification(@Body() debugDto: DebugNotificationDto) {
    return this.alertsService.sendDebugNotification(debugDto);
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
