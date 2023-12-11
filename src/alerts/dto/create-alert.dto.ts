import { ApiProperty } from '@nestjs/swagger';
import { Alert, unitOfMeasurament } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAlertDto implements Alert {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Subtitle is required' })
  @ApiProperty()
  subtitle: string;

  @IsNotEmpty({ message: 'Unit of Measurament is required' })
  @ApiProperty()
  @IsEnum(unitOfMeasurament, {
    message: `Unit of measurement must be one of the following values: [${Object.keys(
      unitOfMeasurament,
    )}]`,
  })
  unit_of_measurement: unitOfMeasurament;

  @IsString()
  @IsNotEmpty({ message: 'Body is required' })
  @ApiProperty()
  body: string;

  createdAt: Date;
  id: string;
  updatedAt: Date;
  userId: string;
}
