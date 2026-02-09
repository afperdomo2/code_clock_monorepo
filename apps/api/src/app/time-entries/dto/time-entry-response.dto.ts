import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TimeEntryResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  project_id!: string;

  @ApiProperty()
  @Expose()
  activity_type!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty()
  @Expose()
  date!: Date;

  @ApiProperty()
  @Expose()
  duration!: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  end_time?: Date | null;

  @ApiProperty()
  @Expose()
  created_at!: Date;
}
