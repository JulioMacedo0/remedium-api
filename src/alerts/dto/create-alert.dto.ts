import { ApiProperty } from '@nestjs/swagger';
import { Alert, Trigger, unitOfMeasurament } from '@prisma/client';

export class CreateAlertDto implements Alert {
  @ApiProperty()
  title: string;

  @ApiProperty()
  subtitle: string;

  @ApiProperty()
  unit_of_measurement: unitOfMeasurament;

  @ApiProperty()
  body: string;

  @ApiProperty()
  trigger: Trigger;

  @ApiProperty()
  medicine_id: string;

  createdAt: Date;
  id: string;
  updatedAt: Date;
  userId: string;
}
