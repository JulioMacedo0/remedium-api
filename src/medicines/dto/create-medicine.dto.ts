import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicine name is required' })
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  @IsNotEmpty({ message: 'userId is required' })
  userId: number;
}
