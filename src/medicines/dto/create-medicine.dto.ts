import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({
    description: 'Name of the medicine',
    example: 'Ibuprofen',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Quantity of medicine units',
    example: 30,
    required: true,
    minimum: 1,
  })
  quantity: number;
}
