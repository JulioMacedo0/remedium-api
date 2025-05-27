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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';
import { createAlertValidationSchema } from 'src/shared/validation-schema/alert';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { DebugNotificationDto } from './dto/debug-notification.dto';
import { Alert } from './entities/alert.entity';

@Controller('api/v1/alerts')
@UseGuards(JwtAuthGuard)
@ApiTags('alerts')
@ApiBearerAuth('JWT-auth')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAlertValidationSchema))
  @ApiOperation({
    summary: 'Create a new alert',
    description:
      'Creates a new medication reminder alert for the authenticated user',
  })
  @ApiCreatedResponse({
    description: 'Alert successfully created',
    type: Alert,
  })
  @ApiBadRequestResponse({
    description: 'Invalid alert data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  create(
    @Body() createAlertDto: CreateAlertDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.alertsService.create(jwt.id, createAlertDto);
  }

  @Post('debug')
  @ApiOperation({
    summary: 'Send a test notification to a specific OneSignal device',
    description:
      'Used for testing push notification delivery to a specific device',
  })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Player ID not provided' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  sendDebugNotification(@Body() debugDto: DebugNotificationDto) {
    return this.alertsService.sendDebugNotification(debugDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all alerts',
    description: 'Retrieves all alerts belonging to the authenticated user',
  })
  @ApiOkResponse({
    description: 'Alerts successfully retrieved',
    type: Alert,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  findAll(@GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.findAll(jwt.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific alert',
    description:
      'Retrieves a specific alert by ID if it belongs to the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Alert successfully retrieved',
    type: Alert,
  })
  @ApiNotFoundResponse({
    description: 'Alert not found',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - alert does not belong to this user or invalid JWT',
  })
  findOne(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.findOne(id, jwt.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an alert',
    description:
      'Updates a specific alert with new data if it belongs to the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Alert successfully updated',
    type: Alert,
  })
  @ApiNotFoundResponse({
    description: 'Alert not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid alert data provided',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - alert does not belong to this user or invalid JWT',
  })
  update(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
    @GetJwtPayload() jwt: JwtEnity,
  ) {
    return this.alertsService.update(id, updateAlertDto, jwt.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an alert',
    description:
      'Permanently deletes a specific alert if it belongs to the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Alert successfully deleted',
    type: Alert,
  })
  @ApiNotFoundResponse({
    description: 'Alert not found',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - alert does not belong to this user or invalid JWT',
  })
  remove(@Param('id') id: string, @GetJwtPayload() jwt: JwtEnity) {
    return this.alertsService.remove(id, jwt.id);
  }
}
