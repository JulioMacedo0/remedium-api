import { ApiProperty } from '@nestjs/swagger';

export class MedicineEntity {
  @ApiProperty({
    description: 'Unique identifier for the medicine',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the medicine',
    example: 'Ibuprofen',
  })
  name: string;

  @ApiProperty({
    description: 'Quantity of medicine remaining',
    example: 30,
  })
  quantity: number;

  @ApiProperty({
    description: 'ID of the user who owns this medicine',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'When the medicine was created',
    example: '2025-05-27T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the medicine was last updated',
    example: '2025-05-27T10:30:00Z',
  })
  updatedAt: Date;
}
