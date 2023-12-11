import { ApiProperty } from '@nestjs/swagger';
import { unitOfMeasurament } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAlertDto {
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
  unit_of_measurement: unitOfMeasurament;

  @IsString()
  @IsNotEmpty({ message: 'Body is required' })
  @ApiProperty()
  body: string;
}
