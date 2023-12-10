import { ApiProperty } from '@nestjs/swagger';

export class MedicineEntity {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
