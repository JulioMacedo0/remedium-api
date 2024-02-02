import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;
}
