import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeliverableResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  project_id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  deadline?: Date | null;

  @ApiProperty()
  @Expose()
  completed!: boolean;

  @ApiProperty()
  @Expose()
  created_at!: Date;
}
